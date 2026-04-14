#!/bin/bash

# 使用 electron-builder 官方 Wine 镜像构建 Windows 版本

set -e

echo "🚀 开始构建 Windows 版本的 Electron 应用..."

# 检查 Docker 是否安装
if ! command -v docker &> /dev/null; then
    echo "❌ Docker 未安装，请先安装 Docker"
    exit 1
fi

# 检查 Docker 是否运行
if ! docker info &> /dev/null; then
    echo "❌ Docker 未运行，请先启动 Docker"
    exit 1
fi

echo "📦 使用 electron-builder 官方镜像..."

# 先编译 macOS 版本（在当前环境）
echo "🔨 步骤 1: 编译项目..."
npm run compile

# 使用 Docker 构建 Windows 版本
echo "🔨 步骤 2: 使用 Docker 构建 Windows 版本..."
docker run --rm \
    -v "$(pwd):/project" \
    -v "$(pwd)/node_modules:/project/node_modules" \
    -v "$HOME/.cache/electron:/root/.cache/electron" \
    -v "$HOME/.cache/electron-builder:/root/.cache/electron-builder" \
    -e NODE_ENV=production \
    electronuserland/builder:wine \
    bash -c "cd /project && npx electron-builder --windows nsis --x64 --ia32 --publish never"

echo "✅ 构建完成！"
echo "📁 输出文件位于: $(pwd)/dist"
if ls "$(pwd)/dist"/*.exe 1> /dev/null 2>&1; then
    ls -lh "$(pwd)/dist"/*.exe
else
    echo "⚠️ 未找到 .exe 文件，请检查构建日志"
fi
