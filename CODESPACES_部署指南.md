# 🚀 CodeCoach - 5分钟部署指南

## 🎯 GitHub Codespaces 一键部署

### 第一步：创建 Codespace

1. **打开 GitHub 仓库**: https://github.com/spacexim/CodeCoach
2. **点击绿色的 "Code" 按钮**
3. **选择 "Codespaces" 标签**
4. **点击 "Create codespace on main"**
5. **等待环境启动（约2-3分钟）**

### 第二步：启动项目

在 Codespace 终端中运行：

```bash
# 方式1：使用启动脚本
chmod +x start.sh
./start.sh
```

或者分别启动：

```bash
# 启动后端
cd backend
python main.py &

# 启动前端（新终端）
cd frontend
npm run dev
```

### 第三步：获取公网访问

1. **查看端口**: 点击底部的 "PORTS" 标签
2. **找到端口 5173（前端）**
3. **点击端口旁的 🌐 图标**
4. **选择 "Make Public"**
5. **复制公网 URL**

### 第四步：分享给导师

**访问链接**: 您的 Codespace 前端公网 URL

## ✅ 完成！

现在您有了：
- 📱 可分享的公网访问链接
- 🔧 完整的 AI 学习功能
- 💰 完全免费的云端部署
- ⚡ 5分钟搞定的简单流程

## 🔧 如果需要停止服务

```bash
# 如果使用启动脚本
Ctrl + C

# 如果分别启动
pkill -f "python main.py"
pkill -f "npm run dev"
```

## 📞 故障排除

如果遇到问题：
1. 检查环境变量是否设置（OPENROUTER_API_KEY）
2. 确保端口 5173 和 8000 都正常运行
3. 查看终端错误信息

---

**🎉 现在就可以向导师展示您的 AI 编程学习助手了！**
