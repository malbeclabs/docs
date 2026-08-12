---
description: LLM 向けランブック — 接続済みの Solana バリデーターを設定し、リーダーシュレッドを DoubleZero Edge にパブリッシュします。GitHub raw 経由で MCP に提供されます。ドキュメントサイトには公開されません。
---

# シュレッドのパブリッシュ (Edge) — ランブック

このページは GitHub raw 経由で DoubleZero MCP (`get_onboarding_runbook`) 向けに提供されています。ドキュメントサイトには公開されません。

1. [DoubleZero MCP](mcp.md) (`https://data.doublezero.xyz/api/mcp`) に接続します。
2. バリデーターが**既に DoubleZero IBRL** (mainnet-beta) に接続されていることを確認します。まだの場合は、先に [バリデーター接続 (IBRL Mainnet)](solana-ibrl-runbook.md) を完了してください。
3. 以下の手順を実行します。ヒューマンガイド: [Validator Multicast Connection](Validator Multicast Connection.md)。

**成功の状態:** バリデーターがリーダーシュレッドを `233.84.178.1:7733` に送信し、`edge-solana-shreds` でのマルチキャストパブリッシュが稼働しており、少なくとも1つのリーダースロット後に [publisher-check](https://data.doublezero.xyz/dz/publisher-check) でパブリッシュが確認できること。

このパスは**バリデーター**向けです。シュレッドを*サブスクライブ*したいトレーディングファームは [シュレッドのサブスクライブ](solana-shreds-runbook.md) を使用してください。

---

## 前提条件

| 必要なもの | 備考 |
|------|--------|
| IBRL トンネルが既に稼働していること | [IBRL Mainnet ランブック](solana-ibrl-runbook.md) / [ヒューマンガイド](DZ Mainnet-beta Connection.md)。 |
| サポートされているクライアント | Jito-Agave **3.1.9+**、JitoBam 3.1.9+、Frankendancer、または Harmonic **3.1.11+**。それ以外のバージョンではパブリッシュされません。 |
| 再起動ウィンドウ | シュレッド送信先の追加にはバリデーターの再起動が必要です。 |

---

## 手順

### 1. クライアントを Edge シュレッドグループに向ける

**Jito-Agave (v3.1.9+) および Harmonic (3.1.11+)** — バリデーター起動スクリプトに以下を追加します:

```text
--shred-receiver-address 233.84.178.1:7733
```

Jito と `edge-solana-shreds` に同時に送信できます。バリデーターを再起動してください。

**Frankendancer** — `config.toml` に以下を追加します:

```toml
[tiles.shred]
additional_shred_destinations_leader = [ "233.84.178.1:7733", ]
```

バリデーターを再起動してください。

### 2. マルチキャストグループでパブリッシュする

```bash
doublezero connect ibrl && doublezero connect multicast --publish edge-solana-shreds
```

**確認:** `doublezero status` が引き続き IBRL/up であること、およびユーザーが `edge-solana-shreds` のパブリッシャーになっていること。

ライブグループ IP: `doublezero multicast group list`。すべてのシュレッドフィードは UDP **`7733`** を使用し、IP でフィードを選択します。

| フィード | アドレス |
|------|---------|
| `edge-solana-shreds` (リーダー) | `233.84.178.1:7733` |
| `edge-solana-retrans-eu` | `233.84.178.12:7733` |
| `edge-solana-retrans-apac` | `233.84.178.13:7733` |
| `edge-solana-retrans-amer` | `233.84.178.14:7733` |

### 3. パブリッシュを確認する

[publisher-check](https://data.doublezero.xyz/dz/publisher-check) を開きます。バリデーターが**少なくとも1スロット分**のリーダーシュレッドをパブリッシュするまで、確認は表示されません。

正常な状態: リーダースロットに合わせたアウトバウンドのスパイク（のこぎり波形）。スロットパターンのない一定のアウトバウンドは**リトランスミット**（不正）です。

---

## 注意事項

1. **クライアントバージョンの誤り。** 3.1.9+ / 3.1.11+ でない場合 → ワイヤー上に有用なデータが流れません。
2. **リトランスミットフラグが残っている。** Jito-Agave から `--shred-retransmit-receiver-address` を削除してください。publisher-check の **No Retransmit Shreds** 列（2エポック vs 最近のスロットビュー）を確認してください。
3. **まだリーダーになっていない。** リーダースロットが来るまでダッシュボードは空のままです。
4. **IBRL が稼働していない。** ここから始めないでください。まず IBRL を完了してください。

---

## 関連項目

- [Validator Multicast Connection](Validator Multicast Connection.md)
- [Validator Rewards](Validator Rewards.md)