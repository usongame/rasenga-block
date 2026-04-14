#!/bin/bash

# 在 macOS 上使用 Docker 构建 Windows 版本的 Electron 应用

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

echo "📦 构建 Docker 镜像..."
docker build -f Dockerfile.windows -t xpni-block-windows-builder .

echo "🔨 运行构建..."
docker run --rm \
    -v "$(pwd)/dist:/app/dist" \
    -e NODE_ENV=production \
    -e NODE_OPTIONS=--max_old_space_size=4096 \
    xpni-block-windows-builder \
    bash -c "npm run compile && npx electron-builder --windows --x64 --ia32"

echo "✅ 构建完成！"
echo "📁 输出文件位于: $(pwd)/dist"
ls -la "$(pwd)/dist"/*.exe 2>/dev/null || echo "未找到 .exe 文件"
