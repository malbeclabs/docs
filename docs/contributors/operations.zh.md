---
description: DoubleZero 贡献者的持续运维任务 — 代理升级、设备和接口更新、链路管理以及事件记录。
---

# 贡献者运维指南


本指南涵盖维护 DoubleZero 设备 (DZD) 的持续运维任务，包括代理升级、设备/接口更新和链路管理。

## 事件与维护记录

任何计划内维护或计划外链路/设备问题都应在 [OPS Management 门户](ops-management.md)中记录。这使所有贡献者能够了解整个网络中正在发生的事情，并避免重复排查。

- **计划内工作**（例如更换光模块、运营商计划维护）：在开始之前创建维护记录。
- **计划外问题**（例如链路中断、接口错误、丢包）：在开始排查时立即创建事件工单。

请参阅 [OPS Management 指南](ops-management.md)了解入门步骤和如何创建工单。

---

**前提条件**：在使用本指南之前，请确保您已：

- 完成[设备配置指南](provisioning.md)
- 您的 DZD 已完全运行，Config 和 Telemetry 代理均在运行中

---

## 设备更新

使用 `doublezero device update` 在初始配置后修改设备设置。

```bash
doublezero device update --pubkey <DEVICE_PUBKEY> [OPTIONS]
```

**常用更新选项：**

