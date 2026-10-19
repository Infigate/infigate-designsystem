#!/bin/sh
# 作業を終えるとき（Stop）に test:run・lint・typecheck を実行し、落ちたら終了を止めて Claude に直させる。
cd "$CLAUDE_PROJECT_DIR" || exit 0

# 直させた後の2回目以降は実行しない（落ち続けても止まれなくなるのを防ぐ）
if grep -q '"stop_hook_active"[[:space:]]*:[[:space:]]*true'; then
  exit 0
fi

# src に変更が無ければ何もしない（質問だけの作業など）
if [ -z "$(git status --porcelain -- src)" ]; then
  exit 0
fi

failed=""
for cmd in test:run lint typecheck; do
  out=$(npm run "$cmd" 2>&1) || failed="$failed
=== npm run $cmd が失敗 ===
$out"
done

if [ -n "$failed" ]; then
  echo "確認のコマンドが通っていません。直してから終えてください。$failed" >&2
  exit 2
fi
