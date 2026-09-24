---
description: doublezerodのインストールおよびバリデーターやノードをDoubleZeroネットワークに接続するためのステップバイステップガイド。
---

# DoubleZeroのセットアップ方法

!!! info "用語について"
    DoubleZeroを初めてお使いですか？[doublezerod](glossary.md#doublezerod)、[IBRL](glossary.md#ibrl-increase-bandwidth-reduce-latency)、[DZD](glossary.md#dzd-doublezero-device)などの用語の定義については、[用語集](glossary.md)をご覧ください。

!!! warning "DoubleZeroに接続することにより、[DoubleZero利用規約](https://doublezero.xyz/terms-protocol)に同意したものとみなされます"


## 前提条件
!!! warning inline end
    バリデーターの場合：DoubleZeroはコンテナ内ではなく、バリデーターホストに直接インストールする必要があります。
- パブリックIPアドレスを持つインターネット接続（NATなし）
- x86_64サーバー
- 対応OS：Ubuntu 22.04以降またはDebian 11以降、もしくはRocky Linux / RHEL 9以降
- DoubleZeroを実行するサーバーでのrootまたはsudo権限
- 任意ですが便利：デバッグ用のjqおよびcurl

## DoubleZeroへの接続

DoubleZero TestnetとDoubleZero Mainnet-Betaは物理的に異なるネットワークです。インストール時に適切なネットワークを選択してください。

DoubleZeroへのオンボーディング時に、**DoubleZero ID**と呼ばれる公開鍵で表される**DoubleZeroアイデンティティ**を確立します。この鍵は、DoubleZeroがあなたのマシンを識別する方法の一部です。

## 1. DoubleZeroパッケージのインストール

!!! info "現在のバージョン"
    | パッケージ | Mainnet-Beta | Testnet |
    |---------|-------------|---------|
    | `doublezero` | `MAINNET_CLIENT_VERSION` | `TESTNET_CLIENT_VERSION` |


お使いのオペレーティングシステムに応じて、以下の手順に従ってください：

### Ubuntu / Debian

Mainnet-Betaの現在の推奨デプロイ方法：
```bash
curl -1sLf https://dl.cloudsmith.io/public/malbeclabs/doublezero/setup.deb.sh | sudo -E bash
sudo apt-get install doublezero
```


Testnetの現在の推奨デプロイ方法：
```bash
curl -1sLf https://dl.cloudsmith.io/public/malbeclabs/doublezero-testnet/setup.deb.sh | sudo -E bash
sudo apt-get install doublezero
```


### Rocky Linux / RHEL

Mainnet-Betaの現在の推奨デプロイ方法：
```bash
curl -1sLf https://dl.cloudsmith.io/public/malbeclabs/doublezero/setup.rpm.sh | sudo -E bash
sudo yum install doublezero
```


Testnetの現在の推奨デプロイ方法：
```bash
curl -1sLf https://dl.cloudsmith.io/public/malbeclabs/doublezero-testnet/setup.rpm.sh | sudo -E bash
sudo yum install doublezero
```


??? info "既存ユーザーのみ：パッケージを*TestnetからMainnet-Beta*、または*Mainnet-BetaからTestnet*に変更する"
    上記のパッケージリポジトリからインストールすると、DoubleZero **Testnet**または**DoubleZero Mainnet Beta**に固有のものとなります。ネットワークを切り替える場合は、以前インストールしたパッケージリポジトリを削除し、ターゲットリポジトリに更新する必要があります。

    この例では、TestnetからMainnet-Betaへの移行手順を説明します。

    Mainnet-BetaからTestnetへの移行も同じ手順で実行できます。ステップ3を上記のTestnet用インストールコマンドに置き換えてください。


    1. 古いリポジトリファイルの検索

        まず、システム上の既存のDoubleZeroリポジトリ設定ファイルを見つけます：

        `find /etc/apt | grep doublezero`

        `find /usr/share/keyrings/ | grep doublezero`

    2. 古いリポジトリファイルの削除

        前のステップで見つかった古いリポジトリファイルを削除します。例：

        ```
        sudo rm /etc/apt/sources.list.d/malbeclabs-doublezero.list
        sudo rm /usr/share/keyrings/malbeclabs-doublezero-archive-keyring.gpg
        ```
    3. 新しいリポジトリからのインストール

        新しいMainnet-Betaリポジトリを追加し、最新のパッケージをインストールします：

        ```
        curl -1sLf https://dl.cloudsmith.io/public/malbeclabs/doublezero/setup.deb.sh | sudo -E bash
        sudo apt-get install doublezero=<current_recomended_version_above>
        ```


#### `doublezerod`のステータス確認

パッケージがインストールされると、新しいsystemdユニットがインストール、有効化、起動されます。ステータスを確認するには、以下を実行します：
```
sudo systemctl status doublezerod
```


### GREおよびBGP用のファイアウォール設定

DoubleZeroはGREトンネリング（IPプロトコル47）とBGPルーティング（リンクローカルアドレスのtcp/179）を使用します。ファイアウォールがこれらのプロトコルを許可していることを確認してください：

iptablesでGREとBGPを許可する：

```bash
sudo iptables -A INPUT -p gre -j ACCEPT
sudo iptables -A OUTPUT -p gre -j ACCEPT
sudo iptables -A INPUT -i doublezero0 -s 169.254.0.0/16 -d 169.254.0.0/16 -p tcp --dport 179 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero0 -s 169.254.0.0/16 -d 169.254.0.0/16 -p tcp --dport 179 -j ACCEPT
```


またはUFWでGREとBGPを許可する：

```bash
sudo ufw allow proto gre from any to any
sudo ufw allow in on doublezero0 from 169.254.0.0/16 to 169.254.0.0/16 port 179 proto tcp
sudo ufw allow out on doublezero0 from 169.254.0.0/16 to 169.254.0.0/16 port 179 proto tcp
```


## 2. 新しいDoubleZeroアイデンティティの作成

以下のコマンドでサーバー上にDoubleZeroアイデンティティを作成します：

```bash
doublezero keygen
```

!!! info
    使用したい既存のIDがある場合は、以下のオプション手順に従ってください。

    doublezero設定ディレクトリを作成します

    ```
    mkdir -p ~/.config/doublezero
    ```

    DoubleZeroで使用したい`id.json`をdoublezero設定ディレクトリにコピーまたはリンクします。

    ```
    sudo cp </path/to/id.json> ~/.config/doublezero/
    ```
## 3. サーバーのDoubleZeroアイデンティティの確認

DoubleZeroアイデンティティを確認します。このアイデンティティは、あなたのマシンとDoubleZero間の接続を作成するために使用されます。

```bash
doublezero address
```

**出力：**
```bash
YourDoubleZeroAddress11111111111111111111111111111
```

## 4. doublezerodがDZデバイスを検出したか確認する

接続する前に、`doublezerod`が利用可能なすべてのDZテストネットスイッチを検出し、pingが通ることを確認します：

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

出力にデバイスが表示されない場合は、10〜20秒待ってから再試行してください。

## 5. DoubleZeroからの切断

次のセクションでDoubleZero環境を設定します。成功を確実にするために、現在のセッションを切断してください。これにより、マシン上で複数のトンネルが開いていることによる問題を回避できます。

確認

```bash
doublezero status
```

`up`の場合は以下を実行します：

```bash
doublezero disconnect
```

### 次のステップ：テナント

DoubleZeroへの接続はユースケースによって異なります。DoubleZeroでは、テナントは同様のユーザープロファイルを持つグループです。例として、ブロックチェーン、データ転送レイヤーなどがあります。

### [こちらからテナントの選択に進んでください](tenant.md)


# オプション：Prometheusメトリクスの有効化

Prometheusメトリクスに精通しているオペレーターは、DoubleZeroの監視のためにメトリクスを有効にすることをお勧めします。これにより、DoubleZeroクライアントのパフォーマンス、接続ステータス、運用状態を可視化できます。

## 利用可能なメトリクス

DoubleZeroはいくつかの主要なメトリクスを公開しています：
- **ビルド情報**：バージョン、コミットハッシュ、ビルド日
- **セッションステータス**：DoubleZeroセッションがアクティブかどうか
- **接続メトリクス**：レイテンシと接続情報
- **パフォーマンスデータ**：スループットとエラー率

## Prometheusメトリクスの有効化

DoubleZeroクライアントでPrometheusメトリクスを有効にするには、以下の手順に従ってください：

### 1. doublezerod systemdサービスの起動コマンドの変更

systemdオーバーライド設定を作成または編集します：

```bash
sudo mkdir -p /etc/systemd/system/doublezerod.service.d/
sudo nano /etc/systemd/system/doublezerod.service.d/override.conf
```

以下の設定に置き換えます：

`-env`フラグは、データを収集したいネットワークに応じて`testnet`または`mainnet-beta`のいずれかを指定する必要があることに注意してください。以下のサンプルブロックでは`testnet`が使用されています。必要に応じて`mainnet-beta`に変更してください。

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


## Prometheusサーバーの設定

設定およびセキュリティについては、本ドキュメントの範囲外です。
Grafanaは可視化のための優れた選択肢であり、Prometheusメトリクスの収集方法を詳述したドキュメントが[こちら](https://grafana.com/docs/alloy/latest/collect/prometheus-metrics/)で利用可能です。

## Grafanaダッシュボード（オプション）

可視化のために、DoubleZeroメトリクスを使用してGrafanaダッシュボードを作成できます。一般的なパネルには以下が含まれます：
- 時系列でのセッションステータス
- ビルド情報
- 接続レイテンシの傾向
- エラー率の監視