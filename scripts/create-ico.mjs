import pngToIco from 'png-to-ico';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputIcon = '/Volumes/publish/xpni/icon.png';
const buildResourcesDir = path.join(__dirname, '..', 'buildResources');

async function createIco() {
    console.log('生成 Windows ICO 图标...');
    
    // 生成不同尺寸的 PNG
    const sizes = [16, 32, 48, 256];
    const pngFiles = [];
    
    for (const size of sizes) {
        const pngPath = path.join(buildResourcesDir, `icon-${size}.png`);
        await sharp(inputIcon)
            .resize(size, size)
            .png()
            .toFile(pngPath);
        pngFiles.push(pngPath);
    }
    
    // 转换为 ICO
    const icoBuffer = await pngToIco(pngFiles);
    fs.writeFileSync(path.join(buildResourcesDir, 'OpenBlockDesktop.ico'), icoBuffer);
    
    // 清理临时文件
    for (const file of pngFiles) {
        fs.unlinkSync(file);
    }
    
    console.log('✓ Windows ICO 图标已生成');
    
    // 同时生成文件关联图标
    const icoBuffer2 = await pngToIco(pngFiles);
    fs.writeFileSync(path.join(buildResourcesDir, 'OpenBlockFile.ico'), icoBuffer2);
    console.log('✓ Windows 文件关联图标已生成');
}

createIco().catch(err => {
    console.error('生成 ICO 时出错:', err);
    process.exit(1);
});
