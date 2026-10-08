---
description: DoubleZero Geolocation サービスを支えるレイテンシ測定を実行する geoProbe エージェントのデプロイと設定。
---

# Geoprobe デプロイ

このガイドでは、**geoProbe エージェント**のデプロイと設定について説明します。geoProbe エージェントは、DoubleZero [Geolocation](../reference/geolocation.md) サービスのレイテンシ測定を実行するサーバーです。

geoProbe は、3 層の測定チェーンにおいて [DZD](../reference/glossary.md#dzd-doublezero-device) とターゲットデバイスの間に位置します。親 DZD から署名済み LocationOffset を受信し、[TWAMP](../reference/glossary.md#twamp-two-way-active-measurement-protocol)、署名済み TWAMP、または ICMP エコーを介して登録済みターゲットへの [RTT](../reference/glossary.md#rtt-round-trip-time) を測定します。各 geoProbe はオンチェーンに登録され、1 つ以上の親 DZD にリンクされます。

ジオロケーションのアーキテクチャと測定フローの概要については、[Geolocation ユーザーガイド](../reference/geolocation.md)を参照してください。

---

## 前提条件 {#prerequisites}

!!! warning "DZD テレメトリエージェントのバージョン"
    親 DZD は、ジオロケーションサービスをサポートするために **デバイステレメトリエージェントバージョン 0.17.0 以降** を実行している必要があります。それ以前のバージョンには、ジオロケーションに必要なプローブ検出、TWAMP ピング、およびオフセット公開の拡張機能が含まれていません。プローブをデプロイする前にエージェントのバージョンを確認してください — 古い DZD とペアリングされたプローブはオフセットを受信しません。

geoProbe をデプロイする前に、以下を確認してください：

- **ベアメタル Linux サーバー** — VPS でも動作しますが、理想的ではありません。
- **DZD へのネットワーク近接性** — プローブと親 DZD 間の RTT が 1ms 未満であること。理想的には 0.1ms 以下。
- エージェントプロセスの **`CAP_NET_RAW` ケーパビリティ**（raw ソケットを使用した ICMP エコープロービングに必要）
- プローブの署名 ID 用の **Ed25519 鍵ペア**
- **Foundation の承認** — プローブの登録は現時点では Foundation のゲート制御下にあります。手続き前に [DZF](../reference/glossary.md#dzf-doublezero-foundation) と調整してください
- テレメトリエージェント v0.17.0 以降を実行している **親 DZD**

---

## インストール {#installation}

エージェントデーモンと doublezero CLI の両方をインストールします：

```bash
curl -1sLf https://dl.cloudsmith.io/public/malbeclabs/doublezero/setup.deb.sh | sudo -E bash
sudo apt install doublezero-geoprobe-agent doublezero
```

| パッケージ | 用途 |
|---------|---------|
| `doublezero-geoprobe-agent` | プローブサーバー上で動作し、レイテンシ測定と署名済みオフセットの生成を行うエージェントデーモン |
| `doublezero` | プローブの登録と管理コマンドに使用する CLI ツール |

---

## オンチェーン登録 {#onchain-registration}

プローブの登録には Foundation の承認が必要です。手続き前に DZF と調整してください。

### ステップ 1: プローブの登録 {#step-1-register-the-probe}

```bash
doublezero geolocation probe create \
  --code <probe-code> \
  --exchange <exchange-pubkey> \
  --public-ip <probe-ip> \
  --signing-pubkey <signing-key-pubkey>
```

| パラメータ | 説明 |
|-----------|-------------|
| `--code` | プローブの一意な識別子（例: `ams-tn-gp1`）— 最大 32 文字 |
| `--exchange` | このプローブが関連付けられている Serviceability Exchange アカウントの公開鍵 |
| `--public-ip` | プローブがリッスンするパブリック IPv4 アドレス |
| `--signing-pubkey` | オフセットとテレメトリの署名に使用する公開鍵 |

### ステップ 2: 親 DZD のリンク {#step-2-link-parent-dzds}

```bash
doublezero geolocation probe add-parent \
  --probe <probe-code> \
  --device <dzd-code>
```

各親 DZD は Serviceability Program でアクティベート済みのデバイスである必要があります。DZD は 60 秒ごとに子プローブを自動検出します — リンクされると、DZD は自動的に TWAMP 測定とオフセット生成を開始します。

---

## エージェントの実行 {#running-the-agent}

```bash
doublezero-geoprobe-agent \
  --env mainnet-beta \
  --keypair /etc/geoprobe/keypair.json \
  --geoprobe-pubkey <probe-onchain-pubkey>
```

### 必須フラグ {#required-flags}

| フラグ | 説明 |
|------|-------------|
| `--keypair` | オフセット署名用の Ed25519 鍵ペアファイルのパス |
| `--geoprobe-pubkey` | プローブの[オンチェーン](../reference/glossary.md#onchain)公開鍵（`probe create` で取得） |
| `--env` | ネットワーク環境: `testnet`、`devnet`、または `mainnet-beta`（レジャー RPC URL を設定） |

`--env` の代わりに `--ledger-rpc-url` を使用して、カスタム Solana RPC エンドポイントを指定することもできます。

### オプションフラグ {#optional-flags}

| フラグ | デフォルト | 説明 |
|------|---------|-------------|
| `--twamp-listen-port` | 8925 | 親 DZD からの TWAMP 測定用ポート |
| `--signed-twamp-port` | 8924 | インバウンドターゲットからの署名済み TWAMP プローブ用ポート |
| `--udp-listen-port` | 8923 | DZD からの LocationOffset データグラム受信用ポート |
| `--probe-interval` | 30s | 各ターゲットの測定間隔 |
| `--max-offset-age` | 1h | キャッシュされた DZD オフセットが破棄されるまでの最大経過時間 |
| `--verify-interval` | 29s | レジャーからターゲット割り当てを再検証する間隔 |
| `--verbose` | false | 詳細ログを有効化 |
| `--metrics-enable` | false | Prometheus メトリクスエンドポイントを有効化 |
| `--metrics-addr` | — | Prometheus メトリクスエンドポイントのアドレス（例: `0.0.0.0:9090`） |

---

## ポートとファイアウォール {#ports-and-firewall}

geoprobe エージェントにはいくつかのポートの開放が必要です：

| ポート | プロトコル | 方向 | 用途 |
|------|----------|-----------|---------|
| 8923/udp | UDP | DZD からのインバウンド | 署名済み LocationOffset データグラムの受信 |
| 8924/udp | UDP | ターゲットからのインバウンド | 署名済み TWAMP リフレクター（インバウンドプローブフロー） |
| 8925/udp | UDP | DZD からのインバウンド | 親 DZD からの TWAMP 測定 |
| ICMP | ICMP | ターゲットへのアウトバウンド | OutboundIcmp ターゲット用の ICMP エコーリクエスト |

!!! note
    エージェントは、TWAMP プロービング（アウトバウンドフロー）および署名済み LocationOffset 結果のターゲットへの配信のために、ターゲットへのアウトバウンド UDP も必要とします。

---

## モニタリング {#monitoring}

運用の可視性のために Prometheus メトリクスエンドポイントを有効化します：

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
- **DZD-プローブ間レイテンシ** — 1ms 未満であるべきです。高い値は配置の問題を示しています
- **アクティブターゲット** — プローブが現在測定しているターゲットの数
- **署名検証の失敗** — ゼロ以外の値は鍵の設定ミスまたはパケットの改ざんを示している可能性があります
- **オフセットキャッシュヒット率** — ヒット率が低い場合、プローブが新しい DZD オフセットを頻繁に待機していることを意味します

Prometheus スクレイピングと DoubleZero エージェント全体で使用されるアラートパターンに関する一般的なガイダンスについては、[運用ガイド](operations.md#monitoring)を参照してください。

---

## プローブ管理コマンド {#probe-management-commands}

`doublezero geolocation` CLI は、プローブを管理するための以下のサブコマンドを提供します：

| サブコマンド | 説明 |
|------------|-------------|
| `probe create` | 新しい geoProbe をオンチェーンに登録 |
| `probe get` | コードで特定のプローブの詳細を取得 |
| `probe list` | 登録済みの全プローブを一覧表示 |
| `probe update` | プローブの設定を更新（IP、ポート、署名鍵） |
| `probe delete` | プローブを削除（アクティブなターゲット参照がないことが必要） |
| `probe add-parent` | 親 DZD をプローブにリンク |
| `probe remove-parent` | プローブから親 DZD を削除 |

すべてのサブコマンドは、ネットワークの選択に `--env` または `--rpc-url` を受け付けます。書き込み操作（`create`、`update`、`delete`、`add-parent`、`remove-parent`）には `--keypair` が必要です。

??? note "例: プローブの一覧表示"

    ```bash
    doublezero geolocation probe list
    ```

    登録済みの全プローブがコード、パブリック IP、親 DZD、現在のステータスとともに返されます。