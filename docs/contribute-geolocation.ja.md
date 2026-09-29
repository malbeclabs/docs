---
description: DoubleZero Geolocation サービスの背後でレイテンシ測定を行う geoProbe エージェントのデプロイと設定について説明します。
---

# Geoprobe デプロイ

このガイドでは、DoubleZero [Geolocation](geolocation.md) サービスのレイテンシ測定を行うサーバーである **geoProbe エージェント** のデプロイと設定について説明します。

geoProbe は、3 層の測定チェーンにおいて [DZD](glossary.md#dzd-doublezero-device) とターゲットデバイスの間に位置します。親 DZD から署名済みの LocationOffset を受信し、[TWAMP](glossary.md#twamp-two-way-active-measurement-protocol)、署名付き TWAMP、または ICMP echo を通じて登録済みターゲットへの [RTT](glossary.md#rtt-round-trip-time) を測定します。各 geoProbe はオンチェーンに登録され、1 つ以上の親 DZD にリンクされます。

ジオロケーションアーキテクチャと測定フローの概要については、[Geolocation ユーザーガイド](geolocation.md)を参照してください。

---

## 前提条件

!!! warning "DZD テレメトリエージェントのバージョン"
    親 DZD はジオロケーションサービスをサポートするために **デバイステレメトリエージェントバージョン 0.17.0 以降** を実行している必要があります。それ以前のバージョンには、ジオロケーションに必要なプローブディスカバリ、TWAMP ピンギング、およびオフセット公開の拡張機能が含まれていません。プローブをデプロイする前にエージェントのバージョンを確認してください — 古い DZD とペアリングされたプローブはオフセットを受信できません。

geoProbe をデプロイする前に、以下を準備してください：

- **ベアメタル Linux サーバー** — VPS でも動作しますが、理想的ではありません。
- **DZD へのネットワーク近接性** — プローブとその親 DZD 間の RTT が 1ms 未満であること。理想的には 0.1ms 以下。
- エージェントプロセスに対する **`CAP_NET_RAW` ケーパビリティ**（Raw ソケットを使用した ICMP echo プロービングに必要）
- プローブの署名アイデンティティ用の **Ed25519 キーペア**
- **Foundation の承認** — プローブの登録は現時点では Foundation によるゲート制となっています。事前に [DZF](glossary.md#dzf-doublezero-foundation) と調整してください。
- テレメトリエージェント v0.17.0 以降を実行している **親 DZD**

---

## インストール

エージェントデーモンと doublezero CLI の両方をインストールします：

```bash
curl -1sLf https://dl.cloudsmith.io/public/malbeclabs/doublezero/setup.deb.sh | sudo -E bash
sudo apt install doublezero-geoprobe-agent doublezero
```

| パッケージ | 用途 |
|---------|---------|
| `doublezero-geoprobe-agent` | プローブサーバー上で動作し、レイテンシ測定を実行して署名済みオフセットを生成するエージェントデーモン |
| `doublezero` | プローブの登録と管理コマンドに使用する CLI ツール |

---

## オンチェーン登録

プローブの登録には Foundation の承認が必要です。事前に DZF と調整してください。

### ステップ 1: プローブの登録

```bash
doublezero geolocation probe create \
  --code <probe-code> \
  --exchange <exchange-pubkey> \
  --public-ip <probe-ip> \
  --signing-pubkey <signing-key-pubkey>
```

| パラメータ | 説明 |
|-----------|-------------|
| `--code` | プローブの一意の識別子（例: `ams-tn-gp1`）— 最大 32 文字 |
| `--exchange` | このプローブが関連付けられている Serviceability Exchange アカウントの公開鍵 |
| `--public-ip` | プローブがリッスンするパブリック IPv4 アドレス |
| `--signing-pubkey` | オフセットとテレメトリの署名に使用する公開鍵 |

### ステップ 2: 親 DZD のリンク

```bash
doublezero geolocation probe add-parent \
  --probe <probe-code> \
  --device <dzd-code>
```

各親 DZD は Serviceability Program でアクティブ化されたデバイスである必要があります。DZD は 60 秒ごとに子プローブを自動検出します — リンクされると、DZD は TWAMP 測定とオフセット生成を自動的に開始します。

---

## エージェントの実行

```bash
doublezero-geoprobe-agent \
  --env mainnet-beta \
  --keypair /etc/geoprobe/keypair.json \
  --geoprobe-pubkey <probe-onchain-pubkey>
```

### 必須フラグ

| フラグ | 説明 |
|------|-------------|
| `--keypair` | オフセット署名用の Ed25519 キーペアファイルへのパス |
| `--geoprobe-pubkey` | プローブの[オンチェーン](glossary.md#onchain)公開鍵（`probe create` で取得） |
| `--env` | ネットワーク環境: `testnet`、`devnet`、または `mainnet-beta`（台帳 RPC URL を設定） |

`--env` の代わりに `--ledger-rpc-url` を使用して、カスタム Solana RPC エンドポイントを指定することもできます。

### オプションフラグ

| フラグ | デフォルト | 説明 |
|------|---------|-------------|
| `--twamp-listen-port` | 8925 | 親 DZD からの TWAMP 測定用ポート |
| `--signed-twamp-port` | 8924 | インバウンドターゲットからの署名付き TWAMP プローブ用ポート |
| `--udp-listen-port` | 8923 | DZD からの LocationOffset データグラム受信用ポート |
| `--probe-interval` | 30s | 各ターゲットの測定間隔 |
| `--max-offset-age` | 1h | キャッシュされた DZD オフセットが破棄されるまでの最大経過時間 |
| `--verify-interval` | 29s | 台帳からターゲット割り当てを再検証する間隔 |
| `--verbose` | false | 詳細ログを有効化 |
| `--metrics-enable` | false | Prometheus メトリクスエンドポイントを有効化 |
| `--metrics-addr` | — | Prometheus メトリクスエンドポイントのアドレス（例: `0.0.0.0:9090`） |

---

## ポートとファイアウォール

geoprobe エージェントにはいくつかのポートを開放する必要があります：

| ポート | プロトコル | 方向 | 用途 |
|------|----------|-----------|---------|
| 8923/udp | UDP | DZD からのインバウンド | 署名済み LocationOffset データグラムの受信 |
| 8924/udp | UDP | ターゲットからのインバウンド | 署名付き TWAMP リフレクター（インバウンドプローブフロー） |
| 8925/udp | UDP | DZD からのインバウンド | 親 DZD からの TWAMP 測定 |
| ICMP | ICMP | ターゲットへのアウトバウンド | OutboundIcmp ターゲット用の ICMP echo リクエスト |

!!! note
    エージェントは、TWAMP プロービング（アウトバウンドフロー）および署名済み LocationOffset 結果のターゲットへの配信のために、ターゲットへのアウトバウンド UDP も必要です。

---

## モニタリング

運用の可視化のために Prometheus メトリクスエンドポイントを有効化します：

```bash
doublezero-geoprobe-agent \
  --keypair /etc/geoprobe/keypair.json \
  --geoprobe-pubkey <probe-onchain-pubkey> \
  --env testnet \
  --metrics-enable \
  --metrics-addr 0.0.0.0:9090
```

監視すべき主要メトリクス：

- **プローブの可用性** — エージェントプロセスのアップタイム
- **DZD-プローブ間レイテンシ** — 1ms 未満であるべきです。より高い値は配置の問題を示しています
- **アクティブターゲット数** — プローブが現在測定しているターゲットの数
- **署名検証の失敗** — ゼロ以外の値は、鍵の設定ミスまたはパケットの改ざんを示している可能性があります
- **オフセットキャッシュヒット率** — ヒット率が低い場合、プローブが新しい DZD オフセットを頻繁に待機していることを意味します

Prometheus のスクレイピングおよび DoubleZero エージェント全体で使用されるアラートパターンに関する一般的なガイダンスについては、[運用ガイド](contribute-operations.md#monitoring)を参照してください。

---

## プローブ管理コマンド

`doublezero geolocation` CLI は、プローブ管理のために以下のサブコマンドを提供します：

| サブコマンド | 説明 |
|------------|-------------|
| `probe create` | 新しい geoProbe をオンチェーンに登録 |
| `probe get` | コードを指定して特定のプローブの詳細を取得 |
| `probe list` | 登録済みの全プローブを一覧表示 |
| `probe update` | プローブ設定の更新（IP、ポート、署名鍵） |
| `probe delete` | プローブの削除（アクティブなターゲット参照がないことが必要） |
| `probe add-parent` | 親 DZD をプローブにリンク |
| `probe remove-parent` | プローブから親 DZD を削除 |

すべてのサブコマンドは `--env` または `--rpc-url` でネットワークを選択できます。書き込み操作（`create`、`update`、`delete`、`add-parent`、`remove-parent`）には `--keypair` が必要です。

??? note "例: プローブの一覧表示"

    ```bash
    doublezero geolocation probe list
    ```

    登録済みの全プローブのコード、パブリック IP、親 DZD、および現在のステータスを返します。