<script setup>
import { onMounted, ref, onUnmounted, watch, toRaw } from 'vue';
import * as THREE from 'three';
import ForceGraph3D from '3d-force-graph';


const props = defineProps({
  graphData: {
    type: Object,
    default: () => ({ nodes: [], links: [] })
  },
  onNodeClick: {
    type: Function,
    default: () => {}
  },
  selectedNodeId: {
    type: String,
    default: null
  }
});

const galaxyContainer = ref(null);
let graph = null;
let resizeObserver = null;

// Resource Cache to prevent redundant object creation
const materialCache = new Map();
const textureCache = new Map();

function getOrCreateNodeMaterial(category, isSelected = false) {
    const cacheKey = `${category}-${isSelected}`;
    if (materialCache.has(cacheKey)) return materialCache.get(cacheKey);

    const color = isSelected ? '#DBA91C' : getNodeColor(category);
    
    // Create Texture with "Glitch" influence
    let texture = textureCache.get(`${color}-${isSelected}`);
    if (!texture) {
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const context = canvas.getContext('2d');
        
        // Base Glow
        const gradient = context.createRadialGradient(32, 32, 0, 32, 32, 32);
        gradient.addColorStop(0, color);
        gradient.addColorStop(0.2, color);
        gradient.addColorStop(0.5, 'rgba(' + hexToRgb(color) + ', 0.3)');
        gradient.addColorStop(1, 'rgba(0,0,0,0)');
        
        context.fillStyle = gradient;
        context.fillRect(0, 0, 64, 64);

        // Subtle Glitch Lines for selected nodes
        if (isSelected) {
            context.strokeStyle = '#ffffff';
            context.lineWidth = 1;
            for(let i=0; i<3; i++) {
                const y = Math.random() * 64;
                context.beginPath();
                context.moveTo(10, y);
                context.lineTo(54, y);
                context.stroke();
            }
        }
        
        texture = new THREE.CanvasTexture(canvas);
        textureCache.set(`${color}-${isSelected}`, texture);
    }

    const material = new THREE.SpriteMaterial({ 
        map: texture,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    });
    
    materialCache.set(cacheKey, material);
    return material;
}

const focusNode = (node) => {
  if (!graph || !node) return;
  
  // Safety: If passing a raw node from outside (Vue state), it might not have current x,y,z
  // or it might be a different object reference due to structuredClone.
  // We must find the actual positioned node in the graph by ID.
  const internalNode = graph.graphData().nodes.find(n => n.id === (node.id || node));
  
  if (!internalNode || internalNode.x === undefined || isNaN(internalNode.x)) {
      console.warn('Galaxy3D: Cannot focus node, coordinates not ready.', node.id);
      return;
  }

  const distance = 80;
  
  graph.cameraPosition(
    { x: internalNode.x, y: internalNode.y, z: internalNode.z + distance },
    internalNode, // look-at node
    2000 
  );
};

const resetView = () => {
    if (!graph) return;
    graph.zoomToFit(2000);
    const controls = graph.controls();
    if (controls) {
        controls.autoRotate = true;
    }
};

defineExpose({ focusNode, resetView });


