<script setup>
import { onMounted, ref, onUnmounted, watch, toRaw } from 'vue';
import ForceGraph3D from '3d-force-graph';
import * as THREE from 'three';

const props = defineProps({
  graphData: {
    type: Object,
    default: () => ({ nodes: [], links: [] })
  },
  onNodeClick: {
    type: Function,
    default: () => {}
  }
});

const galaxyContainer = ref(null);
let graph = null;

const focusNode = (node) => {
  if (!graph || !node) return;
  
  const distance = 80;
  
  // Directly move camera to a position relative to the node
  // This avoids the 'approaching and then distancing' effect caused by vector scaling
  graph.cameraPosition(
    { x: node.x, y: node.y, z: node.z + distance },
    node, // look-at node
    2000  // Slightly faster transition for snappier feel
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
    .graphData(toRaw(props.graphData))
    .backgroundColor('#000005') // Deep black
    .showNavInfo(false)
    .nodeLabel('name') // Show name on hover
    .nodeRelSize(4)
    .linkWidth(1)
    .linkOpacity(0.3)
    .linkColor(() => '#ffffff') // White links
    .nodeThreeObject(node => {
      // Create a sprite for the node
      // Using a simple circle texture generated on canvas for performance/simplicity
      // or we could load a "glow.png" if we had one.
      // Let's generate a glowing circle texture.
      
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 64;
      const context = canvas.getContext('2d');
      const gradient = context.createRadialGradient(32, 32, 0, 32, 32, 32);
      
      // Color based on category (simple hash or preset)
      const color = getNodeColor(node.category);
      
      gradient.addColorStop(0, color);
      gradient.addColorStop(0.2, color);
      gradient.addColorStop(0.5, 'rgba(' + hexToRgb(color) + ', 0.3)');
      gradient.addColorStop(1, 'rgba(0,0,0,0)');
      
      context.fillStyle = gradient;
      context.fillRect(0, 0, 64, 64);
      
      const texture = new THREE.CanvasTexture(canvas);
      const material = new THREE.SpriteMaterial({ 
          map: texture,
          transparent: true,
          depthWrite: false,
          blending: THREE.AdditiveBlending
      });
      const sprite = new THREE.Sprite(material);
      
      // Scale based on "val" (citation count/weight)
      const scale = 4 + (node.val || 0) * 2;
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

  // Optimize simulation speed
  graph.cooldownTicks(60);      // Extremely fast stabilization for instant feedback
  graph.d3AlphaDecay(0.1);      // Even more aggressive settling (was 0.08)
  graph.d3VelocityDecay(0.6);   // Higher friction to prevent "jitter" (was 0.4)
  
  // Custom force to keep separate clusters from drifting too far
  // This pulls nodes towards the center even if they aren't linked to the origin
  graph.d3Force('charge').strength(-40); // Slightly weaker repulsion
  graph.d3Force('center').strength(0.8); // Stronger centering
  
  // Track initial load to auto-fit view once
  let initialFitDone = false;
  graph.onEngineStop(() => {
    if (!initialFitDone) {
      graph.zoomToFit(1000, 150); // Faster animation, generous padding
      initialFitDone = true;
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

  // Handle container resizing
  const resizeObserver = new ResizeObserver(() => {
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
      graph.graphData(toRaw(newData));
      // Reset fit flag so it frames the newly loaded data
      initialFitDone = false;
    }
  }, { deep: true });
  
  onUnmounted(() => {
      resizeObserver.disconnect();
      if (graph) {
          graph._destructor();
      }
  });
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
    for (let i = 0; i < 2000; i++) {
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
