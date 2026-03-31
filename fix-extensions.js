const fs = require('fs');
const path = require('path');

const extensionsDir = '/Volumes/software/xpni/xpni-block/external-resources-v3/extensions';

// 获取所有扩展目录
const extensions = fs.readdirSync(extensionsDir).filter(item => {
    return fs.statSync(path.join(extensionsDir, item)).isDirectory();
});

console.log(`Found ${extensions.length} extensions to fix`);

let fixedCount = 0;

extensions.forEach(extName => {
    const indexPath = path.join(extensionsDir, extName, 'index.js');
    
    if (fs.existsSync(indexPath)) {
        let content = fs.readFileSync(indexPath, 'utf-8');
        
        // 检查是否包含 supportDevice
        if (content.includes('supportDevice:')) {
            // 替换 supportDevice 为 ['*']
            // 匹配 supportDevice: 后面跟着数组的各种格式
            const newContent = content.replace(
                /supportDevice:\s*\[[^\]]*\]/g,
                "supportDevice: ['*']"
            );
            
            if (content !== newContent) {
                fs.writeFileSync(indexPath, newContent, 'utf-8');
                console.log(`Fixed: ${extName}`);
                fixedCount++;
            } else {
                console.log(`Already has ['*'] or format different: ${extName}`);
            }
        } else {
            console.log(`No supportDevice found: ${extName}`);
        }
    } else {
        console.log(`No index.js found: ${extName}`);
    }
});

console.log(`\nTotal fixed: ${fixedCount} extensions`);
