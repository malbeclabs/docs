---
description: LLM向けランブック — Edge シュレッド シートを購入し、doublezero1 上で Solana シュレッド マルチキャストを受信します。GitHub raw 経由で MCP に提供されます。ドキュメントサイトには公開されません。
---

# シュレッドのサブスクライブ（Edge）— ランブック

このページは DoubleZero MCP（`get_onboarding_runbook`）向けに GitHub raw 経由で提供されています。ドキュメントサイトには公開されません。

1. [DoubleZero MCP](mcp.md)（`https://data.doublezero.xyz/api/mcp`）に接続します。
2. シュレッドを**受信**する Linux ホスト（または SSH）、`doublezero-solana` 用のウォレット/キーペア、および希望するフィード（leader または retransmit）を指定します。
3. 以下の手順を順番に実施します。ヒューマンガイド：[Edge Subscriber Connection](Edge Subscriber Connection.md)。

**成功した場合の状態：** 現在のエポックにシートが割り当てられ、`doublezero status` でトンネルがアップと表示され、`doublezero1` のポート `7733` で UDP シュレッドが受信される（leader グループ `233.84.178.1`）。

接続することにより、ユーザーは [DoubleZero Terms of Use](https://doublezero.xyz/terms-protocol) に同意したものとみなされます。データは内部利用のみを目的とし、再送信は禁止されています。

---

## 前提条件

| 必要なもの | 備考 |
|------|--------|
| Linux/amd64 ホスト | パブリック IPv4、NAT なし。AWS の場合：ENI の送信元/送信先チェックを無効化。 |
| Solana CLI + `doublezero-solana` | `sudo apt update && sudo apt install doublezero-solana` |
| ウォレット | `~/.config/solana/id.json`（または `--keypair`）。**SOL**（手数料）+ **USDC**（シート エスクロー）が必要。 |
| USDC ミント | `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v` |
| ファイアウォール | GRE、BGP（`169.254.0.0/16` tcp/179）、PIM、`doublezero1` 上の UDP `7733`、`doublezero0` 上の UDP `44880`。 |

---

## 手順

### 1. クライアントとパッケージのインストール

[セットアップ](setup.md) に従い、次を実行します：

```bash
sudo apt update && sudo apt install doublezero-solana
```

`~/.config/doublezero/id.json` をバックアップしてください。

### 2. ファイアウォール

```bash
sudo iptables -A OUTPUT -p gre -j ACCEPT
sudo iptables -A INPUT -i doublezero1 -s 169.254.0.0/16 -d 169.254.0.0/16 -p tcp --dport 179 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero1 -s 169.254.0.0/16 -d 169.254.0.0/16 -p tcp --dport 179 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero1 -p pim -j ACCEPT
sudo iptables -A INPUT -i doublezero1 -p udp --dport 7733 -j ACCEPT
sudo iptables -A INPUT -i doublezero0 -p udp --dport 44880 -j ACCEPT
```

UFW の設定方法についてはヒューマンガイドを参照してください。

### 3. リコンサイラーの有効化

シートがトンネルを自動プロビジョニングするために必要です。

```bash
doublezero enable
```

### 4. ウォレット

```bash
solana-keygen new    # 必要に応じて — ~/.config/solana/id.json に書き込まれます。バックアップしてください
solana address
```

SOL と USDC を入金してください。

### 5. デバイスと価格の選択

```bash
doublezero latency
doublezero-solana shreds price
doublezero-solana shreds price --device-code <Device_Name>
```

最低レイテンシの**デバイスコード**とエポック価格（ベース + プレミアム）を確認します。**1 エポック以上**の資金を用意することを推奨します。価格 UI：[devices](https://data.doublezero.xyz/dz/shreds/devices)。

### 6. シートの購入（ブロッキング）

受信ホスト上で：

```bash
curl -4 -s ifconfig.me; echo
```

```bash
doublezero-solana shreds pay \
  --device-code <Device_Name> \
  --client-ip <Target_IP> \
  --amount <Cost_Of_Seat>
```

`--client-ip` はシュレッドを受信するマシンのパブリック IPv4 である必要があります。`--amount` は USDC の10進数値（例：`100`）で、エポック価格を満たす必要があります。

エポックの残りが 10% 未満の場合、CLI が警告を表示します。`--accept-partial-epoch` を使用すると残りの期間を今すぐ取得します。それ以外の場合は次のエポックまで待ちます。精算時にエスクローの資金が不足していると → シート喪失、トンネル切断、**テニュア喪失**となります。

割り当てが完了すると、デーモンが GRE トンネルを起動します。

```bash
doublezero status
doublezero-solana shreds list
```

### 7. シュレッドの確認

Leader シュレッド：`doublezero1` 上の `233.84.178.1:7733`。グループの確認には `doublezero multicast group list` を使用します。

| フィード | グループ | アドレス |
|------|-------|---------|
| Leader | `edge-solana-shreds` | `233.84.178.1:7733` |
| Root | `edge-solana-root` | `233.84.178.16:7733` |
| Retransmit EU | `edge-solana-retrans-eu` | `233.84.178.12:7733` |
| Retransmit APAC | `edge-solana-retrans-apac` | `233.84.178.13:7733` |
| Retransmit AMER | `edge-solana-retrans-amer` | `233.84.178.14:7733` |

ポート `5765` はパブリッシャーのハートビートであり、シュレッドではありません。トラフィックは GRE カプセル化されています。一部のパイプライン（XDP デシュレッダー）では GRE の除去が必要です。

```bash
sudo tcpdump -ni doublezero1 host 233.84.178.1 and udp port 7733
```

---

## よくある問題

1. **リコンサイラーがオフ。** `doublezero enable` なしでは、支払いを行ってもトンネルは起動しません。
2. **`--client-ip` ≠ デーモン IP。** 自動検出がシートと一致する必要があります。
3. **`Multicast user already exists`。** まず切断してください：`doublezero disconnect`、その後 `shreds pay` を再試行します。
4. **金額が現在の価格を下回っている。** `shreds price` を再確認し、`--amount` を増額してください。
5. **支払い後にシートが割り当てられない。** エポック終盤（次のエポック）、デバイスが満席（テニュアが高い）、または精算前に引き出した場合。
6. **エスクローの資金を維持する。** 追加の `shreds pay` で補充してください。残高がエポック価格を下回らないようにしてください。

---

## 関連情報

- [Edge Subscriber Connection](Edge Subscriber Connection.md)
- [サポート](support.md)
- スコアボード / シート：[data.doublezero.xyz](https://data.doublezero.xyz/dz/shreds/scoreboard)