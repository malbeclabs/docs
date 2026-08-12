---
description: LLM向けランブック — Solana Mainnet-BetaバリデーターをIBRLモードでDoubleZeroに接続します。GitHub raw経由でMCPに提供されます。ドキュメントサイトには公開されません。
---

# バリデーター接続 (IBRL Mainnet) — ランブック

このページはDoubleZero MCP (`get_onboarding_runbook`) 向けにGitHub raw経由で提供されています。ドキュメントサイトには公開されません。

1. [DoubleZero MCP](mcp.md) (`https://data.doublezero.xyz/api/mcp`) を接続します。
2. これが **Solana Mainnet-Beta バリデーター** であること、Linuxホスト（またはSSH）、およびバリデーターIDキーペアの場所を伝えてください。
3. 以下のステップを順番に実行してください。手動で行いたい場合は、[人間向けガイド](DZ Mainnet-beta Connection.md)を使用してください。

**成功の基準:** `doublezero status` でトンネルが **up**、User Type が **IBRL**、Network が **mainnet-beta** と表示されること。`Tunnel src` と `Doublezero IP` がホストのパブリックIPv4と一致すること。

IBRLはバリデータークライアントの再起動を必要としません。既存のパブリックIPを使用します。

---

## 前提条件

| 必要なもの | 備考 |
|------|--------|
| Linux/amd64 ホスト | DoubleZeroはコンテナ内ではなく、**バリデーターホスト上に**インストールしてください。 |
| パブリックIPv4、NATなし | ゴシップIPがこのホストと一致する必要があります。 |
| `$PATH` 上のSolana CLI | `solana sign-offchain-message` に必要です。 |
| バリデーターIDキーペア | コマンドを実行するユーザーが読み取り可能であること（多くの場合 `sol` ユーザー配下）。 |
| ID上に1 SOL以上 | パスポート / オンチェーンリクエスト用。 |
| GRE (IPプロトコル47) + BGP | BGPは `169.254.0.0/16` tcp/179。 |
| `doublezero-solana` | `sudo apt update && sudo apt install doublezero-solana`（またはディストリビューション相当のコマンド）。 |

バリデーターIDはSolanaゴシップと照合され、ターゲットIPが決定されます。同じIP上のダミーIDは無視されます。ゴシップ内のプライマリIDのみが使用されます。

---

## ステップ

### 1. クライアントのインストール

`doublezero` がインストールされていない場合は、[セットアップ](setup.md)に従ってください。Mainnetパッケージ：

```bash
curl -1sLf https://dl.cloudsmith.io/public/malbeclabs/doublezero/setup.deb.sh | sudo -E bash
sudo apt-get install doublezero
```

Rocky / RHEL: `setup.rpm.sh` を使用し、`sudo yum install doublezero` を実行してください。

**確認:** `sudo systemctl status doublezerod` がactiveであること。`~/.config/doublezero/id.json` をバックアップしてください。

### 2. デーモンをmainnet-betaに向ける

```bash
DESIRED_DOUBLEZERO_ENV=mainnet-beta \
	&& sudo mkdir -p /etc/systemd/system/doublezerod.service.d \
	&& echo -e "[Service]\nExecStart=\nExecStart=/usr/bin/doublezerod -sock-file /run/doublezerod/doublezerod.sock -env $DESIRED_DOUBLEZERO_ENV" | sudo tee /etc/systemd/system/doublezerod.service.d/override.conf > /dev/null \
	&& sudo systemctl daemon-reload \
	&& sudo systemctl restart doublezerod \
	&& doublezero config set --env $DESIRED_DOUBLEZERO_ENV  > /dev/null \
	&& echo "✅ doublezerod configured for environment $DESIRED_DOUBLEZERO_ENV"
```

約30秒待ってから、`doublezero latency` でmainnetデバイスが一覧表示されるはずです。

### 3. `doublezero0` でUDP 44880を開放する

