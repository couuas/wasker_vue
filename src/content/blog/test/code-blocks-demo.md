---
title: "Deep Dive into Code Blocks"
date: "2023-03-02"
image: "/assets/img-dark/blog/5.jpg"
description: "Testing various programming languages in markdown code blocks."
---

# JavaScript

```javascript
function helloWorld() {
  console.log("Hello, World!");
  const arr = [1, 2, 3];
  return arr.map(x => x * 2);
}
```

# Python

```python
def fibonacci(n):
    if n <= 1:
        return n
    else:
        return fibonacci(n-1) + fibonacci(n-2)

print(fibonacci(10))
```

# CSS

```css
.container {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f0f0f0;
}
```

# HTML

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Document</title>
</head>
<body>
    <h1>Hello World</h1>
</body>
</html>
```

# C++

```cpp
#include <iostream>

int main() {
    std::cout << "Hello World!";
    return 0;
}
```
