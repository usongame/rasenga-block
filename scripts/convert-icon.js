const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputIcon = '/Volumes/publish/xpni/icon.png';
const buildResourcesDir = path.join(__dirname, '..', 'buildResources');

async function generateIcons() {
    console.log('开始生成图标...');
    
    // 1. 生成 Linux 图标 (512x512)
    console.log('生成 Linux 图标...');
    await sharp(inputIcon)
        .resize(512, 512)
        .png()
        .toFile(path.join(buildResourcesDir, 'linux', '512x512.png'));
    console.log('✓ Linux 图标已生成');
    
    // 2. 生成 Windows ICO (多尺寸)
    console.log('生成 Windows ICO 图标...');
    const icoSizes = [16, 32, 48, 256];
    const icoBuffers = await Promise.all(
        icoSizes.map(size => 
            sharp(inputIcon)
                .resize(size, size)
                .png()
                .toBuffer()
        )
    );
    
    // 使用 png-to-ico 或手动创建 ICO
    // 这里我们先创建 PNG，然后使用在线工具或命令行转换
    await sharp(inputIcon)
        .resize(256, 256)
        .png()
        .toFile(path.join(buildResourcesDir, 'OpenBlockDesktop-256.png'));
    console.log('✓ Windows 图标源文件已生成 (需要转换为 .ico)');
    
    // 3. 生成 macOS 图标集
    console.log('生成 macOS 图标集...');
    const macSizes = [16, 32, 64, 128, 256, 512, 1024];
    const iconsetDir = path.join(buildResourcesDir, 'MyIcon.iconset');
    
    if (!fs.existsSync(iconsetDir)) {
        fs.mkdirSync(iconsetDir, { recursive: true });
    }
    
    for (const size of macSizes) {
        // 1x 版本
        await sharp(inputIcon)
            .resize(size, size)
            .png()
            .toFile(path.join(iconsetDir, `icon_${size}x${size}.png`));
        
        // 2x 版本 (除了 1024，因为 2048 太大)
        if (size <= 512) {
            await sharp(inputIcon)
                .resize(size * 2, size * 2)
                .png()
                .toFile(path.join(iconsetDir, `icon_${size}x${size}@2x.png`));
        }
    }
    console.log('✓ macOS 图标集已生成');
    
    console.log('\n图标生成完成！');
    console.log('下一步：');
    console.log('1. 使用 iconutil 生成 .icns 文件:');
    console.log(`   iconutil -c icns ${iconsetDir} -o ${path.join(buildResourcesDir, 'OpenBlockDesktop.icns')}`);
    console.log('2. 使用在线工具将 OpenBlockDesktop-256.png 转换为 .ico 文件');
}

generateIcons().catch(err => {
    console.error('生成图标时出错:', err);
    process.exit(1);
});
