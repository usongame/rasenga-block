#!/bin/bash
export ELECTRON_SKIP_CHROMEDRIVER_DOWNLOAD=true
export ELECTRON_MIRROR=https://npmmirror.com/mirrors/electron/
export ELECTRON_BUILDER_BINARIES_MIRROR=https://npmmirror.com/mirrors/electron-builder-binaries/

rm -rf node_modules package-lock.json
npm install
npm run compile
npm start