```bash
sudo iptables -A INPUT -i doublezero0 -p udp --dport 44880 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero0 -p udp --dport 44880 -j ACCEPT
```

UFWの場合: `sudo ufw allow in on doublezero0 to any port 44880 proto udp` および対応する `out` ルール。[セットアップ](setup.md)に記載のとおり、GREとBGPも許可してください。

### 4. DoubleZero IDとプライマリバリデーターの確認

セットアップ時の DoubleZero ID は、**プライマリ**のものがすべてのバックアップにも存在する必要があります（`~/.config/doublezero/id.json`）。

```bash
doublezero address
doublezero-solana passport find-validator -u mainnet-beta
```

プライマリについて以下を確認してください：ゴシップに存在する、リーダースケジュールに含まれている、「can connect as a primary」であること。バックアップでは同じ `find-validator` を実行し、リーダースケジュールに含まれて**いない**ことを確認してください。

マシンが1台のみの場合：以降のコマンドで `--backup-validator-ids` / `backup_ids=` を省略してください。

### 5. アクセスメッセージの準備（プライマリ）

プライマリ上で実行してください（アクティブなステーク、ゴシップ内にIDが存在）：

```bash
doublezero-solana passport prepare-validator-access -u mainnet-beta \
  --doublezero-address <DOUBLEZERO_ADDRESS> \
  --primary-validator-id <NODE_ID> \
  --backup-validator-ids <ID2>,<ID3>,<ID4>
```

バックアップがない場合は `--backup-validator-ids` を省略してください（最大3つ）。出力から `solana sign-offchain-message …` の行をコピーしてください。

### 6. バリデーターIDキーで署名する

プライマリ上で、出力されたコマンドを実行してください（IDキーペアを使用し、DoubleZeroキー**だけ**ではありません）：

```bash
solana sign-offchain-message \
   service_key=<DOUBLEZERO_ADDRESS>,backup_ids=<ID2>,<ID3>,<ID4> \
   -k <identity-keypair-file.json>
```

**出力:** 署名文字列。次のステップに使用してください。

### 7. バリデーターアクセスのリクエスト

```bash
doublezero-solana passport request-validator-access -k <path-to-keypair> -u mainnet-beta \
  --primary-validator-id <NODE_ID> \
  --backup-validator-ids <ID2>,<ID3>,<ID4> \
  --signature <SIGNATURE> \
  --doublezero-address <DOUBLEZERO_ADDRESS>
```

Sentinelが検証しアクセスパスを作成するのを待ちます。オプション：エージェントは `pubkey`（`doublezero address`）とホストのパブリックIPを使用して、パスが存在するまで **`check_edge_access`** を呼び出すことができます。

### 8. IBRL接続

```bash
doublezero connect ibrl
```

GREが確立するまで約1分待ちます。それまでステータスは `down` / `Unknown` と表示される場合があります。

```bash
doublezero status
```

**合格:** `up`、User Type `IBRL`、Network `mainnet-beta`、トンネルは通常 `doublezero0`。

```bash
ip route
```

`doublezero0` 経由のBGPで学習されたルートが表示されるはずです。

---

## 注意事項

1. **環境の間違い。** テストネットパッケージ / `DESIRED_DOUBLEZERO_ENV=testnet` ではmainnet-betaに接続できません。
2. **IDがゴシップに存在しない。** 同じIP上のダミーIDではマシンを登録できません。
3. **バックアップはプライマリのDoubleZero IDを共有する必要があります。** `id.json` をコピーしてください。2つ目のIDをkeygenしないでください。
4. **バリデーターIDで署名してください。** DoubleZeroキーではありません。
5. **`connect ibrl` 後の約1分間のステータスdown** はGREが確立するまでの正常な動作です。

---

## 関連項目

- [バリデーター Mainnet-Beta 接続](DZ Mainnet-beta Connection.md)
- [セットアップ](setup.md)
- 次へ: [シュレッド公開 (Edge)](solana-shreds-publisher-runbook.md)