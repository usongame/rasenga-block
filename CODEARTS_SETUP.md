# 华为云 CodeArts 构建配置指南

本文档介绍如何在华为云 CodeArts 上配置自动构建 Windows EXE 文件。

## 目录

1. [前置条件](#前置条件)
2. [配置步骤](#配置步骤)
3. [构建流程说明](#构建流程说明)
4. [常见问题](#常见问题)
5. [高级配置](#高级配置)

---

## 前置条件

1. **华为云账号**
   - 已注册华为云账号
   - 已开通 CodeArts 服务

2. **代码仓库**
   - 代码已推送到华为云 CodeHub 或其他支持的 Git 仓库

3. **项目准备**
   - 已创建 `.codearts/build-windows.yml` 配置文件

---

## 配置步骤

### 步骤 1: 登录华为云控制台

1. 访问 [华为云控制台](https://console.huaweicloud.com/)
2. 登录你的账号

### 步骤 2: 进入 CodeArts

1. 在控制台搜索 **CodeArts**
2. 点击进入 **CodeArts DevOps** 服务

### 步骤 3: 创建项目（如果没有）

1. 点击 **新建项目**
2. 选择 **空白项目** 或 **Scrum 项目**
3. 填写项目名称，例如：`xpni-block-build`
4. 点击 **确定**

### 步骤 4: 创建构建任务

1. 在项目中，点击左侧菜单 **持续交付 → 构建**
2. 点击 **新建任务**
3. 填写任务信息：
   - **任务名称**：`build-windows-exe`
   - **源码仓库**：选择你的代码仓库
   - **分支**：`main` 或 `master`

### 步骤 5: 配置构建模板

1. 选择 **空白模板** 或 **Node.js 模板**
2. 在构建步骤中，添加以下步骤：

#### 构建步骤配置

**步骤 1: 检出代码**
```yaml
步骤类型: 检出代码
仓库: 你的代码仓库
分支: ${env.BRANCH}
```

**步骤 2: 安装 Node.js**
```yaml
步骤类型: 执行 shell 命令
命令: |
  # 安装 Node.js 16.x
  choco install nodejs-lts --version=16.20.2 -y
  refreshenv
  node --version
  npm --version
```

**步骤 3: 安装依赖**
```yaml
步骤类型: 执行 shell 命令
命令: |
  cd xpniblock-desktop
  npm ci
```

**步骤 4: 编译项目**
```yaml
步骤类型: 执行 shell 命令
命令: |
  cd xpniblock-desktop
  npm run compile
```

**步骤 5: 下载资源**
```yaml
步骤类型: 执行 shell 命令
命令: |
  cd xpniblock-desktop
  npm run fetch:all
环境变量:
  NODE_ENV: production
  NODE_OPTIONS: --max_old_space_size=4096
```

**步骤 6: 构建 Windows 版本**
```yaml
步骤类型: 执行 shell 命令
命令: |
  cd xpniblock-desktop
  npm run doBuild -- --mode=dist
环境变量:
  NODE_ENV: production
  NODE_OPTIONS: --max_old_space_size=4096
  CSC_IDENTITY_AUTO_DISCOVERY: false
```

**步骤 7: 归档构建产物**
```yaml
步骤类型: 归档
路径: |
  xpniblock-desktop/dist/*.exe
  xpniblock-desktop/dist/*.msi
```

### 步骤 6: 配置触发器

1. 点击 **触发器** 标签
2. 添加触发器：
   - **类型**: 代码提交
   - **分支**: `main`, `master`, `develop`
   - **事件**: Push

### 步骤 7: 保存并运行

1. 点击 **保存**
2. 点击 **立即构建** 测试配置

---

## 构建流程说明

整个构建流程如下：

```
代码推送 → 触发构建 → 检出代码 → 安装 Node.js
                                    ↓
                            安装 npm 依赖
                                    ↓
                            编译项目
                                    ↓
                            下载资源文件
                                    ↓
                            构建 Windows EXE
                                    ↓
                            归档构建产物
                                    ↓
                            构建完成 ✅
```

---

## 常见问题

### Q1: 构建失败，提示内存不足

**解决方案**: 在环境变量中设置更大的内存限制
```yaml
NODE_OPTIONS: --max_old_space_size=8192
```

### Q2: 构建产物在哪里下载？

**解决方案**: 
1. 进入构建任务详情
2. 点击 **构建产物** 标签
3. 下载 `.exe` 文件

### Q3: 如何配置代码签名？

**解决方案**: 
1. 在 CodeArts 中配置 **机密管理**
2. 添加证书文件和密码
3. 修改构建脚本启用签名

### Q4: 构建时间太长

**优化建议**:
1. 启用 **缓存** 功能，缓存 `node_modules`
2. 使用 **增量构建**
3. 配置 **并行构建**（如果有多平台需求）

---

## 高级配置

### 配置 OBS 自动上传

如果你想自动上传构建产物到华为云 OBS：

1. 在 CodeArts 中配置 **扩展点**
2. 添加 OBS 上传步骤：

```yaml
步骤类型: 执行 shell 命令
命令: |
  # 安装 obsutil
  wget https://obs-community.obs.cn-north-1.myhuaweicloud.com/obsutil/current/obsutil_windows_amd64.zip
  unzip obsutil_windows_amd64.zip
  
  # 配置 OBS
  ./obsutil config -i=${ACCESS_KEY_ID} -k=${SECRET_ACCESS_KEY} -e=obs.cn-north-4.myhuaweicloud.com
  
  # 上传文件
  ./obsutil cp -r -f xpniblock-desktop/dist/*.exe obs://your-bucket/releases/
```

### 配置钉钉/企业微信通知

在 **通知** 标签中配置 webhook：
- 钉钉机器人 webhook
- 企业微信机器人 webhook
- 邮件通知

### 配置多平台构建

如果需要同时构建 macOS 和 Windows：

```yaml
并行任务:
  - 任务1: 构建 Windows
    环境: windows
  - 任务2: 构建 macOS
    环境: macos
```

---

## 参考文档

- [华为云 CodeArts 官方文档](https://support.huaweicloud.com/codearts/)
- [Electron Builder 文档](https://www.electron.build/)
- [华为云 OBS 文档](https://support.huaweicloud.com/obs/)

---

## 需要帮助？

如果在配置过程中遇到问题：
1. 查看 CodeArts 构建日志
2. 检查环境变量配置
3. 参考华为云官方文档
4. 联系华为云技术支持
