#!/usr/bin/env bash
# Install the built Milliways app into the booted iOS simulator.
# Tries `mobilewright installApps` equivalent first via xcrun simctl install.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
APPS="$ROOT/apps"

# Ensure a simulator is booted
if ! xcrun simctl list devices booted | grep -q "Booted"; then
  echo "No booted simulator — booting one..."
  UDID="$(xcrun simctl list devices available | grep -m1 -oE '[0-9A-F-]{36}')"
  xcrun simctl boot "$UDID"
  sleep 3
fi

# Find the .app bundle (unzip first if needed)
APP_BUNDLE="$(find "$APPS" -maxdepth 3 -name "*.app" | head -1)"
if [[ -z "$APP_BUNDLE" && -n "$(find "$APPS" -maxdepth 1 -name '*.zip' | head -1)" ]]; then
  ZIP="$(find "$APPS" -maxdepth 1 -name '*.zip' | head -1)"
  unzip -q -o "$ZIP" -d "$APPS"
  APP_BUNDLE="$(find "$APPS" -maxdepth 3 -name "*.app" | head -1)"
fi

if [[ -z "$APP_BUNDLE" ]]; then
  echo "ERROR: no .app found in $APPS — run 'npm run app:build' first" >&2
  exit 1
fi

BUNDLE_ID="$(defaults read "$APP_BUNDLE/Info" CFBundleIdentifier)"
echo "Installing $APP_BUNDLE ($BUNDLE_ID)..."
xcrun simctl install booted "$APP_BUNDLE"
echo "Installed. Bundle ID: $BUNDLE_ID"
