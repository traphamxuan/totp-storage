#!/bin/bash

set -e

# Build for WebAssembly (browser)
build_web() {
  echo "Building for WebAssembly (browser)..."
  wasm-pack build --target web --out-name totp-rs-web --out-dir build/totp-rs-web/pkg
  # Customize the package.json for web
  node normalize.js web
  echo "WebAssembly build completed successfully!"
}

# Build for Node.js
build_node() {
  echo "Building for Node.js..."
  wasm-pack build --target nodejs --out-name totp-rs-node --out-dir build/totp-rs-node/pkg
  # Customize the package.json for node
  node normalize.js node
  echo "Node.js build completed successfully!"
}

build_bundler() {
  echo "Building for bundlers..."
  wasm-pack build --target bundler --out-name totp-rs-bundler --out-dir build/totp-rs-bundler/pkg
  # Customize the package.json for bundlers
  node normalize.js bundler
  echo "Bundler build completed successfully!"
}

# Build for both targets
build_all() {
  build_web
  build_node
  build_bundler
  echo "All builds completed successfully!"
}

# Parse command line arguments
if [ $# -eq 0 ]; then
  build_all
else
  case "$1" in
    web)
      build_web
      ;;
    node)
      build_node
      ;;
    bundler)
      build_bundler
      ;;
    all)
      build_all
      ;;
    *)
      echo "Unknown target: $1"
      echo "Usage: $0 [web|node|bundler|all]"
      exit 1
      ;;
  esac
fi