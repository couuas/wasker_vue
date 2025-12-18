---
title: "Advanced CSS Layouts"
date: "2023-03-05"
category: "Design"
image: "/assets/img-dark/blog/8.jpg"
description: "Mastering Flexbox and Grid."
---

## Flexbox Centering

The holy grail of layout:

```css
.center-me {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}
```

## CSS Grid

```css
.grid-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.grid-item {
  background-color: #ccc;
  padding: 20px;
}
```
