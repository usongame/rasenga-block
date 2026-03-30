#!/bin/bash

# Mac 打包脚本 - 分别构建 Intel 和 Apple Silicon 版本
# 版本: 1.0.9

set -e

echo "=========================================="
echo "开始打包 XpniBlock v1.0.9"
echo "支持: Intel (x64) + Apple Silicon (arm64)"
echo "=========================================="
echo ""

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 检查是否在正确的目录
if [ ! -f "package.json" ]; then
    echo -e "${RED}错误: 请在项目根目录运行此脚本${NC}"
    exit 1
fi

# 检查证书
echo -e "${BLUE}检查签名证书...${NC}"
if security find-identity -p codesigning | grep -q "Developer ID"; then
    echo -e "${GREEN}✓ 找到 Developer ID 证书${NC}"
    security find-identity -p codesigning | grep "Developer ID" | head -3
else
    echo -e "${YELLOW}⚠ 警告: 未找到 Developer ID 证书${NC}"
    echo "请确保已在 Xcode 中下载了 Developer ID Application 证书"
    echo ""
fi
echo ""

# 清理之前的构建
echo -e "${YELLOW}清理之前的构建...${NC}"
npm run clean 2>/dev/null || true
rm -rf ./dist

# 使用本地静态资源
echo -e "${YELLOW}使用本地静态资源...${NC}"
if [ -d "/Volumes/software/xpni/xpni-block/xpniblock-assets" ]; then
    rm -rf ./static
    cp -r /Volumes/software/xpni/xpni-block/xpniblock-assets ./static
    echo -e "${GREEN}✓ 静态资源已复制${NC}"
else
    echo -e "${YELLOW}⚠ 本地静态资源不存在，尝试从 GitHub 下载...${NC}"
    npm run fetch:static
fi
echo ""

# 编译
echo -e "${YELLOW}编译项目...${NC}"
npm run compile

echo ""
echo "=========================================="
echo "开始构建 DMG 安装包"
echo "=========================================="
echo ""

# 构建 Intel (x64) 版本
echo -e "${BLUE}==========================================${NC}"
echo -e "${BLUE}构建 Intel (x64) 版本...${NC}"
echo -e "${BLUE}==========================================${NC}"
export ELECTRON_MIRROR="https://npmmirror.com/mirrors/electron/"
npx electron-builder --macos dmg --x64 --publish never

# 重命名 Intel 版本
if [ -f "dist/XpniBlock_v1.0.9_mac_x64.dmg" ]; then
    mv "dist/XpniBlock_v1.0.9_mac_x64.dmg" "dist/XpniBlock_v1.0.9_mac_Intel.dmg"
fi

# 清理，准备构建下一个版本
rm -rf ./dist/mac

echo ""
echo -e "${BLUE}==========================================${NC}"
echo -e "${BLUE}构建 Apple Silicon (arm64) 版本...${NC}"
echo -e "${BLUE}==========================================${NC}"
npx electron-builder --macos dmg --arm64 --publish never

# 重命名 Apple Silicon 版本
if [ -f "dist/XpniBlock_v1.0.9_mac_arm64.dmg" ]; then
    mv "dist/XpniBlock_v1.0.9_mac_arm64.dmg" "dist/XpniBlock_v1.0.9_mac_Apple_Silicon.dmg"
fi

echo ""
echo -e "${GREEN}==========================================${NC}"
echo -e "${GREEN}打包完成!${NC}"
echo -e "${GREEN}==========================================${NC}"
echo ""
echo "输出文件:"
echo "----------------------------------------"
ls -lh dist/*.dmg 2>/dev/null | awk '{printf "  %s (%s %s)\n", $9, $5, $6}'
echo "----------------------------------------"
echo ""

# 验证签名
echo "验证签名:"
echo "----------------------------------------"
for dmg in dist/*.dmg; do
    if [ -f "$dmg" ]; then
        echo ""
        echo "文件: $(basename $dmg)"
        # 挂载 DMG 检查签名
        mount_point=$(hdiutil attach "$dmg" -nobrowse | grep -o '/Volumes/.*' | head -1)
        if [ -n "$mount_point" ]; then
            app_path=$(find "$mount_point" -name "XpniBlock.app" -type d | head -1)
            if [ -n "$app_path" ]; then
                codesign -dv "$app_path" 2>&1 | grep -E "Signature|Authority|TeamIdentifier" || true
            fi
            hdiutil detach "$mount_point" -quiet
        fi
    fi
done
echo "----------------------------------------"
echo ""

echo -e "${GREEN}所有构建已完成!${NC}"
echo ""
echo "文件位置: $(pwd)/dist/"
echo ""

# 计算文件哈希
echo "文件校验值 (SHA256):"
echo "----------------------------------------"
for file in dist/*.dmg; do
    if [ -f "$file" ]; then
        shasum -a 256 "$file"
    fi
done
echo "----------------------------------------"
