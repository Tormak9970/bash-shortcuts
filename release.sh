#!/bin/bash

# Usage:
# release.sh          - prepares a release, pnpm build should be already executed
# release.sh dist     - executes pnpm install/build and prepares a release
# release.sh zip      - prepares a release and packages it in a ZIP file
# release.sh dist zip - executes pnpm install/build, prepares a release and packages it in a ZIP file

perform_build() {
    echo "[INFO] Running pnpm install..."
    pnpm i
    echo "[INFO] Running pnpm build..."
    pnpm build
}

echo "[INFO]: Preparing release..."

PLUGIN_FOLDER_NAME="${PLUGIN_FOLDER_NAME:-$(basename "$(pwd)")}"
PLUGIN_VERSION=$(node -p "require('./package.json').version")
BUILD_DIR="./build/$PLUGIN_FOLDER_NAME-$PLUGIN_VERSION/$PLUGIN_FOLDER_NAME"

echo "[INFO]: Preparing release directory at $BUILD_DIR..."
rm -rf "$BUILD_DIR"
mkdir -p "$BUILD_DIR/dist"

if [ "$1" == "dist" ]; then
    perform_build
fi

echo "[INFO] Copying necessary files..."
cp -v ./dist/index.js "$BUILD_DIR/dist"
cp -v README.md package.json plugin.json LICENSE "$BUILD_DIR"
cp -v main.py "$BUILD_DIR"

echo "[INFO] Syncing Python files..."
rsync -avr --prune-empty-dirs --exclude '*_test.py' --exclude '__pycache__' --include '*.py' ./defaults/ "$BUILD_DIR"

# Create a zip file of the build
if [ "$1" == "zip" ] || [ "$2" == "zip" ]; then
    ZIP_NAME="$PLUGIN_FOLDER_NAME-$PLUGIN_VERSION.zip"
    echo "[INFO] Creating ZIP file $ZIP_NAME..."
    cd ./build/"$PLUGIN_FOLDER_NAME-$PLUGIN_VERSION" && zip -r ../"$ZIP_NAME" ./"$PLUGIN_FOLDER_NAME"
    echo "Packaging complete: ./build/$ZIP_NAME"
else
    echo "[WARN] Skipping ZIP creation. To create release ZIP, run the script with 'zip' argument."
fi

echo "[INFO] Done."
