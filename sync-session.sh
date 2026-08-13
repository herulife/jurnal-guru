#!/bin/bash
# Sync sesi opencode lokal <-> VPS agar percakapan tampil di kedua sisi.
# Lokal: ekspor sesi -> kirim ke VPS -> import di VPS
# VPS:   ekspor sesi (heading terbaru) -> tarik ke lokal -> import di lokal

set -e
SSH="ssh -p 2480 -i /root/.ssh/vps_ed25519 -o StrictHostKeyChecking=no -o ConnectTimeout=15"
VPS_USER="ubuntu24@103.107.206.10"
LOCAL_BIN="${OPENCODE_BIN:-opencode}"
VPS_BIN="/home/ubuntu24/.npm-global/bin/opencode"
VPS_SHARE="$VPS_USER:/home/ubuntu24/.local/share/opencode/session-backups"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

echo "== 1/3 ekspor sesi terbaru di LOKAL"
ID="$($LOCAL_BIN session list 2>/dev/null | grep '^ses_' | head -1 | awk '{print $1}')"
if [ -z "$ID" ]; then echo "!! tidak ada sesi lokal"; exit 1; fi
echo "   sesi: $ID"
$LOCAL_BIN export "$ID" > "$TMP/local-session.json"

echo "== 2/3 kirim ke VPS + import"
scp -P 2480 -i "$HOME/.ssh/vps_ed25519" -o StrictHostKeyChecking=no "$TMP/local-session.json" ubuntu24@103.107.206.10:/tmp/session-sync.json >/dev/null
$SSH $VPS_USER "$VPS_BIN import /tmp/session-sync.json 2>&1 | tail -2 && rm -f /tmp/session-sync.json"

echo "== 3/3 cek: ambil 3 sesi terbaru VPS ke LOKAL"
$SSH $VPS_USER "$VPS_BIN session list 2>/dev/null | grep '^ses_' | head -3 | awk '{print \$1}'" > "$TMP/vps-ids.txt"
while read -r VPS_ID; do
    [ -z "$VPS_ID" ] && continue
    $SSH $VPS_USER "$VPS_BIN export $VPS_ID" > "$TMP/vps-session.json" 2>/dev/null \
      && $LOCAL_BIN import "$TMP/vps-session.json" >/dev/null 2>&1 \
      && echo "   import $VPS_ID ke lokal ✓"
done < "$TMP/vps-ids.txt"

echo "== selesai ✓"