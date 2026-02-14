<script setup>
import { onMounted, onUnmounted, ref } from 'vue';

// Canvas properties
const canvasRef = ref(null);
const maxStars = 500; // Number of stars to render
const starSpeed = 0.05;

let stars = [];
let animationFrameId;

// Star class for handling the properties and movement of stars
class Star {
  constructor(canvasWidth, canvasHeight) {
    this.x = Math.random() * canvasWidth;
    this.y = Math.random() * canvasHeight;
    this.z = Math.random() * canvasWidth;
    this.prevX = null;
    this.prevY = null;
  }

  update(canvasWidth, canvasHeight) {
    this.prevX = this.x;
    this.prevY = this.y;
    this.z -= starSpeed;

    if (this.z <= 0) {
      this.z = canvasWidth;
      this.x = Math.random() * canvasWidth;
      this.y = Math.random() * canvasHeight;
      this.prevX = this.x;
      this.prevY = this.y;
    }

    const scale = canvasWidth / this.z;
    this.x = (this.x - canvasWidth / 2) * scale + canvasWidth / 2;
    this.y = (this.y - canvasHeight / 2) * scale + canvasHeight / 2;
  }
}

const createStars = (count, canvasWidth, canvasHeight) => {
  const starsArray = [];
  for (let i = 0; i < count; i++) {
    starsArray.push(new Star(canvasWidth, canvasHeight));
  }
  return starsArray;
};

// Starfield animation logic
const render = (ctx, canvasWidth, canvasHeight) => {
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  ctx.fillStyle = 'white'; // Star color
  ctx.strokeStyle = 'white';

  for (const star of stars) {
    star.update(canvasWidth, canvasHeight);

    if (star.prevX !== null && star.prevY !== null) {
      ctx.beginPath();
      ctx.moveTo(star.prevX, star.prevY);
      ctx.lineTo(star.x, star.y);
      ctx.stroke();
    }

    ctx.fillRect(star.x, star.y, 1, 1); // Render star as a 1x1 pixel
  }
};

onMounted(() => {
  const canvas = canvasRef.value;
  const ctx = canvas.getContext('2d');

  const resizeCanvas = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    stars = createStars(maxStars, canvas.width, canvas.height);
  };

  window.addEventListener('resize', resizeCanvas);

  resizeCanvas();

  const animate = () => {
    render(ctx, canvas.width, canvas.height);
    animationFrameId = requestAnimationFrame(animate);
  };

  animate();
});

onUnmounted(() => {
  window.removeEventListener('resize', () => {});
  cancelAnimationFrame(animationFrameId);
});
</script>

<template>
  <canvas ref="canvasRef" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></canvas>
</template>
