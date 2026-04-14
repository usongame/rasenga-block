#!/bin/bash

# 安装所有可能缺失的 Babel 插件
npm install \
  @babel/plugin-proposal-nullish-coalescing-operator \
  @babel/plugin-proposal-optional-chaining \
  @babel/plugin-proposal-async-generator-functions \
  @babel/plugin-proposal-optional-catch-binding \
  --save-dev

# 启动应用
npm start
