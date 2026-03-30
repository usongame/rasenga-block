#!/bin/bash

# Mac 打包脚本 - 使用本地 Electron 二进制文件
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

# 检查本地 Electron 文件
ELECTRON_DIR="/Volumes/software/xpni/xpni-block"
if [ ! -f "$ELECTRON_DIR/electron-v15.5.7-darwin-x64.zip" ]; then
    echo -e "${RED}错误: 找不到 Intel 版本 Electron 文件${NC}"
    echo "请确保文件存在: $ELECTRON_DIR/electron-v15.5.7-darwin-x64.zip"
    exit 1
fi

if [ ! -f "$ELECTRON_DIR/electron-v15.5.7-darwin-arm64.zip" ]; then
    echo -e "${RED}错误: 找不到 Apple Silicon 版本 Electron 文件${NC}"
    echo "请确保文件存在: $ELECTRON_DIR/electron-v15.5.7-darwin-arm64.zip"
    exit 1
fi

echo -e "${GREEN}✓ 找到本地 Electron 文件${NC}"
echo "  - Intel: electron-v15.5.7-darwin-x64.zip"
echo "  - Apple Silicon: electron-v15.5.7-darwin-arm64.zip"
echo ""

# 检查证书
echo -e "${BLUE}检查签名证书...${NC}"
if security find-identity -p codesigning | grep -q "Developer ID\|Apple Development"; then
    echo -e "${GREEN}✓ 找到签名证书${NC}"
    security find-identity -p codesigning | grep -E "Developer ID|Apple Development" | head -3
else
    echo -e "${YELLOW}⚠ 警告: 未找到签名证书${NC}"
    echo "请确保已在 Xcode 中下载了证书"
    echo ""
fi
echo ""

# 清理之前的构建
echo -e "${YELLOW}清理之前的构建...${NC}"
npm run clean 2>/dev/null || true
rm -rf ./dist 2>/dev/null || true

# 确保静态资源存在
echo -e "${YELLOW}检查静态资源...${NC}"
if [ ! -d "./static/assets" ]; then
    echo -e "${YELLOW}复制本地静态资源...${NC}"
    cp -r /Volumes/software/xpni/xpni-block/xpniblock-assets/* ./static/ 2>/dev/null || true
fi
if [ -d "./static/assets" ]; then
    echo -e "${GREEN}✓ 静态资源已就绪${NC}"
else
    echo -e "${YELLOW}⚠ 静态资源缺失，打包可能不完整${NC}"
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

# 创建临时缓存目录
TEMP_CACHE="/tmp/electron-cache-$$"
mkdir -p "$TEMP_CACHE"
cp "$ELECTRON_DIR/electron-v15.5.7-darwin-x64.zip" "$TEMP_CACHE/"
cp "$ELECTRON_DIR/electron-v15.5.7-darwin-arm64.zip" "$TEMP_CACHE/"

# 构建 Intel (x64) 版本
echo -e "${BLUE}==========================================${NC}"
echo -e "${BLUE}构建 Intel (x64) 版本...${NC}"
echo -e "${BLUE}==========================================${NC}"

# 使用本地 Electron 缓存
electron-builder --macos dmg --x64 --publish never \
    --electron-cache "$TEMP_CACHE" \
    --electron-mirror "file://$TEMP_CACHE/"

# 重命名 Intel 版本
if [ -f "dist/XpniBlock_v1.0.9_mac_x64.dmg" ]; then
    mv "dist/XpniBlock_v1.0.9_mac_x64.dmg" "dist/XpniBlock_v1.0.9_mac_Intel.dmg"
    echo -e "${GREEN}✓ Intel 版本构建完成${NC}"
fi

# 清理中间文件，准备构建下一个版本
rm -rf ./dist/mac

echo ""
echo -e "${BLUE}==========================================${NC}"
echo -e "${BLUE}构建 Apple Silicon (arm64) 版本...${NC}"
echo -e "${BLUE}==========================================${NC}"

electron-builder --macos dmg --arm64 --publish never \
    --electron-cache "$TEMP_CACHE" \
    --electron-mirror "file://$TEMP_CACHE/"

# 重命名 Apple Silicon 版本
if [ -f "dist/XpniBlock_v1.0.9_mac_arm64.dmg" ]; then
    mv "dist/XpniBlock_v1.0.9_mac_arm64.dmg" "dist/XpniBlock_v1.0.9_mac_Apple_Silicon.dmg"
    echo -e "${GREEN}✓ Apple Silicon 版本构建完成${NC}"
fi

# 清理临时缓存
rm -rf "$TEMP_CACHE"

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
        mount_point=$(hdiutil attach "$dmg" -nobrowse 2>/dev/null | grep -o '/Volumes/.*' | head -1)
        if [ -n "$mount_point" ]; then
            app_path=$(find "$mount_point" -name "XpniBlock.app" -type d | head -1)
            if [ -n "$app_path" ]; then
                codesign -dv "$app_path" 2>&1 | grep -E "Signature|Authority|TeamIdentifier" || true
            fi
            hdiutil detach "$mount_point" -quiet 2>/dev/null || true
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