onMounted(async () => {
  // Initialize graph
  graph = ForceGraph3D()(galaxyContainer.value)
    .graphData(structuredClone(toRaw(props.graphData)))
    .backgroundColor('#000005') // Deep black
    .showNavInfo(false)
    .cameraPosition({ z: 1200 }) // Start far away to prevent "shrinking" stutter
    .nodeLabel('name') // Show name on hover
    .nodeRelSize(4)
    .linkWidth(1)
    .linkOpacity(0.3)
    .linkColor(() => '#ffffff') // White links
    .nodeThreeObject(node => {
      const isSelected = node.id === props.selectedNodeId;
      const material = getOrCreateNodeMaterial(node.category, isSelected);
      const sprite = new THREE.Sprite(material);
      
      // Scale based on "val" (citation count/weight)
      let scale = 4 + (node.val || 0) * 2;
      if (isSelected) scale *= 1.5;
      sprite.scale.set(scale, scale, scale);
      
      return sprite;
    })
    .enableNodeDrag(false) // Disable dragging to prevent nodes from scattering and improve navigation
    .onNodeClick(node => {
        focusNode(node);
        props.onNodeClick(node);
    })
    .onBackgroundClick(() => {
        // Reset view or just close bottom sheet
        props.onNodeClick(null);
    })
    .onNodeHover(node => {
        // Desktop only: change cursor and maybe highlight
        if (window.innerWidth > 1200) {
            galaxyContainer.value.style.cursor = node ? 'pointer' : null;
        }
    });

  // Optimize simulation speed - Now using static coordinates
  graph.cooldownTicks(0);       // Instant start - no dynamic simulation needed
  graph.d3AlphaDecay(0);        // Prevent further movement
  graph.d3VelocityDecay(0);     
  
  // Custom force to keep separate clusters from drifting too far
  // This pulls nodes towards the center even if they aren't linked to the origin
  graph.d3Force('charge').strength(-40); // Slightly weaker repulsion
  graph.d3Force('center').strength(0.8); // Stronger centering
  
  // Track initial load to auto-fit view once
  let initialFitDone = false;
  graph.onEngineStop(() => {
    if (!initialFitDone && graph.graphData().nodes.length > 0) {
      setTimeout(() => {
          // First fit should be very fast or instant to hide jumping
          graph.zoomToFit(2000); 
          initialFitDone = true;
      }, 50);
    }
  });  // Custom controls settings based on device
  const controls = graph.controls();
  if (controls) {
      controls.enableDamping = true;
      controls.dampingFactor = 0.1;
      // Disable panning to keep the galaxy centered
      controls.enablePan = false;
      
      // Aesthetic: Idle rotation
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.5;
  }

  // Add background cosmic dust
  addCosmicDust(graph.scene());

  // Disable auto-rotate on interaction
  const stopAutoRotate = () => {
      if (controls) controls.autoRotate = false;
  };
  galaxyContainer.value.addEventListener('mousedown', stopAutoRotate);
  galaxyContainer.value.addEventListener('touchstart', stopAutoRotate);

  resizeObserver = new ResizeObserver(() => {
    if (graph && galaxyContainer.value) {
      const { clientWidth, clientHeight } = galaxyContainer.value;
      graph.width(clientWidth);
      graph.height(clientHeight);
    }
  });
  resizeObserver.observe(galaxyContainer.value);

  // Watch for data changes (async load from parent)
  watch(() => props.graphData, (newData) => {
    if (graph && newData && newData.nodes && newData.nodes.length > 0) {
      // Capture current camera state to prevent jumps during language switch
      const camPos = graph.cameraPosition();
      const camLookAt = graph.controls().target.clone();
      
      graph.graphData(structuredClone(toRaw(newData)));
      
      // Restore camera state after a short delay to ensure internal library resets are bypassed
      if (initialFitDone) {
          setTimeout(() => {
              if (graph) {
                  graph.cameraPosition(camPos, camLookAt, 0);
              }
          }, 50);
      }
      
      // If it's the very first time we get real data, ensure we fit view 
      if (!initialFitDone) {
          setTimeout(() => {
              if (!initialFitDone && graph) {
                  graph.zoomToFit(2000); // Align with resetView feel
                  initialFitDone = true;
              }
          }, 100);
      }
    }
  }, { deep: true });

  // Watch for selection changes to update colors
  watch(() => props.selectedNodeId, () => {
    if (graph) {
        // Refresh individual nodes to update colors/scales
        graph.nodeThreeObject(graph.nodeThreeObject());
    }
  });
  
});

onUnmounted(() => {
    if (resizeObserver) resizeObserver.disconnect();
    if (graph) {
        graph._destructor();
    }
    // Clear caches
    materialCache.forEach(m => m.dispose());
    textureCache.forEach(t => t.dispose());
    materialCache.clear();
    textureCache.clear();
});

function getNodeColor(category) {
    const colors = {
        'Design': '#00d2ff', // Blue
        'Code': '#00ff41',   // Green
        'Essay': '#ffffff',  // White
        'Life': '#ff0055',   // Red/Pink
    };
    return colors[category] || '#ffffff';
}

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? 
        parseInt(result[1], 16) + ',' + parseInt(result[2], 16) + ',' + parseInt(result[3], 16)
        : '255,255,255';
}

function addCosmicDust(scene) {
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    const count = window.innerWidth < 768 ? 500 : 1500; // Reduce count on mobile
    for (let i = 0; i < count; i++) {
        vertices.push(
            Math.random() * 2000 - 1000,
            Math.random() * 2000 - 1000,
            Math.random() * 2000 - 1000
        );
    }
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    const material = new THREE.PointsMaterial({
        color: 0x888888,
        size: 1.5,
        transparent: true,
        opacity: 0.5,
        sizeAttenuation: true
    });
    const points = new THREE.Points(geometry, material);
    scene.add(points);
}

</script>

<template>
  <div ref="galaxyContainer" class="galaxy-container"></div>
</template>

<style scoped>
.galaxy-container {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 10;
  overflow: hidden;
}
</style>
