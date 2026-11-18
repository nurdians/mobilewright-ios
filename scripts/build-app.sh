#!/usr/bin/env bash
# Build the Milliways demo app for the iOS simulator.
# Prereq: git clone https://github.com/mobile-next/Milliways apps/Milliways-src
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SRC="$ROOT/apps/Milliways-src"
OUT="$ROOT/apps"

if [[ ! -d "$SRC" ]]; then
  echo "Cloning Milliways demo app..."
  git clone --depth 1 https://github.com/mobile-next/Milliways "$SRC"
fi

echo "Building for iOS simulator..."
make -C "$SRC" zip

# Locate the built artifact and copy it into apps/
ARTIFACT="$(find "$SRC" -name "*.zip" -o -name "*.app" | head -1)"
if [[ -z "$ARTIFACT" ]]; then
  echo "ERROR: build produced no artifact" >&2
  exit 1
fi
cp -R "$ARTIFACT" "$OUT/"
echo "Built: $OUT/$(basename "$ARTIFACT")"
