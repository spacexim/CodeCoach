#!/bin/bash

# Codespace 修复脚本
echo "🔧 修复 Codespace 环境变量..."

# 创建前端环境变量文件
cd /workspaces/CodeCoach/frontend
echo "VITE_API_BASE_URL=https://fictional-space-spoon-qxv7wx77gqwh9vpq-8000.app.github.dev" > .env.local

# 重启前端
echo "🔄 重启前端服务..."
pkill -f "npm run dev" 2>/dev/null
npm run dev &

echo "✅ 修复完成！请刷新浏览器页面。"