| 选项 | 描述 |
|--------|-------------|
| `--device-type <TYPE>` | 更改运行模式：`hybrid`、`transit`、`edge`（参见[设备类型](provisioning.md#understanding-device-types)） |
| `--location <LOCATION>` | 将设备迁移到不同位置 |
| `--metrics-publisher <PUBKEY>` | 更改指标发布者密钥 |

---

## 接口更新

使用 `doublezero device interface update` 修改现有接口。此命令接受与 `interface create` 相同的选项。

```bash
doublezero device interface update <DEVICE> <NAME> [OPTIONS]
```

有关接口选项的完整列表（包括 CYOA/DIA 设置），请参阅[创建接口](provisioning.md#step-35-create-cyoa-interface-for-edgehybrid-devices)。

**示例 - 为现有接口添加 CYOA 设置：**

```bash
doublezero device interface update lax-dz001 Ethernet1/2 \
  --interface-cyoa gre-over-dia \
  --interface-dia dia \
  --bandwidth 10000 \
  --cir 1000
```

### 列出接口

```bash
doublezero device interface list              # All interfaces across all devices
doublezero device interface list <DEVICE>     # Interfaces for a specific device
```

---

## Config 代理升级

当 Config Agent 发布新版本时，请按照以下步骤进行升级。

### 1. 下载最新版本

```
switch# bash
$ sudo bash
# cd /mnt/flash
# wget AGENT_DOWNLOAD_URL
# exit
$ exit
```

### 2. 关闭代理

```
switch# configure
switch(config)# daemon doublezero-agent
switch(config-daemon-doublezero-agent)# shutdown
switch(config-daemon-doublezero-agent)# exit
switch(config)# exit
```

### 3. 移除旧版本

首先，查找旧版本的文件名：
```
switch# show extensions
```

运行以下命令移除旧版本。将 `<OLD_VERSION>` 替换为上面输出中的旧版本号：
```
switch# delete flash:doublezero-agent_<OLD_VERSION>_linux_amd64.rpm
switch# delete extension:doublezero-agent_<OLD_VERSION>_linux_amd64.rpm
```

### 4. 安装新版本

```
switch# copy flash:AGENT_FILENAME extension:
switch# extension AGENT_FILENAME
switch# copy installed-extensions boot-extensions
```

### 5. 启用代理

```
switch# configure
switch(config)# daemon doublezero-agent
switch(config-daemon-doublezero-agent)# no shutdown
switch(config-daemon-doublezero-agent)# exit
switch(config)# exit
```

### 6. 验证升级

Status 应显示为 "A, I, B"。
```
switch# show extensions
```

### 7. 验证 Config 代理日志输出

```
show agent doublezero-agent log
```

---

## Telemetry 代理升级

当 Telemetry Agent 发布新版本时，请按照以下步骤进行升级。

### 1. 下载最新版本

```
switch# bash
$ sudo bash
# cd /mnt/flash
# wget TELEMETRY_DOWNLOAD_URL
# exit
$ exit
```

### 2. 关闭代理

```
switch# configure
switch(config)# daemon doublezero-telemetry
switch(config-daemon-doublezero-telemetry)# shutdown
switch(config-daemon-doublezero-telemetry)# exit
switch(config)# exit
```

### 3. 移除旧版本

首先，查找旧版本的文件名：
```
switch# show extensions
```

运行以下命令移除旧版本。将 `<OLD_VERSION>` 替换为上面输出中的旧版本号：
```
switch# delete flash:doublezero-device-telemetry-agent_<OLD_VERSION>_linux_amd64.rpm
switch# delete extension:doublezero-device-telemetry-agent_<OLD_VERSION>_linux_amd64.rpm
```

### 4. 安装新版本

```
switch# copy flash:TELEMETRY_FILENAME extension:
switch# extension TELEMETRY_FILENAME
switch# copy installed-extensions boot-extensions
```

### 5. 启用代理

```
switch# configure
switch(config)# daemon doublezero-telemetry
switch(config-daemon-doublezero-telemetry)# no shutdown
switch(config-daemon-doublezero-telemetry)# exit
switch(config)# exit
```

### 6. 验证升级

Status 应显示为 "A, I, B"。
```
switch# show extensions
```

### 7. 验证 Telemetry 代理日志输出

```
show agent doublezero-telemetry log
```

---

## 监控 {#monitoring}

> ⚠️ **重要：**
>
>  1. 对于以下配置示例，请注意您的代理是否正在使用管理 VRF。
>  2. 配置代理和遥测代理默认使用相同的监听端口 (:8080) 作为其指标端点。如果您同时启用两者的指标功能，请使用 `-metrics-addr` 标志为每个代理设置唯一的监听端口。

### Config 代理指标

DoubleZero 设备上的配置代理能够通过在 `doublezero-agent` 守护进程配置中设置 `-metrics-enable` 标志来暴露与 prometheus 兼容的指标。默认监听端口为 tcp/8080，但可以通过 `-metrics-addr` 更改以适应环境：
```
daemon doublezero-agent
   exec /usr/local/bin/doublezero-agent -pubkey $PUBKEY -controller $CONTROLLER_ADDR -metrics-enable -metrics-addr 10.0.0.11:2112
   no shutdown
```

以下 DoubleZero 特定指标与 go 特定运行时指标一起暴露：
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

#### 高信号错误

- `up` - 这是 prometheus 在抓取实例健康且可达时自动生成的时间序列指标。如果不可达，则表示代理不可访问或代理未运行。
- `doublezero_agent_apply_config_errors_total` - 代理尝试应用的配置失败。在这种情况下，用户将无法接入该设备，链上配置变更在问题解决之前也不会被应用。
- `doublezero_agent_get_config_errors_total` - 这表明本地配置代理无法与 DoubleZero 控制器通信。在大多数情况下，这可能是由于设备上的管理连接问题。与上述指标类似，用户将无法接入该设备，链上配置变更在问题解决之前也不会被应用。

### Telemetry 代理指标

DoubleZero 设备上的遥测代理能够通过在 `doublezero-telemetry` 守护进程配置中设置 `-metrics-enable` 标志来暴露与 prometheus 兼容的指标。默认监听端口为 tcp/8080，但可以通过 `-metrics-addr` 更改以适应环境：
```
daemon doublezero-telemetry
   exec /usr/local/bin/doublezero-telemetry  --local-device-pubkey $PUBKEY --env $ENV --keypair $KEY_PAIR -metrics-enable --metrics-addr 10.0.0.11:2113
   no shutdown
```

以下 DoubleZero 特定指标与 go 特定运行时指标一起暴露：
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

#### 高信号错误

- `up` - 这是 prometheus 在抓取实例健康且可达时自动生成的时间序列指标。如果不可达，则表示代理不可访问或代理未运行。
- `doublezero_device_telemetry_agent_errors_total`，`error_type` 为 `submitter_failed_to_write_samples` - 这表明遥测代理无法将样本写入链上，这可能是由于设备上的管理连接问题。

---

## 链路管理

### 链路排空 {#link-draining}

链路排空允许贡献者在维护或故障排查时优雅地将链路从活跃服务中移除。有两种排空状态：

| 状态 | IS-IS 行为 | 描述 |
|--------|----------------|-------------|
| `soft-drained` | Metric 设置为 1,000,000 | 链路被降低优先级。流量将优先使用备选路径（如果可用），但如果这是唯一的选项，仍会使用此链路。 |
| `hard-drained` | 设置为 passive | 链路完全从路由中移除。不会有流量经过此链路。 |

### 状态转换

允许以下状态转换：

```
activated → soft-drained ✓
activated → hard-drained ✓
soft-drained → hard-drained ✓
hard-drained → soft-drained ✓
soft-drained → activated ✓
hard-drained → activated ✗ (must go through soft-drained first)
```

> ⚠️ **注意：**
> 不能直接从 `hard-drained` 转换到 `activated`。必须先转换到 `soft-drained`，然后再转换到 `activated`。

### 软排空链路

软排空通过将链路的 IS-IS metric 设置为 1,000,000 来降低其优先级。流量将优先使用备选路径，但在必要时仍可使用此链路。

```bash
doublezero link update --pubkey <LINK_PUBKEY> --status soft-drained
```

### 硬排空链路

硬排空通过将 IS-IS 设置为 passive 模式，将链路完全从路由中移除。不会有流量经过此链路。

```bash
doublezero link update --pubkey <LINK_PUBKEY> --status hard-drained
```

### 将链路恢复为活跃状态

将已排空的链路恢复为正常运行：

```bash
# From soft-drained
doublezero link update --pubkey <LINK_PUBKEY> --status activated

# From hard-drained (must go through soft-drained first)
doublezero link update --pubkey <LINK_PUBKEY> --status soft-drained
doublezero link update --pubkey <LINK_PUBKEY> --status activated
```

### 延迟覆盖

延迟覆盖功能允许贡献者临时更改链路的有效延迟值，而不修改实际测量的延迟值。这对于将链路从主路径临时降级为备选路径非常有用。

### 设置延迟覆盖

覆盖链路的延迟（使其在路由中不太被优先选择）：

```bash
doublezero link update --pubkey <LINK_PUBKEY> --delay-override-ms 100
```

有效值为 `0.01` 到 `1000` 毫秒。

### 清除延迟覆盖

移除覆盖值并恢复使用实际测量的延迟：

```bash
doublezero link update --pubkey <LINK_PUBKEY> --delay-override-ms 0
```

> ⚠️ **注意：**
> 当链路处于软排空状态时，`delay_ms` 和 `delay_override_ms` 都会被覆盖为 1000ms（1 秒）以确保降低优先级。