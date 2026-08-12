---
description: DoubleZero MCP のオンボーディングランブックの機械可読インデックス。ドキュメントナビゲーションにはリンクされていません。
search:
  exclude: true
---

# ランブック

DoubleZero MCP は GitHub raw からこのファイルを読み込みます
(`https://raw.githubusercontent.com/malbeclabs/docs/main/docs/runbooks.md`)。
これによりウォークスルーを検出します。人間の方は [AI を接続する](mcp.md) をご利用ください。このページをサイトナビゲーションに追加しないでください。

ランブックを登録するには、**Index** の下に以下の形式でリスト項目を追加してください：

```markdown
- `service-id` — [Human title](page-slug.md)
```

## インデックス

- `solana-ibrl` — [バリデーターを接続する (IBRL Mainnet)](solana-ibrl-runbook.md)
- `solana-shreds-publisher` — [シュレッドを公開する (Edge)](solana-shreds-publisher-runbook.md)
- `solana-shreds` — [シュレッドを購読する (Edge)](solana-shreds-runbook.md)