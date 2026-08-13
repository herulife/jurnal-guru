#!/usr/bin/env bash
set -euo pipefail

# sync.sh — sinkronisasi VPS <-> lokal lewat GitHub (herulife/jurnal-guru)
# Jalan di sisi mana pun (VPS atau PC lokal). Commit semua perubahan lokal,
# tarik perubahan remote, lalu push. Tidak menghapus apa pun.
#
# Pemakaian:
#   bash sync.sh              -> commit "sync: <tanggal>" lalu pull+push
#   bash sync.sh "pesan"      -> commit dengan pesan sendiri lalu pull+push

cd "$(dirname "$0")"

MSG="${1:-sync: $(date '+%Y-%m-%d %H:%M')}"
BRANCH="$(git branch --show-current)"
[ -z "$BRANCH" ] && { echo "!! bukan di branch aktif"; exit 1; }

echo "== 1/3 commit perubahan lokal ($BRANCH)"
if git status --porcelain | grep -q .; then
  git add -A
  git commit -m "$MSG"
  echo "   commit: $MSG"
else
  echo "   tidak ada perubahan"
fi

echo "== 2/3 tarik perubahan remote (rebase)"
git fetch origin "$BRANCH"
if git rev-parse -q --verify "refs/remotes/origin/$BRANCH" >/dev/null; then
  if ! git diff --quiet "origin/$BRANCH"; then
    git rebase "origin/$BRANCH"
  else
    echo "   sudah sama dengan remote"
  fi
fi

echo "== 3/3 push ke GitHub"
git push origin "$BRANCH"

echo "== selesai ✓"
git log --oneline -3