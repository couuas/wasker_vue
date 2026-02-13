---
title: "TRICYS Ecosystem"
date: 2026-02-13
category: "Engineering & Simulation"
description: "A comprehensive simulation system for fusion fuel cycle analysis, including backend APIs and visualization platforms."
---

## 核心项目集 (Project Suite)

### 1. TRICYS (Core)
**TRICYS (TRitium Integrated CYcle Simulation)** 是一个用于分析聚变燃料循环的模拟系统，基于 **OpenModelica** 平台开发。它是整个生态系统的物理与逻辑核心。

### 2. TRICYS Backend
为了提升用户体验并扩展应用场景（如 Web 远程访问或现代桌面客户端），我为 TRICYS 构建了后端包装层。
- **技术栈**：Python / RESTful API / WebSocket
- **功能**：抽象底层 CLI 调用，暴露统一标准化的接口。

### 3. TRICYS Visualization & GoView
针对模拟数据提供直观的可视化方案。
- **tricys_visual**: 配置、监控与展示平台。
- **tricys_goview**: 基于 GoView 的低代码大屏展示集成。

---

## 项目价值
该生态系统实现了从复杂物理建模到直观前端展示的全链路闭环，为科研与工业应用提供了高效的决策支持。
