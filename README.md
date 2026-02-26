# souzoku プロジェクト

TAISUN Agent システムを活用した相続関連AIエージェントプロジェクト。

## セットアップ

このプロジェクトは `~/taisun_agent` の設定をシンボリックリンクで参照しています。

```bash
ln -s ~/taisun_agent/.claude .claude
ln -s ~/taisun_agent/.mcp.json .mcp.json
```

## TAISUN Agent システム概要

- 13層防御システム (13/13 有効)
- スキル: 120個
- エージェント: 96個
- MCPツール: 248個 (28サーバー)
- メモリシステム: 5/5 有効

## セットアップ手順

```bash
cd ~/taisun_agent
git pull origin main
npm install
npm run build:all
npm run taisun:diagnose
```
