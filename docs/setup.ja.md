# DoubleZeroのセットアップ方法

!!! info "用語"
    DoubleZeroを初めて利用しますか？[用語集](glossary.md)で[doublezerod](glossary.md#doublezerod)、[IBRL](glossary.md#ibrl-increase-bandwidth-reduce-latency)、[DZD](glossary.md#dzd-doublezero-device)などの用語の定義を確認してください。

!!! warning "DoubleZeroに接続することで、[DoubleZeroサービス利用規約](https://doublezero.xyz/terms-protocol)に同意します"


## 前提条件
!!! warning inline end
    バリデーターの場合：DoubleZeroはコンテナではなく、バリデーターホストに直接インストールする必要があります。
- パブリックIPアドレス（NATなし）を持つインターネット接続
- x86_64サーバー
- 対応OS：Ubuntu 22.04+またはDebian 11+、あるいはRocky Linux / RHEL 8+
- DoubleZeroを実行するサーバーのrootまたはsudo権限
- オプションですが有用：デバッグ用のjqとcurl

## DoubleZeroへの接続

DoubleZeroテストネットとDoubleZeroメインネットベータは物理的に異なるネットワークです。インストール時に適切なネットワークを選択してください。

DoubleZeroへのオンボーディング時に、**DoubleZeroアイデンティティ**（**DoubleZero ID**と呼ばれる公開鍵で表される）を確立します。このキーはDoubleZeroがマシンを認識する方法の一部です。

## 1. DoubleZeroパッケージのインストール

<div data-wizard-step="install-version-info" markdown>

!!! info "現在のバージョン"
    | パッケージ | メインネットベータ | テストネット |
    |---------|-------------|---------|
    | `doublezero` | `MAINNET_CLIENT_VERSION` | `TESTNET_CLIENT_VERSION` |

</div>

OSに応じて以下の手順に従ってください：

### Ubuntu / Debian

<div data-wizard-step="install-deb-mainnet-beta" markdown>

メインネットベータの現在の推奨デプロイメント：
```bash
curl -1sLf https://dl.cloudsmith.io/public/malbeclabs/doublezero/setup.deb.sh | sudo -E bash
sudo apt-get install doublezero
```

</div>

<div data-wizard-step="install-deb-testnet" markdown>

テストネットの現在の推奨デプロイメント：
```bash
curl -1sLf https://dl.cloudsmith.io/public/malbeclabs/doublezero-testnet/setup.deb.sh | sudo -E bash
sudo apt-get install doublezero
```

</div>

### Rocky Linux / RHEL

<div data-wizard-step="install-rpm-mainnet-beta" markdown>

メインネットベータの現在の推奨デプロイメント：
```bash
curl -1sLf https://dl.cloudsmith.io/public/malbeclabs/doublezero/setup.rpm.sh | sudo -E bash
sudo yum install doublezero
```

</div>

<div data-wizard-step="install-rpm-testnet" markdown>

テストネットの現在の推奨デプロイメント：
```bash
curl -1sLf https://dl.cloudsmith.io/public/malbeclabs/doublezero-testnet/setup.rpm.sh | sudo -E bash
sudo yum install doublezero
```

</div>

<div data-wizard-step="install-network-warning" markdown>

??? info "既存ユーザーのみ：パッケージを*テストネットからメインネットベータ*、または*メインネットベータからテストネット*に変更する"
    上記のパッケージリポジトリからインストールする際は、DoubleZero**テストネット**または**DoubleZeroメインネットベータ**に固有です。いずれかの時点でネットワークを切り替える場合は、以前にインストールされたパッケージリポジトリを削除し、ターゲットリポジトリに更新する必要があります。

    この例では、テストネットからメインネットベータへの移行を説明します。

    ステップ3を上記のテストネット用インストールコマンドに置き換えることで、メインネットベータからテストネットへの移行も同じ手順で完了できます。


    1. 古いリポジトリファイルを見つける

        まず、システム上の既存のDoubleZeroリポジトリ設定ファイルを特定します：

        `find /etc/apt | grep doublezero`

        `find /usr/share/keyrings/ | grep doublezero`

    2. 古いリポジトリファイルを削除する

        前のステップで見つかった古いリポジトリファイルを削除します。例：

        ```
        sudo rm /etc/apt/sources.list.d/malbeclabs-doublezero.list
        sudo rm /usr/share/keyrings/malbeclabs-doublezero-archive-keyring.gpg
        ```
    3. 新しいリポジトリからインストール

        新しいメインネットベータリポジトリを追加し、最新のパッケージをインストールします：

        ```
        curl -1sLf https://dl.cloudsmith.io/public/malbeclabs/doublezero/setup.deb.sh | sudo -E bash
        sudo apt-get install doublezero=<current_recomended_version_above>
        ```


</div>

<div data-wizard-step="install-verify-daemon" markdown>

#### `doublezerod`のステータスを確認する

パッケージのインストール後、新しいsystemdユニットがインストール、アクティベート、起動されます。ステータスを確認するには次のコマンドを実行します：
```
sudo systemctl status doublezerod
```

</div>

### GREとBGP用のファイアウォール設定

DoubleZeroはGREトンネリング（IPプロトコル47）とBGPルーティング（リンクローカルアドレスのtcp/179）を使用します。ファイアウォールがこれらのプロトコルを許可していることを確認してください：

iptablesでGREとBGPを許可する：

<div data-wizard-step="firewall-gre-bgp-iptables" markdown>

```bash
sudo iptables -A INPUT -p gre -j ACCEPT
sudo iptables -A OUTPUT -p gre -j ACCEPT
sudo iptables -A INPUT -i doublezero0 -s 169.254.0.0/16 -d 169.254.0.0/16 -p tcp --dport 179 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero0 -s 169.254.0.0/16 -d 169.254.0.0/16 -p tcp --dport 179 -j ACCEPT
```

</div>

またはUFWでGREとBGPを許可する：

<div data-wizard-step="firewall-gre-bgp-ufw" markdown>

```bash
sudo ufw allow proto gre from any to any
sudo ufw allow in on doublezero0 from 169.254.0.0/16 to 169.254.0.0/16 port 179 proto tcp
sudo ufw allow out on doublezero0 from 169.254.0.0/16 to 169.254.0.0/16 port 179 proto tcp
```

</div>

## 2. 新しいDoubleZeroアイデンティティを作成する

次のコマンドでサーバーにDoubleZeroアイデンティティを作成します：

```bash
doublezero keygen
```

!!! info
    使用したい既存のIDがある場合は、以下のオプション手順に従うことができます。

    doublezerod設定ディレクトリを作成する

    ```
    mkdir -p ~/.config/doublezero
    ```

    DoubleZeroで使用したい`id.json`をdoublezero設定ディレクトリにコピーまたはリンクする。

    ```
    sudo cp </path/to/id.json> ~/.config/doublezero/
    ```

## 3. サーバーのDoubleZeroアイデンティティを取得する

DoubleZeroアイデンティティを確認します。このアイデンティティはマシンとDoubleZero間の接続を作成するために使用されます。

```bash
doublezero address
```

**出力：**
```bash
YourDoubleZeroAddress11111111111111111111111111111
```

## 4. doublezerodがDZデバイスを検出したことを確認する

接続する前に、`doublezerod`が利用可能な各DZテストネットスイッチを検出してpingしていることを確認します：

```
doublezero latency
```

サンプル出力：

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

## 5. DoubleZeroから切断する

次のセクションではDoubleZero環境を設定します。成功を確実にするために、現在のセッションを切断してください。これにより、マシンで複数のトンネルが開いている問題を回避できます。

確認

```bash
doublezero status
```

`up`の場合は実行：

```bash
doublezero disconnect
```

### 次のステップ：テナント

DoubleZeroへの接続はユースケースによって異なります。DoubleZeroでは、テナントは類似したユーザープロファイルを持つグループです。例：ブロックチェーン、データ転送レイヤーなど。

### [こちらでテナントを選択して進む](tenant.md)


# オプション：Prometheusメトリクスを有効にする

Prometheusメトリクスに慣れているオペレーターは、DoubleZeroの監視のために有効にしたい場合があります。これにより、DoubleZeroクライアントのパフォーマンス、接続ステータス、および運用の健全性を把握できます。

## 利用可能なメトリクス

DoubleZeroはいくつかの主要なメトリクスを公開します：
- **ビルド情報**：バージョン、コミットハッシュ、ビルド日
- **セッションステータス**：DoubleZeroセッションがアクティブかどうか
- **接続メトリクス**：レイテンシと接続情報
- **パフォーマンスデータ**：スループットとエラー率

## Prometheusメトリクスを有効にする

DoubleZeroクライアントでPrometheusメトリクスを有効にするには、以下の手順に従ってください：

### 1. doublezerod systemdサービスの起動コマンドを変更する

systemdオーバーライド設定を作成または編集します：

```bash
sudo mkdir -p /etc/systemd/system/doublezerod.service.d/
sudo nano /etc/systemd/system/doublezerod.service.d/override.conf
```

この設定に置き換えます：

`-env`フラグはデータを収集したいネットワークに応じて`testnet`または`mainnet-beta`を指す必要があります。サンプルブロックでは`testnet`を使用しています。必要に応じて`mainnet-beta`に変更できます。

```ini
[Service]
ExecStart=
ExecStart=/usr/bin/doublezerod -sock-file /run/doublezerod/doublezerod.sock -env testnet -metrics-enable -metrics-addr localhost:2113
```

### 2. サービスをリロードして再起動する

```bash
sudo systemctl daemon-reload
sudo systemctl restart doublezerod
sudo systemctl status doublezerod
```

### 3. メトリクスが利用可能かを確認する

メトリクスエンドポイントが応答していることを確認します：

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

1. **サービスステータスを確認する**：`sudo systemctl status doublezerod`
2. **設定を確認する**：`sudo systemctl cat doublezerod`
3. **ログを確認する**：`sudo journalctl -u doublezerod -f`
4. **エンドポイントをテストする**：`curl -v localhost:2113/metrics`
5. **ポートを確認する**：`netstat -tlnp | grep 2113`


## Prometheusサーバーの設定

設定とセキュリティはこのドキュメントの範囲外です。
Grafanaは視覚化に優れたオプションであり、Prometheusメトリクスの収集方法を詳述するドキュメントが[こちら](https://grafana.com/docs/alloy/latest/collect/prometheus-metrics/)で入手できます。

## Grafanaダッシュボード（オプション）

視覚化のために、DoubleZeroメトリクスを使用してGrafanaダッシュボードを作成できます。一般的なパネルには以下が含まれます：
- 時間経過によるセッションステータス
- ビルド情報
- 接続レイテンシのトレンド
- エラー率の監視
