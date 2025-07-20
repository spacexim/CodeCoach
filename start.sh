#!/bin/bash

# CodeCoach 一键启动脚本

echo "🚀 启动 CodeCoach AI 学习助手..."

# 启动后端
echo "📡 启动后端服务..."
cd backend
python main.py &
BACKEND_PID=$!

# 等待后端启动
sleep 3

# 启动前端
echo "🎨 启动前端服务..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!

echo "✅ 服务启动完成！"
echo "📱 前端地址: http://localhost:5173"
echo "🔧 后端地址: http://localhost:8000"
echo "📚 API文档: http://localhost:8000/docs"

# 等待用户停止
echo "按 Ctrl+C 停止所有服务..."
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
