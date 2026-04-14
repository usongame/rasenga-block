#!/bin/bash

# 直接在 macOS 上交叉编译 Windows 版本
# 不需要 Docker，不需要虚拟机

set -e

echo "🚀 开始在 macOS 上交叉编译 Windows 版本..."

# 编译项目
echo "🔨 编译项目..."
npm run compile

# 构建 Windows 版本（使用 electron-builder 的交叉编译功能）
echo "🔨 构建 Windows 版本..."
npx electron-builder --windows nsis --x64 --ia32 --publish never

echo "✅ 构建完成！"
echo "📁 输出文件位于: $(pwd)/dist"
ls -lh "$(pwd)/dist"/*.exe 2>/dev/null || echo "检查 dist 目录..."
