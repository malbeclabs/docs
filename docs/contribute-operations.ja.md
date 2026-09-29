---
description: DoubleZero コントリビューター向けの継続的な運用タスク — エージェントのアップグレード、デバイスおよびインターフェースの更新、リンク管理、インシデント記録。
---

# コントリビューター向け運用ガイド


このガイドでは、DoubleZero デバイス（DZD）を維持するための継続的な運用タスクについて説明します。エージェントのアップグレード、デバイス/インターフェースの更新、リンク管理などが含まれます。

## インシデントおよびメンテナンスの記録

計画されたメンテナンスまたは予期しないリンク/デバイスの問題は、[OPS Management ポータル](contribute-ops-management.md)に記録する必要があります。これにより、すべてのコントリビューターがネットワーク全体で何が起きているかを把握でき、重複した調査を回避できます。

- **計画作業**（例：光モジュールの交換、予定されたキャリアメンテナンス）：作業を開始する前にメンテナンスレコードを作成してください。
- **予期しない問題**（例：リンクダウン、インターフェースエラー、パケットロス）：調査を開始したらすぐにインシデントを作成してください。

チケットの作成方法とオンボーディング手順については、[OPS Management ガイド](contribute-ops-management.md)を参照してください。

---

**前提条件**: このガイドを使用する前に、以下を完了していることを確認してください：

- [デバイスプロビジョニングガイド](contribute-provisioning.md)を完了していること
- DZD が Config エージェントと Telemetry エージェントの両方が稼働し、完全に運用可能な状態であること

---

## デバイスの更新

初期プロビジョニング後にデバイスの設定を変更するには、`doublezero device update` を使用します。

```bash
doublezero device update --pubkey <DEVICE_PUBKEY> [OPTIONS]
```

**一般的な更新オプション:**

