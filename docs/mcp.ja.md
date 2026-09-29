---
description: Model Context Protocol（MCP）を通じて、DoubleZero Data をご自身の AI アシスタントで利用する方法 — エンドポイント、ツール、接続手順。
---

# 自分の AI を接続する

!!! info
    ホストで Edge データを受信するには、まず [doublezero.xyz/edge/subscribe](https://doublezero.xyz/edge/subscribe) でフィードを購入してください。その後、MCP が接続手順を案内します。

[Model Context Protocol（MCP）](https://modelcontextprotocol.io) を通じて、DoubleZero Data をご自身の AI アシスタントで利用できます。同じサーバーのドキュメントは、データアプリ [data.doublezero.xyz/docs/mcp](https://data.doublezero.xyz/docs/mcp) でも確認できます。

## MCP とは？

MCP は、AI エージェントが外部サービスのツールを呼び出すためのオープンスタンダードです。MCP がなければ、モデルはチャットに貼り付けた情報しか知りません。MCP があれば、エージェントは DoubleZero のドキュメントを読み、オンボーディングランブックを読み込み、パブリックネットワークデータをあなたの代わりにクエリできます。

DoubleZero は **1 つ** の MCP を運用しています。対応するクライアントを以下のエンドポイントに向けてください。

## エンドポイント

```
https://data.doublezero.xyz/api/mcp
```

ログインは不要です。サーバーは [Streamable HTTP](https://modelcontextprotocol.io/docs/concepts/transports#streamable-http) トランスポートを使用します。

## 利用可能なツール

| ツール | 説明 |
|------|-------------|
| `execute_sql` | ClickHouse でメトリクス、バリデーター、ネットワークデータをクエリ |
| `execute_cypher` | Neo4j でトポロジー、パス、接続性をクエリ（メインネットのみ） |
| `get_schema` | データベーススキーマ（テーブル、カラム、型）を取得 |
| `read_docs` | DoubleZero のドキュメントを読む |
| `get_onboarding_runbook` | ガイド付きオンボーディングウォークスルー。サービスを省略すると利用可能な一覧が表示されます。 |
| `check_edge_access` | ID の公開鍵が受信 IP（完全一致または `0.0.0.0`）のアクセスパスを持っているか確認。エージェントはオンボーディング中にこれを呼び出します。 |

これらを自分で呼び出す必要はありません。クライアントが接続されたら、自然言語で質問してください。例：

- 「この Linux ホストでマーケットデータフィードの接続手順を教えて。」
- 「DoubleZero とは？」 / 「Edge Connect はどう動くの？」
- 「DoubleZero 上の Solana バリデーターは何台？」
- 「ニューヨークからアムステルダムまでのパスは？」
- 「トンネルで Network Unreachable と表示される — ランブックを確認して。」

ガイド付きセットアップの場合、エージェントは `get_onboarding_runbook` を呼び出す必要があります（`read_docs` だけではなく）。SQL や Cypher の場合は、まず `get_schema` を呼び出す必要があります。

すべてのツールは読み取り専用です：取引の発注、資金の移動、キーペア / `DZ_SECRET` の閲覧はできません。

## AI エージェントを接続する {#connect-your-ai-agent}

すべてのプラットフォームで `https://data.doublezero.xyz/api/mcp` を使用してください。

### Claude Desktop & Codex Desktop

1. **Settings** を開く
2. **Manage Connectors** をクリック
3. **Add Custom Connector** をクリック
4. 上記のエンドポイント URL を入力

### コードエディタ & IDE

Claude Code、Cursor、Windsurf、Continue、その他の MCP 対応ツールで動作します。プロジェクトルートに `.mcp.json` ファイルを追加してください：

```json
{
  "mcpServers": {
    "doublezero": {
      "type": "http",
      "url": "https://data.doublezero.xyz/api/mcp"
    }
  }
}
```

=== "Claude Code"

    ```bash
    claude mcp add doublezero --transport http https://data.doublezero.xyz/api/mcp
    ```

    次に `/mcp` と入力し、**doublezero** を選択して、接続されていることを確認します。

=== "Cursor"

    1. **Settings** → **Cursor Settings** → **Tools & MCPs**。
    2. エンドポイント URL を使用して接続するか、上記の `.mcp.json` を使用します。

=== "ChatGPT"

    1. **Developer Mode** をオンにします。
    2. **Settings** → **Apps** → **Create app**（またはコネクタを追加）。
    3. `https://data.doublezero.xyz/api/mcp` を貼り付けます。

=== "Codex CLI"

    ```bash
    codex mcp add doublezero --url https://data.doublezero.xyz/api/mcp
    ```

    次に `/mcp` と入力し、**doublezero** を選択します。

=== "Other"

    MCP 対応のクライアントであれば、エンドポイント URL（Streamable HTTP）を使用できます。サーバー名を `doublezero` にしてください。

## レート制限

ツール呼び出しは、IP あたり毎分 100 リクエストに制限されています。制限に達すると、呼び出しはエラーを返します — 少し待ってからリトライしてください。

## トラブルシューティング

- クライアントで **doublezero** が接続済みと表示されていることを確認してください。表示されない場合は、切断してから URL を再度追加してください。
- URL は正確に `https://data.doublezero.xyz/api/mcp` である必要があります（`/api/mcp` を含めてください）。
- MCP はあなたのマシンに SSH 接続できません。ローカルコマンドの実行（または承認）は引き続きご自身で行います。
- フィード / Edge Connect のセットアップについては、MCP を接続してオンボーディングウォークスルーを依頼してください。その他の問題については、[サポート](support.md) をご覧ください。