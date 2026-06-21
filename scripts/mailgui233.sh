#!/usr/bin/env sh
set -eu

COMMAND="${1:-install}"
VERSION="${MAILGUI233_VERSION:-latest}"
ROOT="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
REPO="neko233-com/MailGUI233"
APP_NAME="MailGUI233"

download_latest() {
  api="https://api.github.com/repos/$REPO/releases/latest"
  if [ "$VERSION" != "latest" ]; then
    api="https://api.github.com/repos/$REPO/releases/tags/$VERSION"
  fi

  tmp_json="${TMPDIR:-/tmp}/mailgui233-release.json"
  curl -fsSL -H "User-Agent: MailGUI233-Agent" "$api" -o "$tmp_json"
  asset_url="$(node -e "const r=require('$tmp_json'); const a=(r.assets||[]).find(x=>/\\.(dmg|AppImage|tar\\.gz)$/.test(x.name)); if(a) console.log(a.browser_download_url)")"

  if [ -z "$asset_url" ]; then
    echo "No macOS/Linux release asset is available yet. Falling back to source install."
    return 1
  fi

  target="${TMPDIR:-/tmp}/$(basename "$asset_url")"
  curl -fL -H "User-Agent: MailGUI233-Agent" "$asset_url" -o "$target"
  echo "$target"
}

install_source() {
  cd "$ROOT"
  npm ci --prefer-offline
  npm run build
}

case "$COMMAND" in
  install)
    if artifact="$(download_latest)"; then
      case "$artifact" in
        *.dmg)
          hdiutil attach "$artifact"
          echo "Open the mounted $APP_NAME volume and drag the app to Applications."
          ;;
        *.AppImage)
          mkdir -p "$HOME/.local/bin"
          cp "$artifact" "$HOME/.local/bin/mailgui233.AppImage"
          chmod +x "$HOME/.local/bin/mailgui233.AppImage"
          ;;
        *.tar.gz)
          mkdir -p "$HOME/.local/share/mailgui233"
          tar -xzf "$artifact" -C "$HOME/.local/share/mailgui233"
          ;;
      esac
    else
      install_source
    fi
    ;;
  uninstall)
    rm -rf "$HOME/.local/share/mailgui233" "$HOME/.local/bin/mailgui233.AppImage"
    if [ -d "/Applications/$APP_NAME.app" ]; then
      rm -rf "/Applications/$APP_NAME.app"
    fi
    echo "$APP_NAME uninstall command completed."
    ;;
  use)
    if [ -d "/Applications/$APP_NAME.app" ]; then
      open "/Applications/$APP_NAME.app"
    elif [ -x "$HOME/.local/bin/mailgui233.AppImage" ]; then
      "$HOME/.local/bin/mailgui233.AppImage"
    else
      cd "$ROOT"
      npm run dev
    fi
    ;;
  status)
    echo "$APP_NAME root: $ROOT"
    cd "$ROOT"
    npm run package:size
    ;;
  *)
    echo "Usage: $0 install|uninstall|use|status" >&2
    exit 2
    ;;
esac
