---
description: doublezerod のインストールおよびバリデーターやノードを DoubleZero ネットワークに接続するためのステップバイステップガイド。
---

# DoubleZero のセットアップ方法

!!! info "用語について"
    DoubleZero を初めてお使いですか？[用語集](reference/glossary.md)で [doublezerod](reference/glossary.md#doublezerod)、[IBRL](reference/glossary.md#ibrl-increase-bandwidth-reduce-latency)、[DZD](reference/glossary.md#dzd-doublezero-device) などの用語の定義をご確認ください。

!!! warning "DoubleZero に接続することにより、[DoubleZero 利用規約](https://doublezero.xyz/terms-protocol)に同意したものとみなされます"


## 前提条件
!!! warning inline end
    バリデーターの場合：DoubleZero はコンテナ内ではなく、バリデーターホストに直接インストールする必要があります。
- パブリック IP アドレスを持つインターネット接続（NAT なし）
- x86_64 サーバー
- 対応 OS：Ubuntu 22.04 以降、Debian 11 以降、または Rocky Linux / RHEL 9 以降
- DoubleZero を実行するサーバーでの root または sudo 権限
- 任意ですが推奨：デバッグ用の jq と curl

## DoubleZero への接続

DoubleZero Testnet と DoubleZero Mainnet-Beta は物理的に異なるネットワークです。インストール時に適切なネットワークを選択してください。

DoubleZero にオンボーディングする際、**DoubleZero ID** と呼ばれる公開鍵で表される **DoubleZero アイデンティティ**を確立します。この鍵は DoubleZero がお使いのマシンを認識する方法の一部です。

## 1. DoubleZero パッケージのインストール

!!! info "現在のバージョン"
    | パッケージ | Mainnet-Beta | Testnet |
    |---------|-------------|---------|
    | `doublezero` | `MAINNET_CLIENT_VERSION` | `TESTNET_CLIENT_VERSION` |


お使いのオペレーティングシステムに応じて、以下の手順に従ってください：

### Ubuntu / Debian

Mainnet-Beta の現在の推奨デプロイ方法：
```bash
curl -1sLf https://dl.cloudsmith.io/public/malbeclabs/doublezero/setup.deb.sh | sudo -E bash
sudo apt-get install doublezero
```


Testnet の現在の推奨デプロイ方法：
```bash
curl -1sLf https://dl.cloudsmith.io/public/malbeclabs/doublezero-testnet/setup.deb.sh | sudo -E bash
sudo apt-get install doublezero
```


### Rocky Linux / RHEL

Mainnet-Beta の現在の推奨デプロイ方法：
```bash
curl -1sLf https://dl.cloudsmith.io/public/malbeclabs/doublezero/setup.rpm.sh | sudo -E bash
sudo yum install doublezero
```


Testnet の現在の推奨デプロイ方法：
```bash
curl -1sLf https://dl.cloudsmith.io/public/malbeclabs/doublezero-testnet/setup.rpm.sh | sudo -E bash
sudo yum install doublezero
```


??? info "既存ユーザー向け：パッケージを *Testnet から Mainnet-Beta*、または *Mainnet-Beta から Testnet* に変更する"
    上記のパッケージリポジトリからインストールすると、DoubleZero **Testnet** または **DoubleZero Mainnet Beta** に固有のものになります。ネットワークを切り替える場合は、以前にインストールしたパッケージリポジトリを削除し、ターゲットリポジトリに更新する必要があります。

    この例では、Testnet から Mainnet-Beta への移行手順を説明します。

    Mainnet-Beta から Testnet への移行も同じ手順で行えます。その場合、ステップ 3 を上記の Testnet 用インストールコマンドに置き換えてください。


    1. 古いリポジトリファイルの検索

        まず、システム上にある既存の DoubleZero リポジトリ設定ファイルを見つけます：

        `find /etc/apt | grep doublezero`

        `find /usr/share/keyrings/ | grep doublezero`

    2. 古いリポジトリファイルの削除

        前のステップで見つかった古いリポジトリファイルを削除します。例：

        ```
        sudo rm /etc/apt/sources.list.d/malbeclabs-doublezero.list
        sudo rm /usr/share/keyrings/malbeclabs-doublezero-archive-keyring.gpg
        ```
    3. 新しいリポジトリからのインストール

        新しい Mainnet-Beta リポジトリを追加し、最新パッケージをインストールします：

        ```
        curl -1sLf https://dl.cloudsmith.io/public/malbeclabs/doublezero/setup.deb.sh | sudo -E bash
        sudo apt-get install doublezero=<current_recomended_version_above>
        ```


#### `doublezerod` のステータス確認

パッケージのインストール後、新しい systemd ユニットがインストール、有効化、起動されます。ステータスを確認するには以下を実行します：
```
sudo systemctl status doublezerod
```


### GRE および BGP 用のファイアウォール設定

DoubleZero は GRE トンネリング（IP プロトコル 47）と BGP ルーティング（リンクローカルアドレスの tcp/179）を使用します。ファイアウォールでこれらのプロトコルを許可してください：

iptables で GRE と BGP を許可する場合：

```bash
sudo iptables -A INPUT -p gre -j ACCEPT
sudo iptables -A OUTPUT -p gre -j ACCEPT
sudo iptables -A INPUT -i doublezero0 -s 169.254.0.0/16 -d 169.254.0.0/16 -p tcp --dport 179 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero0 -s 169.254.0.0/16 -d 169.254.0.0/16 -p tcp --dport 179 -j ACCEPT
```


UFW で GRE と BGP を許可する場合：

```bash
sudo ufw allow proto gre from any to any
sudo ufw allow in on doublezero0 from 169.254.0.0/16 to 169.254.0.0/16 port 179 proto tcp
sudo ufw allow out on doublezero0 from 169.254.0.0/16 to 169.254.0.0/16 port 179 proto tcp
```


## 2. 新しい DoubleZero アイデンティティの作成

以下のコマンドでサーバー上に DoubleZero アイデンティティを作成します：

```bash
doublezero keygen
```

!!! info
    既存の ID を使用したい場合は、以下のオプション手順に従ってください。

    doublezero 設定ディレクトリを作成します

    ```
    mkdir -p ~/.config/doublezero
    ```

    DoubleZero で使用したい `id.json` を doublezero 設定ディレクトリにコピーまたはリンクします。

    ```
    sudo cp </path/to/id.json> ~/.config/doublezero/
    ```
## 3. サーバーの DoubleZero アイデンティティの確認

DoubleZero アイデンティティを確認します。このアイデンティティは、お使いのマシンと DoubleZero 間の接続を作成するために使用されます

```bash
doublezero address
```

**出力：**
```bash
YourDoubleZeroAddress11111111111111111111111111111
```

## 4. doublezerod が DZ デバイスを検出したか確認する

接続する前に、`doublezerod` が利用可能なすべての DZ テストネットスイッチを検出し、ping できていることを確認してください：

```
doublezero latency
```

出力例：

```
$ doublezero latency
 pubkey                                       | name      | ip             | min      | max      | avg      | reachable
 96AfeBT6UqUmREmPeFZxw6PbLrbfET51NxBFCCsVAnek | la2-dz01  | 207.45.216.134 |   0.38ms |   0.45ms |   0.42ms | true
 CCTSmqMkxJh3Zpa9gQ8rCzhY7GiTqK7KnSLBYrRriuan | ny5-dz01  | 64.86.249.22   |  68.81ms |  68.87ms |  68.85ms | true
 BX6DYCzJt3XKRc1Z3N8AMSSqctV6aDdJryFMGThNSxDn | ty2-dz01  | 180.87.154.78  | 112.16ms | 112.25ms | 112.22ms | true
 55tfaZ1kRGxugv7MAuinXP4rHATcGTbNyEKrNsbuVLx2 | ld4-dz01  | 195.219.120.66 | 138.15ms | 138.21ms | 138.17ms | true
 3uGKPEjinn74vd9LHtC4VJvAMAZZgU9qX9rPxtc6pF2k | ams-dz001 | 195.219.138.50 | 141.84ms | 141.97ms | 141.91ms | true
 65DqsEiFucoFWPLHnwbVHY1mp3d7MNM2gNjDTgtYZtFQ | frk-dz01  | 195.219.220.58 | 143.52ms | 143.62ms | 143.58ms | true
 9uhh2D5c14WJjbwgM7BudztdoPZYCjbvqcTPgEKtTMZE | sg1-dz01  | 180.87.102.98  | 176.66ms | 176.76ms | 176.72ms | true
```

出力にデバイスが表示されない場合は、10〜20 秒待ってから再試行してください。

## 5. DoubleZero からの切断

次のセクションでは DoubleZero 環境を設定します。成功を確実にするため、現在のセッションを切断してください。これにより、マシン上で複数のトンネルが開いていることに関連する問題を回避できます。

確認：

```bash
doublezero status
```

`up` と表示された場合は以下を実行します：

```bash
doublezero disconnect
```

### 次のステップ：テナント

DoubleZero への接続はユースケースによって異なります。DoubleZero では、テナントは類似したユーザープロファイルを持つグループです。例としては、ブロックチェーン、データ転送レイヤーなどがあります。

### [こちらからテナントを選択してください](tenant.md)


# オプション：Prometheus メトリクスの有効化

Prometheus メトリクスに慣れているオペレーターは、DoubleZero の監視のためにメトリクスを有効にすることを検討してください。これにより、DoubleZero クライアントのパフォーマンス、接続ステータス、運用状況を可視化できます。

## 利用可能なメトリクス

DoubleZero はいくつかの主要なメトリクスを公開しています：
- **ビルド情報**：バージョン、コミットハッシュ、ビルド日時
- **セッションステータス**：DoubleZero セッションがアクティブかどうか
- **接続メトリクス**：レイテンシと接続情報
- **パフォーマンスデータ**：スループットとエラー率

## Prometheus メトリクスの有効化

DoubleZero クライアントで Prometheus メトリクスを有効にするには、以下の手順に従ってください：

### 1. doublezerod の systemd サービス起動コマンドの変更

systemd のオーバーライド設定を作成または編集します：

```bash
sudo mkdir -p /etc/systemd/system/doublezerod.service.d/
sudo nano /etc/systemd/system/doublezerod.service.d/override.conf
```

以下の設定に置き換えます：

`-env` フラグは、データを収集したいネットワークに応じて `testnet` または `mainnet-beta` を指定する必要があります。以下のサンプルブロックでは `testnet` を使用しています。必要に応じて `mainnet-beta` に変更してください。

```ini
[Service]
ExecStart=
ExecStart=/usr/bin/doublezerod -sock-file /run/doublezerod/doublezerod.sock -env testnet -metrics-enable -metrics-addr localhost:2113
```

### 2. サービスのリロードと再起動

```bash
sudo systemctl daemon-reload
sudo systemctl restart doublezerod
sudo systemctl status doublezerod
```

### 3. メトリクスが利用可能か確認

メトリクスエンドポイントが応答しているかテストします：

```bash
curl -s localhost:2113/metrics | grep doublezero
```

期待される出力：

```
# HELP doublezero_build_info Build information of the client
# TYPE doublezero_build_info gauge
doublezero_build_info{commit="0d684e1b",date="2025-09-10T16:30:25Z",version="0.6.4"} 1
# HELP doublezero_session_is_up Status of session to doublezero
# TYPE doublezero_session_is_up gauge
doublezero_session_is_up 0
```
## トラブルシューティング

メトリクスが表示されない場合：

1. **サービスステータスの確認**：`sudo systemctl status doublezerod`
2. **設定の確認**：`sudo systemctl cat doublezerod`
3. **ログの確認**：`sudo journalctl -u doublezerod -f`
4. **エンドポイントのテスト**：`curl -v localhost:2113/metrics`
5. **ポートの確認**：`netstat -tlnp | grep 2113`


## Prometheus サーバーの設定

設定およびセキュリティについては、このドキュメントの範囲外です。
Grafana は可視化に最適なオプションであり、Prometheus メトリクスの収集方法に関するドキュメントが[こちら](https://grafana.com/docs/alloy/latest/collect/prometheus-metrics/)に用意されています。

## Grafana ダッシュボード（オプション）

可視化のために、DoubleZero メトリクスを使用して Grafana ダッシュボードを作成できます。一般的なパネルには以下が含まれます：
- 経時的なセッションステータス
- ビルド情報
- 接続レイテンシの傾向
- エラー率の監視