| オプション | 説明 |
|--------|-------------|
| `--device-type <TYPE>` | 動作モードの変更: `hybrid`、`transit`、`edge`（[デバイスタイプ](contribute-provisioning.md#understanding-device-types)を参照） |
| `--location <LOCATION>` | デバイスを別のロケーションに移動 |
| `--metrics-publisher <PUBKEY>` | メトリクスパブリッシャーキーの変更 |

---

## インターフェースの更新

既存のインターフェースを変更するには、`doublezero device interface update` を使用します。このコマンドは `interface create` と同じオプションを受け付けます。

```bash
doublezero device interface update <DEVICE> <NAME> [OPTIONS]
```

CYOA/DIA 設定を含むインターフェースオプションの完全なリストについては、[インターフェースの作成](contribute-provisioning.md#step-35-create-cyoa-interface-for-edgehybrid-devices)を参照してください。

**例 - 既存のインターフェースに CYOA 設定を追加:**

```bash
doublezero device interface update lax-dz001 Ethernet1/2 \
  --interface-cyoa gre-over-dia \
  --interface-dia dia \
  --bandwidth 10000 \
  --cir 1000
```

### インターフェースの一覧表示

```bash
doublezero device interface list              # すべてのデバイスの全インターフェース
doublezero device interface list <DEVICE>     # 特定のデバイスのインターフェース
```

---

## Config エージェントのアップグレード

Config エージェントの新しいバージョンがリリースされた場合、以下の手順に従ってアップグレードしてください。

### 1. 最新バージョンのダウンロード

```
switch# bash
$ sudo bash
# cd /mnt/flash
# wget AGENT_DOWNLOAD_URL
# exit
$ exit
```

### 2. エージェントのシャットダウン

```
switch# configure
switch(config)# daemon doublezero-agent
switch(config-daemon-doublezero-agent)# shutdown
switch(config-daemon-doublezero-agent)# exit
switch(config)# exit
```

### 3. 旧バージョンの削除

まず、旧バージョンのファイル名を確認します：
```
switch# show extensions
```

以下のコマンドを実行して旧バージョンを削除します。`<OLD_VERSION>` を上記の出力で確認した旧バージョンに置き換えてください：
```
switch# delete flash:doublezero-agent_<OLD_VERSION>_linux_amd64.rpm
switch# delete extension:doublezero-agent_<OLD_VERSION>_linux_amd64.rpm
```

### 4. 新バージョンのインストール

```
switch# copy flash:AGENT_FILENAME extension:
switch# extension AGENT_FILENAME
switch# copy installed-extensions boot-extensions
```

### 5. エージェントの再起動

```
switch# configure
switch(config)# daemon doublezero-agent
switch(config-daemon-doublezero-agent)# no shutdown
switch(config-daemon-doublezero-agent)# exit
switch(config)# exit
```

### 6. アップグレードの確認

Status が "A, I, B" であることを確認します。
```
switch# show extensions
```

### 7. Config エージェントのログ出力の確認

```
show agent doublezero-agent log
```

---

## Telemetry エージェントのアップグレード

Telemetry エージェントの新しいバージョンがリリースされた場合、以下の手順に従ってアップグレードしてください。

### 1. 最新バージョンのダウンロード

```
switch# bash
$ sudo bash
# cd /mnt/flash
# wget TELEMETRY_DOWNLOAD_URL
# exit
$ exit
```

### 2. エージェントのシャットダウン

```
switch# configure
switch(config)# daemon doublezero-telemetry
switch(config-daemon-doublezero-telemetry)# shutdown
switch(config-daemon-doublezero-telemetry)# exit
switch(config)# exit
```

### 3. 旧バージョンの削除

まず、旧バージョンのファイル名を確認します：
```
switch# show extensions
```

以下のコマンドを実行して旧バージョンを削除します。`<OLD_VERSION>` を上記の出力で確認した旧バージョンに置き換えてください：
```
switch# delete flash:doublezero-device-telemetry-agent_<OLD_VERSION>_linux_amd64.rpm
switch# delete extension:doublezero-device-telemetry-agent_<OLD_VERSION>_linux_amd64.rpm
```

### 4. 新バージョンのインストール

```
switch# copy flash:TELEMETRY_FILENAME extension:
switch# extension TELEMETRY_FILENAME
switch# copy installed-extensions boot-extensions
```

### 5. エージェントの再起動

```
switch# configure
switch(config)# daemon doublezero-telemetry
switch(config-daemon-doublezero-telemetry)# no shutdown
switch(config-daemon-doublezero-telemetry)# exit
switch(config)# exit
```

### 6. アップグレードの確認

Status が "A, I, B" であることを確認します。
```
switch# show extensions
```

### 7. Telemetry エージェントのログ出力の確認

```
show agent doublezero-telemetry log
```

---

## モニタリング

> ⚠️ **重要:**
>
>  1. 以下の設定例では、エージェントが管理 VRF を使用しているかどうかに注意してください。
>  2. Config エージェントと Telemetry エージェントは、デフォルトでメトリクスエンドポイントに同じリスニングポート（:8080）を使用します。両方のメトリクスを有効にする場合は、`-metrics-addr` フラグを使用して各エージェントに固有のリスニングポートを設定してください。

### Config エージェントのメトリクス

DoubleZero デバイス上の Config エージェントは、`doublezero-agent` デーモン設定で `-metrics-enable` フラグを設定することにより、Prometheus 互換のメトリクスを公開できます。デフォルトのリスニングポートは tcp/8080 ですが、`-metrics-addr` を使用して環境に合わせて変更できます：
```
daemon doublezero-agent
   exec /usr/local/bin/doublezero-agent -pubkey $PUBKEY -controller $CONTROLLER_ADDR -metrics-enable -metrics-addr 10.0.0.11:2112
   no shutdown
```

以下の DoubleZero 固有のメトリクスが、Go 固有のランタイムメトリクスとともに公開されます：
```
$ curl -s 10.0.0.11:2112/metrics | grep doublezero

# HELP doublezero_agent_apply_config_errors_total Number of errors encountered while applying config to the device
# TYPE doublezero_agent_apply_config_errors_total counter
doublezero_agent_apply_config_errors_total 0

# HELP doublezero_agent_bgp_neighbors_errors_total Number of errors encountered while retrieving BGP neighbors from the device
# TYPE doublezero_agent_bgp_neighbors_errors_total counter
doublezero_agent_bgp_neighbors_errors_total 0

# HELP doublezero_agent_build_info Build information of the agent
# TYPE doublezero_agent_build_info gauge
doublezero_agent_build_info{commit="4378018f",date="2025-09-23T14:07:48Z",version="0.6.5~git20250923140746.4378018f"} 1

# HELP doublezero_agent_get_config_errors_total Number of errors encountered while getting config from the controller
# TYPE doublezero_agent_get_config_errors_total counter
doublezero_agent_get_config_errors_total 0
```

#### 重要度の高いエラー

- `up` - これはスクレイプインスタンスが正常で到達可能な場合に Prometheus が自動的に生成する時系列メトリクスです。そうでない場合、エージェントに到達できないか、エージェントが実行されていません。
- `doublezero_agent_apply_config_errors_total` - エージェントが適用しようとした設定が失敗しました。この状況では、この問題が解決されるまで、ユーザーはデバイスにオンボードできず、オンチェーンの設定変更も適用されません。
- `doublezero_agent_get_config_errors_total` - ローカルの Config エージェントが DoubleZero コントローラーと通信できないことを示しています。多くの場合、これはデバイスの管理接続の問題が原因です。上記のメトリクスと同様に、この問題が解決されるまで、ユーザーはデバイスにオンボードできず、オンチェーンの設定変更も適用されません。

### Telemetry エージェントのメトリクス

DoubleZero デバイス上の Telemetry エージェントは、`doublezero-telemetry` デーモン設定で `-metrics-enable` フラグを設定することにより、Prometheus 互換のメトリクスを公開できます。デフォルトのリスニングポートは tcp/8080 ですが、`-metrics-addr` を使用して環境に合わせて変更できます：
```
daemon doublezero-telemetry
   exec /usr/local/bin/doublezero-telemetry  --local-device-pubkey $PUBKEY --env $ENV --keypair $KEY_PAIR -metrics-enable --metrics-addr 10.0.0.11:2113
   no shutdown
```

以下の DoubleZero 固有のメトリクスが、Go 固有のランタイムメトリクスとともに公開されます：
```
$ curl -s 10.0.0.11:2113/metrics | grep doublezero

# HELP doublezero_device_telemetry_agent_build_info Build information of the device telemetry agent
# TYPE doublezero_device_telemetry_agent_build_info gauge
doublezero_device_telemetry_agent_build_info{commit="4378018f",date="2025-09-23T14:07:45Z",version="0.6.5~git20250923140743.4378018f"} 1

# HELP doublezero_device_telemetry_agent_errors_total Number of errors encountered
# TYPE doublezero_device_telemetry_agent_errors_total counter
doublezero_device_telemetry_agent_errors_total{error_type="peer_discovery_program_load"} 7
doublezero_device_telemetry_agent_errors_total{error_type="submitter_failed_to_write_samples"} 8
doublezero_device_telemetry_agent_errors_total{error_type="collector_submit_samples_on_close"} 0
doublezero_device_telemetry_agent_errors_total{error_type="peer_discovery_getting_local_interfaces"} 0
doublezero_device_telemetry_agent_errors_total{error_type="peer_discovery_finding_local_tunnel"} 0
doublezero_device_telemetry_agent_errors_total{error_type="peer_discovery_link_tunnel_net_invalid"} 0
doublezero_device_telemetry_agent_errors_total{error_type="submitter_failed_to_initialize_account"} 0
doublezero_device_telemetry_agent_errors_total{error_type="submitter_retries_exhausted"} 0

# HELP doublezero_device_telemetry_agent_peer_discovery_not_found_tunnels Number of local tunnel interfaces not found during peer discovery
# TYPE doublezero_device_telemetry_agent_peer_discovery_not_found_tunnels gauge
doublezero_device_telemetry_agent_peer_discovery_not_found_tunnels{local_device_pk="8PQkip3CxWhQTdP7doCyhT2kwjSL2csRTdnRg2zbDPs1"} 0
```

#### 重要度の高いエラー

- `up` - これはスクレイプインスタンスが正常で到達可能な場合に Prometheus が自動的に生成する時系列メトリクスです。そうでない場合、エージェントに到達できないか、エージェントが実行されていません。
- `doublezero_device_telemetry_agent_errors_total` で `error_type` が `submitter_failed_to_write_samples` の場合 - これは Telemetry エージェントがサンプルをオンチェーンに書き込めないことを示しており、デバイスの管理接続の問題が原因である可能性があります。

---

## リンク管理

### リンクドレイン

リンクドレインにより、コントリビューターはメンテナンスやトラブルシューティングのために、リンクをアクティブサービスからグレースフルに取り外すことができます。2 つのドレイン状態があります：

| ステータス | IS-IS の動作 | 説明 |
|--------|----------------|-------------|
| `soft-drained` | メトリクスを 1,000,000 に設定 | リンクの優先度が下がります。代替パスが利用可能な場合はそちらが使用されますが、このリンクが唯一の選択肢の場合は引き続き使用されます。 |
| `hard-drained` | パッシブに設定 | リンクがルーティングから完全に除外されます。このリンクを通過するトラフィックはありません。 |

### 状態遷移

以下の状態遷移が許可されています：

```
activated → soft-drained ✓
activated → hard-drained ✓
soft-drained → hard-drained ✓
hard-drained → soft-drained ✓
soft-drained → activated ✓
hard-drained → activated ✗ (まず soft-drained を経由する必要があります)
```

> ⚠️ **注意:**
> `hard-drained` から直接 `activated` に移行することはできません。まず `soft-drained` に遷移してから、`activated` に移行する必要があります。

### リンクのソフトドレイン

ソフトドレインは、IS-IS メトリクスを 1,000,000 に設定することでリンクの優先度を下げます。トラフィックは代替パスを優先しますが、必要に応じてこのリンクを使用することもできます。

```bash
doublezero link update --pubkey <LINK_PUBKEY> --status soft-drained
```

### リンクのハードドレイン

ハードドレインは、IS-IS をパッシブモードに設定することで、リンクをルーティングから完全に除外します。このリンクを通過するトラフィックはありません。

```bash
doublezero link update --pubkey <LINK_PUBKEY> --status hard-drained
```

### リンクのアクティブ状態への復元

ドレインされたリンクを通常の運用状態に戻すには：

```bash
# soft-drained からの場合
doublezero link update --pubkey <LINK_PUBKEY> --status activated

# hard-drained からの場合（まず soft-drained を経由する必要があります）
doublezero link update --pubkey <LINK_PUBKEY> --status soft-drained
doublezero link update --pubkey <LINK_PUBKEY> --status activated
```

### 遅延オーバーライド

遅延オーバーライド機能により、コントリビューターは実際の測定遅延値を変更せずに、リンクの実効遅延を一時的に変更できます。これは、リンクをプライマリパスからセカンダリパスに一時的に降格させる場合に便利です。

### 遅延オーバーライドの設定

リンクの遅延をオーバーライドする（ルーティングでの優先度を下げる）には：

```bash
doublezero link update --pubkey <LINK_PUBKEY> --delay-override-ms 100
```

有効な値は `0.01` から `1000` ミリ秒です。

### 遅延オーバーライドのクリア

オーバーライドを削除し、実際の測定遅延に戻すには：

```bash
doublezero link update --pubkey <LINK_PUBKEY> --delay-override-ms 0
```

> ⚠️ **注意:**
> リンクがソフトドレイン状態の場合、優先度の引き下げを確実にするために、`delay_ms` と `delay_override_ms` の両方が 1000ms（1 秒）にオーバーライドされます。