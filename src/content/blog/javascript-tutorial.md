---
title: "Modern JavaScript Features"
date: "2023-03-03"
category: "Code"
image: "/assets/img-dark/blog/6.jpg"
description: "Exploring ES6+ features with code examples."
---

## Arrow Functions

```javascript
const add = (a, b) => a + b;
```

## Destructuring

```javascript
const person = { name: 'John', age: 30 };
const { name, age } = person;
console.log(name); // John
```

## Async/Await

```javascript
async function fetchData() {
  try {
    const response = await fetch('https://api.example.com/data');
    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error('Error:', error);
  }
}
```
