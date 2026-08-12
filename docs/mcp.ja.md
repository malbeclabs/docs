---
description: Model Context Protocol（MCP）を通じて、DoubleZero DataをあなたのAIアシスタントで利用 — エンドポイント、ツール、接続方法。
---

# あなたのAIを接続する

!!! info
    ホストでEdgeデータを受信するには、まず [doublezero.xyz/edge/subscribe](https://doublezero.xyz/edge/subscribe) でフィードを購入してください。その後、MCPが接続手順を案内します。

[Model Context Protocol（MCP）](https://modelcontextprotocol.io)を通じて、DoubleZero Dataをあなた自身のAIアシスタントで利用できます。同じサーバーの情報はデータアプリの [data.doublezero.xyz/docs/mcp](https://data.doublezero.xyz/docs/mcp) にも記載されています。

## MCPとは？

MCPは、AIエージェントが外部サービスのツールを呼び出せるようにするオープンスタンダードです。MCPがなければ、モデルはチャットに貼り付けた情報しか知りません。MCPがあれば、エージェントはDoubleZeroのドキュメントを読み、オンボーディングランブックを読み込み、あなたに代わって公開ネットワークデータをクエリできます。

DoubleZeroは**1つ**のMCPを運用しています。互換性のあるクライアントを以下のエンドポイントに向けてください。

## エンドポイント

```
https://data.doublezero.xyz/api/mcp
```

ログインは不要です。サーバーは [Streamable HTTP](https://modelcontextprotocol.io/docs/concepts/transports#streamable-http) トランスポートを使用します。

## 利用可能なツール

| ツール | 説明 |
|------|-------------|
| `execute_sql` | ClickHouseにメトリクス、バリデーター、ネットワークデータをクエリ |
| `execute_cypher` | Neo4jにトポロジー、パス、接続性をクエリ（メインネットのみ） |
| `get_schema` | データベーススキーマ（テーブル、カラム、型）を取得 |
| `read_docs` | DoubleZeroのドキュメントを読み取り |
| `get_onboarding_runbook` | ガイド付きオンボーディングウォークスルー。サービスを省略すると、利用可能なものの一覧を表示。 |
| `check_edge_access` | IDの公開鍵が受信IP（完全一致または `0.0.0.0`）のアクセスパスを持っているか確認。エージェントはオンボーディング中にこれを呼び出します。 |

これらを自分で呼び出す必要はありません。クライアントが接続された後、自然言語で質問してください。例えば：

- 「このLinuxホストでマーケットデータフィードを接続する手順を教えて。」
- 「DoubleZeroとは？」/「Edge Connectはどのように動作する？」
- 「DoubleZero上にSolanaバリデーターはいくつある？」
- 「ニューヨークからアムステルダムまでのパスは？」
- 「トンネルがNetwork Unreachableと表示される — ランブックを確認して。」

ガイド付きセットアップの場合、エージェントは（`read_docs` だけでなく）`get_onboarding_runbook` を呼び出すべきです。SQLやCypherの場合は、最初に `get_schema` を呼び出すべきです。

すべてのツールは読み取り専用です：取引の実行、資金の移動、キーペア / `DZ_SECRET` の閲覧はできません。

## AIエージェントを接続する {#connect-your-ai-agent}

すべてのプラットフォームで `https://data.doublezero.xyz/api/mcp` を使用してください。

### Claude Desktop & Codex Desktop

1. **Settings** に移動
2. **Manage Connectors** をクリック
3. **Add Custom Connector** をクリック
4. 上記のエンドポイントURLを入力

### コードエディタ & IDE

Claude Code、Cursor、Windsurf、Continue、その他のMCP互換ツールで動作します。プロジェクトルートに `.mcp.json` ファイルを追加してください：

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

    次に `/mcp` と入力し、**doublezero** を選択して接続されていることを確認します。

=== "Cursor"

    1. **Settings** → **Cursor Settings** → **Tools & MCPs**。
    2. エンドポイントURLを使用して接続するか、上記の `.mcp.json` を使用します。

=== "ChatGPT"

    1. **Developer Mode** をオンにします。
    2. **Settings** → **Apps** → **Create app**（またはコネクタを追加）。
    3. `https://data.doublezero.xyz/api/mcp` を貼り付けます。

=== "Codex CLI"

    ```bash
    codex mcp add doublezero --url https://data.doublezero.xyz/api/mcp
    ```

    次に `/mcp` で **doublezero** を選択します。

=== "Other"

    MCP互換のクライアントであれば、エンドポイントURL（Streamable HTTP）を使用できます。サーバー名を `doublezero` にしてください。

## レート制限

ツール呼び出しはIPあたり1分間に100リクエストに制限されています。制限に達するとエラーが返されます — しばらく待ってからリトライしてください。

## トラブルシューティング

- クライアントが **doublezero** を接続済みと表示していることを確認してください。表示されない場合は、切断してURLを再度追加してください。
- URLは正確に `https://data.doublezero.xyz/api/mcp`（`/api/mcp` を含む）である必要があります。
- MCPはあなたのマシンにSSH接続できません。ローカルコマンドの実行（または承認）はあなた自身が行います。
- フィード / Edge Connectのセットアップについては、MCPを接続してオンボーディングウォークスルーを依頼してください。その他の問題については、[サポート](support.md)を参照してください。