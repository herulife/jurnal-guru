#!/usr/bin/env bash
set -euo pipefail

LOCAL=/root/teacher-dashboard-next
REMOTE=/home/ubuntu24/teacher-dashboard-next
VPS="ubuntu24@103.107.206.10"
SSH_ARGS="-p 2480 -i /root/.ssh/vps_ed25519 -o StrictHostKeyChecking=no -o ConnectTimeout=15"

echo "==> 1/4 sync src ke VPS (tar+scp)"
tar czf - -C "$LOCAL" \
  --exclude node_modules --exclude .next --exclude .open-next --exclude .git \
  --exclude data.db --exclude '.env*' --exclude '.dev.vars*' --exclude docs \
  --exclude screenshots --exclude tsconfig.tsbuildinfo . | ssh $SSH_ARGS "$VPS" "rm -rf $REMOTE/src $REMOTE/public $REMOTE/package.json $REMOTE/package-lock.json $REMOTE/next.config.ts $REMOTE/open-next.config.ts $REMOTE/wrangler.jsonc $REMOTE/tsconfig.json $REMOTE/tsconfig.tsbuildinfo $REMOTE/drizzle $REMOTE/drizzle.config.ts $REMOTE/scripts $REMOTE/eslint.config.mjs $REMOTE/postcss.config.mjs $REMOTE/deploy.sh && tar xzf - -C $REMOTE"
echo "==> 2/4 typecheck di VPS"
ssh $SSH_ARGS "$VPS" "cd $REMOTE && npx tsc --noEmit" 2>&1 | tail -20 || true
echo "==> 3/4 build + deploy di VPS"
ssh $SSH_ARGS "$VPS" "source ~/.cf_token.sh && cd $REMOTE && npm run deploy" 2>&1 | grep -iE 'Compiled|error:|✘|Uploaded guru|Current Version' || true

echo "==> 4/4 verifikasi URL"
for u in / /checkout /api/auth/check; do
  code=$(curl -s -o /dev/null -w "%{http_code}" "https://guru.benuatech.web.id$u")
  echo "  $u -> $code"
done
echo "==> selesai ✓"