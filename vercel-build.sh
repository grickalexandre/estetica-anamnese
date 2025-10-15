#!/bin/bash
# Limpar cache e fazer build limpo
rm -rf node_modules
rm -rf dist
npm install
npm run build
