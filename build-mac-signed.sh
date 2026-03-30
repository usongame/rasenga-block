#!/bin/bash

# Mac 打包脚本 - 同时构建 Intel 和 Apple Silicon 版本
# 版本: 1.0.9

set -e

echo "=========================================="
echo "开始打包 XpniBlock v1.0.9"
echo "=========================================="
echo ""

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 检查是否在正确的目录
if [ ! -f "package.json" ]; then
    echo -e "${RED}错误: 请在项目根目录运行此脚本${NC}"
    exit 1
fi

# 检查证书
if ! security find-identity -p codesigning | grep -q "Developer ID"; then
    echo -e "${YELLOW}警告: 未找到 Developer ID 证书${NC}"
    echo "请确保已在 Xcode 中下载了 Developer ID Application 证书"
    echo ""
fi

# 清理之前的构建
echo -e "${YELLOW}清理之前的构建...${NC}"
npm run clean 2>/dev/null || true
rm -rf ./dist

# 编译
echo -e "${YELLOW}编译项目...${NC}"
npm run compile

# 下载资源（可选，如果已经下载过可以注释掉）
# echo -e "${YELLOW}下载资源...${NC}"
# npm run fetch:all

echo ""
echo "=========================================="
echo "开始构建 DMG 安装包"
echo "=========================================="
echo ""

# 构建 Universal 版本（同时支持 Intel 和 Apple Silicon）
echo -e "${YELLOW}构建 Universal 版本 (Intel + Apple Silicon)...${NC}"
npx electron-builder --macos dmg --universal --publish never

echo ""
echo -e "${GREEN}==========================================${NC}"
echo -e "${GREEN}打包完成!${NC}"
echo -e "${GREEN}==========================================${NC}"
echo ""
echo "输出文件:"
ls -lh dist/*.dmg 2>/dev/null || echo "未找到 DMG 文件"
echo ""
echo "文件信息:"
ls -lh dist/ | grep -E "dmg|zip|app"
echo ""

# 验证签名
echo "验证签名:"
for app in dist/mac*/XpniBlock.app; do
    if [ -d "$app" ]; then
        echo "检查: $app"
        codesign -dv "$app" 2>&1 | grep -E "Signature|Authority|TeamIdentifier" || true
        echo ""
    fi
done

echo -e "${GREEN}完成!${NC}"
