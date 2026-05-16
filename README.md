ピアノ名人 — ブラウザベースのピアノゲーム
=====================================

このリポジトリはシンプルなHTML/CSS/JavaScriptで作られたピアノゲームです。

ローカルで動かす
----------------

1. ブラウザで `index.html` を開くだけです（最新のChrome/Edge/Safari推奨）。

GitHubに公開する手順（簡易）
-----------------------------

1. GitHubで新しいパブリックリポジトリを作成します（例: `piano-meijin`）。
2. ローカルでリポジトリを初期化してコミットします:

```bash
git init
git add .
git commit -m "Initial commit: ピアノ名人"
git branch -M main
git remote add origin https://github.com/<あなたのユーザー名>/<リポジトリ名>.git
git push -u origin main
```

3. GitHubのリポジトリ設定から「Pages」を有効にし、`main` ブランチのルートを公開先として選択すれば、GitHub Pagesで公開できます。

注意
----

- ブラウザのAudio APIはユーザー操作（クリック/タップ）で有効化が必要です。
- 実際の高品質ピアノ音を追加する場合は、`sounds/` フォルダにWAV/MP3を配置し、`playNoteSound` を調整してください。

ライセンス
-------

このプロジェクトにはライセンスを追加してください（例: MIT）。
