---
description: Model Context Protocol（MCP）を通じて、DoubleZero Data をお使いの AI アシスタントと連携 — エンドポイント、ツール、接続方法。
---

# 自分の AI を接続する

!!! info
    ホストで Edge データを受信するには、まず [doublezero.xyz/edge/subscribe](https://doublezero.xyz/edge/subscribe) でフィードを購入してください。その後、MCP が接続手順を案内します。

[Model Context Protocol（MCP）](https://modelcontextprotocol.io)を通じて、DoubleZero Data をお使いの AI アシスタントと連携できます。同じサーバーのドキュメントは、データアプリの [data.doublezero.xyz/docs/mcp](https://data.doublezero.xyz/docs/mcp) にも掲載されています。

## MCP とは？ {#whats-an-mcp}

MCP は、AI エージェントが外部サービスのツールを呼び出せるようにするオープン標準です。MCP がなければ、モデルはチャットに貼り付けた情報しか知りません。MCP があれば、エージェントは DoubleZero のドキュメントを読み、オンボーディングランブックを読み込み、あなたに代わってパブリックネットワークデータを照会できます。

DoubleZero は **1 つの** MCP を運用しています。互換性のある任意のクライアントを、以下のエンドポイントに向けてください。

## エンドポイント {#endpoint}

```
https://data.doublezero.xyz/api/mcp
```

ログインは不要です。サーバーは [Streamable HTTP](https://modelcontextprotocol.io/docs/concepts/transports#streamable-http) トランスポートを使用します。

## 利用可能なツール {#available-tools}

| ツール | 説明 |
|------|-------------|
| `execute_sql` | ClickHouse にメトリクス、バリデーター、ネットワークデータを照会 |
| `execute_cypher` | Neo4j にトポロジー、パス、接続性を照会（メインネットのみ） |
| `get_schema` | データベーススキーマ（テーブル、カラム、型）を取得 |
| `read_docs` | DoubleZero のドキュメントを読み取り |
| `get_onboarding_runbook` | ガイド付きオンボーディングウォークスルー。service を省略すると、利用可能な一覧を表示。 |
| `check_edge_access` | ID 公開鍵が受信 IP のアクセスパスを持っているか確認（完全一致または `0.0.0.0`）。エージェントはオンボーディング中にこれを呼び出します。 |

これらのツールを自分で呼び出す必要はありません。クライアントが接続された後、自然言語で質問してください。例：

- 「この Linux ホストでマーケットデータフィードを接続する手順を教えて。」
- 「DoubleZero とは？」／「Edge Connect はどう動くの？」
- 「DoubleZero 上の Solana バリデーターは何台？」
- 「ニューヨークからアムステルダムまでのパスは？」
- 「トンネルに Network Unreachable と表示される — ランブックを確認して。」

ガイド付きセットアップの場合、エージェントは（単なる `read_docs` ではなく）`get_onboarding_runbook` を呼び出す必要があります。SQL や Cypher の場合は、まず `get_schema` を呼び出す必要があります。

すべてのツールは読み取り専用です。取引の実行、資金の移動、キーペア / `DZ_SECRET` の閲覧はできません。

## AI エージェントを接続する {#connect-your-ai-agent}

すべてのプラットフォームで `https://data.doublezero.xyz/api/mcp` を使用してください。

### Claude Desktop & Codex Desktop {#claude-desktop-codex-desktop}

1. **Settings** に移動
2. **Manage Connectors** をクリック
3. **Add Custom Connector** をクリック
4. 上記のエンドポイント URL を入力

### コードエディター & IDE {#code-editors-ides}

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
    2. **Settings** → **Apps** → **Create app**（またはコネクターを追加）。
    3. `https://data.doublezero.xyz/api/mcp` を貼り付けます。

=== "Codex CLI"

    ```bash
    codex mcp add doublezero --url https://data.doublezero.xyz/api/mcp
    ```

    次に `/mcp` と入力し、**doublezero** を選択します。

=== "Other"

    MCP 対応の任意のクライアントでエンドポイント URL（Streamable HTTP）を使用できます。サーバー名を `doublezero` にしてください。

## レート制限 {#rate-limits}

ツール呼び出しは、IP あたり毎分 100 リクエストにレート制限されています。制限に達すると、呼び出しはエラーを返します — しばらく待ってからリトライしてください。

## トラブルシューティング {#troubleshooting}

- クライアントに **doublezero** が接続済みと表示されていることを確認してください。表示されない場合は、切断してから URL を再度追加してください。
- URL は正確に `https://data.doublezero.xyz/api/mcp`（`/api/mcp` を含む）である必要があります。
- MCP はあなたのマシンに SSH 接続できません。ローカルコマンドの実行（または承認）はご自身で行う必要があります。
- フィード / Edge Connect のセットアップについては、MCP を接続してオンボーディングウォークスルーを依頼してください。その他の問題については、[サポート](support.md)をご覧ください。