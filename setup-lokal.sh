#!/usr/bin/env bash
set -euo pipefail

# setup-lokal.sh — jalankan SEKALI di PC lokal untuk hubungkan ke GitHub
# dan ambil seluruh kode VPS. Harus jalan dari folder proyek:
#   cd /home/awipari/Developer/teacher-dashboard-next
#   bash setup-lokal.sh
#
# Syarat: key SSH GitHub sudah ada di ~/.ssh/id_ed25519_github_pondok

cd "$(dirname "$0")"

echo "== 1/3 cek key SSH GitHub"
KEY=~/.ssh/id_ed25519_github_pondok
if [ ! -f "$KEY" ]; then
  echo "!! key $KEY tidak ada. Salin dulu dari VPS:"
  echo "   scp -P 2480 ubuntu24@103.107.206.10:.ssh/id_ed25519_github_pondok* ~/.ssh/"
  exit 1
fi
ssh -o StrictHostKeyChecking=no -o BatchMode=yes -T git@github.com 2>&1 | grep -q "Hi" && echo "   SSH GitHub OK"

echo "== 2/3 hubungkan ke repo GitHub"
git remote remove origin 2>/dev/null || true
git remote add origin git@github.com:herulife/jurnal-guru.git
git fetch origin main

echo "== 3/3 ambil kode VPS (hard reset ke origin/main)"
git reset --hard origin/main
git branch -M main 2>/dev/null || git checkout -b main --track origin/main

echo "== selesai ✓"
git status -sb
git log --oneline -3