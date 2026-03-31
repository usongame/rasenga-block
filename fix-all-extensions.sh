#!/bin/bash

# 批量修改所有扩展的 supportDevice 为 ['*']

EXTENSIONS_DIR="/Volumes/software/xpni/xpni-block/external-resources-v3/extensions"

# 遍历所有扩展目录
for ext_dir in "$EXTENSIONS_DIR"/*/; do
    index_file="${ext_dir}index.js"
    ext_name=$(basename "$ext_dir")
    
    if [ -f "$index_file" ]; then
        # 检查文件是否包含 supportDevice
        if grep -q "supportDevice:" "$index_file"; then
            # 使用 sed 替换 supportDevice: [...] 为 supportDevice: ['*']
            # 先处理单行格式
            sed -i '' "s/supportDevice: \[.*\]/supportDevice: ['*']/g" "$index_file"
            echo "Fixed: $ext_name"
        else
            echo "No supportDevice found: $ext_name"
        fi
    else
        echo "No index.js found: $ext_name"
    fi
done

echo "Done!"
