---
title: "Python for Data Science"
date: "2023-03-04"
category: "Data"
image: "/assets/img-dark/blog/7.jpg"
description: "Using Pandas and NumPy for data analysis."
---

## Pandas Basics

```python
import pandas as pd

df = pd.DataFrame({
    'A': [1, 2, 3],
    'B': [4, 5, 6]
})

print(df.head())
```

## NumPy Arrays

```python
import numpy as np

arr = np.array([1, 2, 3, 4, 5])
print(arr.mean())
```

## Matplotlib Plotting

```python
import matplotlib.pyplot as plt

x = [1, 2, 3, 4]
y = [10, 20, 25, 30]

plt.plot(x, y)
plt.show()
```
