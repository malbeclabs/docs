# コントリビューター向け運用ガイド
!!! warning "This translation was generated using artificial intelligence and has not been reviewed by a human translator. It may contain inaccuracies or errors and should not be relied upon."



このガイドでは、エージェントのアップグレード、デバイス/インターフェースの更新、リンク管理など、DoubleZeroデバイス（DZD）を維持するための継続的な運用タスクについて説明します。

**前提条件**：このガイドを使用する前に、以下を完了していることを確認してください：

- [デバイスプロビジョニングガイド](contribute-provisioning.md)の完了
- ConfigエージェントとTelemetryエージェントの両方が稼働しているDZDが完全に動作していること

---

## デバイスの更新

初期プロビジョニング後にデバイス設定を変更するには、`doublezero device update`を使用します。

```bash
doublezero device update --pubkey <DEVICE_PUBKEY> [OPTIONS]
```

**一般的な更新オプション：**

| オプション | 説明 |
|--------|-------------|
| `--device-type <TYPE>` | 動作モードを変更：`hybrid`、`transit`、`edge`（[デバイスタイプ](contribute-provisioning.md#understanding-device-types)を参照） |
| `--location <LOCATION>` | デバイスを別の場所に移動 |
| `--metrics-publisher <PUBKEY>` | メトリクスパブリッシャーキーを変更 |

---

## インターフェースの更新

既存のインターフェースを変更するには、`doublezero device interface update`を使用します。このコマンドは`interface create`と同じオプションを受け付けます。

```bash
doublezero device interface update <DEVICE> <NAME> [OPTIONS]
```

CYOA/DIA設定を含むインターフェースオプションの完全なリストについては、[インターフェースの作成](contribute-provisioning.md#step-35-create-cyoa-interface-for-edgehybrid-devices)を参照してください。

**例 - 既存のインターフェースにCYOA設定を追加する：**

```bash
doublezero device interface update lax-dz001 Ethernet1/2 \
  --interface-cyoa gre-over-dia \
  --interface-dia dia \
  --bandwidth 10000 \
  --cir 1000
```

### インターフェースの一覧表示

```bash
doublezero device interface list              # すべてのデバイスのすべてのインターフェース
doublezero device interface list <DEVICE>     # 特定のデバイスのインターフェース
```

---

## Configエージェントのアップグレード

Configエージェントの新しいバージョンがリリースされた場合は、以下の手順に従ってアップグレードしてください。

### 1. 最新バージョンをダウンロードする

```
switch# bash
$ sudo bash
# cd /mnt/flash
# wget AGENT_DOWNLOAD_URL
# exit
$ exit
```

### 2. エージェントをシャットダウンする

```
switch# configure
switch(config)# daemon doublezero-agent
switch(config-daemon-doublezero-agent)# shutdown
switch(config-daemon-doublezero-agent)# exit
switch(config)# exit
```

### 3. 古いバージョンを削除する

まず、古いバージョンのファイル名を確認します：
```
switch# show extensions
```

以下のコマンドを実行して古いバージョンを削除します。`<OLD_VERSION>`を上記の出力から得た古いバージョンに置き換えてください：
```
switch# delete flash:doublezero-agent_<OLD_VERSION>_linux_amd64.rpm
switch# delete extension:doublezero-agent_<OLD_VERSION>_linux_amd64.rpm
```

### 4. 新しいバージョンをインストールする

```
switch# copy flash:AGENT_FILENAME extension:
switch# extension AGENT_FILENAME
switch# copy installed-extensions boot-extensions
```

### 5. エージェントのシャットダウンを解除する

```
switch# configure
switch(config)# daemon doublezero-agent
switch(config-daemon-doublezero-agent)# no shutdown
switch(config-daemon-doublezero-agent)# exit
switch(config)# exit
```

### 6. アップグレードを確認する

ステータスが「A, I, B」になっていることを確認します。
```
switch# show extensions
```

### 7. ConfigエージェントのログOutputを確認する

```
show agent doublezero-agent log
```

---

## Telemetryエージェントのアップグレード

Telemetryエージェントの新しいバージョンがリリースされた場合は、以下の手順に従ってアップグレードしてください。

### 1. 最新バージョンをダウンロードする

```
switch# bash
$ sudo bash
# cd /mnt/flash
# wget TELEMETRY_DOWNLOAD_URL
# exit
$ exit
```

### 2. エージェントをシャットダウンする

```
switch# configure
switch(config)# daemon doublezero-telemetry
switch(config-daemon-doublezero-telemetry)# shutdown
switch(config-daemon-doublezero-telemetry)# exit
switch(config)# exit
```

### 3. 古いバージョンを削除する

まず、古いバージョンのファイル名を確認します：
```
switch# show extensions
```

以下のコマンドを実行して古いバージョンを削除します。`<OLD_VERSION>`を上記の出力から得た古いバージョンに置き換えてください：
```
switch# delete flash:doublezero-device-telemetry-agent_<OLD_VERSION>_linux_amd64.rpm
switch# delete extension:doublezero-device-telemetry-agent_<OLD_VERSION>_linux_amd64.rpm
```

### 4. 新しいバージョンをインストールする

```
switch# copy flash:TELEMETRY_FILENAME extension:
switch# extension TELEMETRY_FILENAME
switch# copy installed-extensions boot-extensions
```

### 5. エージェントのシャットダウンを解除する

```
switch# configure
switch(config)# daemon doublezero-telemetry
switch(config-daemon-doublezero-telemetry)# no shutdown
switch(config-daemon-doublezero-telemetry)# exit
switch(config)# exit
```

### 6. アップグレードを確認する

ステータスが「A, I, B」になっていることを確認します。
```
switch# show extensions
```

### 7. TelemetryエージェントのログOutputを確認する

```
show agent doublezero-telemetry log
```

---

## モニタリング

> ⚠️ **重要：**
>
>  1. 以下の設定例では、エージェントが管理VRFを使用しているかどうかに注意してください。
>  2. ConfigエージェントとTelemetryエージェントは、デフォルトでメトリクスエンドポイントに同じリスニングポート（:8080）を使用します。両方でメトリクスを有効にする場合は、`-metrics-addr`フラグを使用して各エージェントに固有のリスニングポートを設定してください。

### Configエージェントのメトリクス

DoubleZeroデバイス上のConfigエージェントは、`doublezero-agent`デーモン設定で`-metrics-enable`フラグを設定することで、Prometheus互換のメトリクスを公開できます。デフォルトのリスニングポートはtcp/8080ですが、`-metrics-addr`で環境に合わせて変更できます：
```
daemon doublezero-agent
   exec /usr/local/bin/doublezero-agent -pubkey $PUBKEY -controller $CONTROLLER_ADDR -metrics-enable -metrics-addr 10.0.0.11:2112
   no shutdown
```

Goランタイムメトリクスとともに、以下のDoubleZero固有のメトリクスが公開されます：
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

#### 重要なエラーシグナル

- `up` - Prometheusがスクレイプインスタンスが正常で到達可能な場合に自動的に生成する時系列メトリクスです。これが0の場合、エージェントに到達できないか、エージェントが稼働していない可能性があります。
- `doublezero_agent_apply_config_errors_total` - エージェントが適用しようとしている設定が失敗しています。この状況では、これが解決されるまでユーザーはデバイスにオンボードできず、オンチェーンの設定変更も適用されません。
- `doublezero_agent_get_config_errors_total` - ローカルConfigエージェントがDoubleZeroコントローラーと通信できないことを示します。ほとんどの場合、デバイスの管理接続に問題がある可能性があります。上記のメトリクスと同様に、これが解決されるまでユーザーはデバイスにオンボードできず、オンチェーンの設定変更も適用されません。

### Telemetryエージェントのメトリクス

DoubleZeroデバイス上のTelemetryエージェントは、`doublezero-telemetry`デーモン設定で`-metrics-enable`フラグを設定することで、Prometheus互換のメトリクスを公開できます。デフォルトのリスニングポートはtcp/8080ですが、`-metrics-addr`で環境に合わせて変更できます：
```
daemon doublezero-telemetry
   exec /usr/local/bin/doublezero-telemetry  --local-device-pubkey $PUBKEY --env $ENV --keypair $KEY_PAIR -metrics-enable --metrics-addr 10.0.0.11:2113
   no shutdown
```

Goランタイムメトリクスとともに、以下のDoubleZero固有のメトリクスが公開されます：
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

#### 重要なエラーシグナル

- `up` - Prometheusがスクレイプインスタンスが正常で到達可能な場合に自動的に生成する時系列メトリクスです。これが0の場合、エージェントに到達できないか、エージェントが稼働していない可能性があります。
- `error_type`が`submitter_failed_to_write_samples`の`doublezero_device_telemetry_agent_errors_total` - Telemetryエージェントがオンチェーンにサンプルを書き込めないことを示すシグナルで、デバイスの管理接続の問題が原因である可能性があります。

---

## リンク管理

### リンクドレイン

リンクドレインにより、コントリビューターはメンテナンスやトラブルシューティングのために、アクティブなサービスからリンクを正常に削除できます。2つのドレイン状態があります：

| ステータス | IS-IS動作 | 説明 |
|--------|----------------|-------------|
| `soft-drained` | メトリクスを1,000,000に設定 | リンクの優先度が下げられます。代替パスが利用可能な場合はそちらを使用しますが、他に選択肢がない場合はこのリンクを使用します。 |
| `hard-drained` | パッシブに設定 | リンクがルーティングから完全に削除されます。このリンクを通過するトラフィックはありません。 |

### 状態遷移

以下の状態遷移が許可されています：

```
activated → soft-drained ✓
activated → hard-drained ✓
soft-drained → hard-drained ✓
hard-drained → soft-drained ✓
soft-drained → activated ✓
hard-drained → activated ✗ (must go through soft-drained first)
```

> ⚠️ **注意：**
> `hard-drained`から直接`activated`に移行することはできません。まず`soft-drained`に遷移してから`activated`に移行する必要があります。

### リンクのソフトドレイン

ソフトドレインは、IS-ISメトリクスを1,000,000に設定することでリンクの優先度を下げます。トラフィックは代替パスを優先しますが、必要な場合はこのリンクを使用することもできます。

```bash
doublezero link update --pubkey <LINK_PUBKEY> --status soft-drained
```

### リンクのハードドレイン

ハードドレインは、IS-ISをパッシブモードに設定することでリンクをルーティングから完全に削除します。このリンクを通過するトラフィックはありません。

```bash
doublezero link update --pubkey <LINK_PUBKEY> --status hard-drained
```

### リンクをアクティブに復元する

ドレインされたリンクを通常の動作に戻すには：

```bash
# soft-drainedから
doublezero link update --pubkey <LINK_PUBKEY> --status activated

# hard-drainedから（先にsoft-drainedを経由する必要があります）
doublezero link update --pubkey <LINK_PUBKEY> --status soft-drained
doublezero link update --pubkey <LINK_PUBKEY> --status activated
```

### 遅延オーバーライド

遅延オーバーライド機能により、コントリビューターは実際に測定された遅延値を変更せずに、リンクの有効な遅延を一時的に変更できます。これは、リンクをプライマリパスからセカンダリパスに一時的に降格する場合に役立ちます。

### 遅延オーバーライドを設定する

リンクの遅延をオーバーライドする（ルーティングでの優先度を下げる）には：

```bash
doublezero link update --pubkey <LINK_PUBKEY> --delay-override-ms 100
```

有効な値は`0.01`〜`1000`ミリ秒です。

### 遅延オーバーライドを解除する

オーバーライドを削除して実際に測定された遅延の使用に戻るには：

```bash
doublezero link update --pubkey <LINK_PUBKEY> --delay-override-ms 0
```

> ⚠️ **注意：**
> リンクがsoft-drainedの場合、優先度を下げるために`delay_ms`と`delay_override_ms`の両方が1000ms（1秒）にオーバーライドされます。
