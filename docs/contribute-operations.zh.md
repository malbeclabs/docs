# 贡献者运营指南
!!! warning "This translation was generated using artificial intelligence and has not been reviewed by a human translator. It may contain inaccuracies or errors and should not be relied upon."



本指南涵盖维护DoubleZero设备（DZD）的持续运营任务，包括代理升级、设备/接口更新和链路管理。

**前提条件**：使用本指南前，请确保您已：

- 完成[设备配置指南](contribute-provisioning.md)
- 您的DZD已完全运行，Config和Telemetry代理均在运行

---

## 设备更新

使用`doublezero device update`在初始配置后修改设备设置。

```bash
doublezero device update --pubkey <DEVICE_PUBKEY> [OPTIONS]
```

**常用更新选项：**

| 选项 | 描述 |
|------|------|
| `--device-type <TYPE>` | 更改运行模式：`hybrid`、`transit`、`edge`（参见[设备类型](contribute-provisioning.md#understanding-device-types)） |
| `--location <LOCATION>` | 将设备移至不同位置 |
| `--metrics-publisher <PUBKEY>` | 更改指标发布者密钥 |

---

## 接口更新

使用`doublezero device interface update`修改现有接口。此命令接受与`interface create`相同的选项。

```bash
doublezero device interface update <DEVICE> <NAME> [OPTIONS]
```

有关接口选项（包括CYOA/DIA设置）的完整列表，请参见[创建接口](contribute-provisioning.md#step-35-create-cyoa-interface-for-edgehybrid-devices)。

**示例——为现有接口添加CYOA设置：**

```bash
doublezero device interface update lax-dz001 Ethernet1/2 \
  --interface-cyoa gre-over-dia \
  --interface-dia dia \
  --bandwidth 10000 \
  --cir 1000
```

### 列出接口

```bash
doublezero device interface list              # 所有设备的所有接口
doublezero device interface list <DEVICE>     # 特定设备的接口
```

---

## Config Agent升级

当Config Agent新版本发布时，请按照以下步骤升级。

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

### 3. 删除旧版本

首先，找到旧版本的文件名：
```
switch# show extensions
```

运行以下命令删除旧版本。将`<OLD_VERSION>`替换为上面输出中的旧版本：
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

### 5. 启动代理

```
switch# configure
switch(config)# daemon doublezero-agent
switch(config-daemon-doublezero-agent)# no shutdown
switch(config-daemon-doublezero-agent)# exit
switch(config)# exit
```

### 6. 验证升级

状态应为"A, I, B"。
```
switch# show extensions
```

### 7. 验证Config Agent日志输出

```
show agent doublezero-agent log
```

---

## Telemetry Agent升级

当Telemetry Agent新版本发布时，请按照以下步骤升级。

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

### 3. 删除旧版本

首先，找到旧版本的文件名：
```
switch# show extensions
```

运行以下命令删除旧版本。将`<OLD_VERSION>`替换为上面输出中的旧版本：
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

### 5. 启动代理

```
switch# configure
switch(config)# daemon doublezero-telemetry
switch(config-daemon-doublezero-telemetry)# no shutdown
switch(config-daemon-doublezero-telemetry)# exit
switch(config)# exit
```

### 6. 验证升级

状态应为"A, I, B"。
```
switch# show extensions
```

### 7. 验证Telemetry Agent日志输出

```
show agent doublezero-telemetry log
```

---

## 监控

> ⚠️ **重要：**
>
>  1. 对于以下配置示例，请注意您的代理是否使用了管理VRF。
>  2. Config Agent和Telemetry Agent默认使用相同的监听端口（:8080）作为其指标端点。如果两者都启用了指标，请使用`-metrics-addr`标志为每个代理设置唯一的监听端口。

### Config Agent指标

DoubleZero设备上的Config Agent可以通过在`doublezero-agent`守护进程配置中设置`-metrics-enable`标志来公开Prometheus兼容指标。默认监听端口为tcp/8080，但可以通过`-metrics-addr`更改以适应环境：
```
daemon doublezero-agent
   exec /usr/local/bin/doublezero-agent -pubkey $PUBKEY -controller $CONTROLLER_ADDR -metrics-enable -metrics-addr 10.0.0.11:2112
   no shutdown
```

除go特定的运行时指标外，还公开以下DoubleZero特定指标：
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

- `up` — 这是Prometheus在抓取实例健康且可达时自动生成的时间序列指标。如果不可达，则代理不可访问或代理未运行。
- `doublezero_agent_apply_config_errors_total` — 代理尝试应用的配置失败。在此情况下，用户将无法接入设备，并且在解决此问题之前，链上配置更改将不会被应用。
- `doublezero_agent_get_config_errors_total` — 这表示本地Config Agent无法与DoubleZero控制器通信。在大多数情况下，这可能是由于设备上的管理连接问题。与上述指标类似，用户将无法接入设备，并且在解决此问题之前，链上配置更改将不会被应用。

### Telemetry Agent指标

DoubleZero设备上的Telemetry Agent可以通过在`doublezero-telemetry`守护进程配置中设置`-metrics-enable`标志来公开Prometheus兼容指标。默认监听端口为tcp/8080，但可以通过`-metrics-addr`更改以适应环境：
```
daemon doublezero-telemetry
   exec /usr/local/bin/doublezero-telemetry  --local-device-pubkey $PUBKEY --env $ENV --keypair $KEY_PAIR -metrics-enable --metrics-addr 10.0.0.11:2113
   no shutdown
```

除go特定的运行时指标外，还公开以下DoubleZero特定指标：
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

- `up` — 这是Prometheus在抓取实例健康且可达时自动生成的时间序列指标。如果不可达，则代理不可访问或代理未运行。
- `doublezero_device_telemetry_agent_errors_total`中`error_type`为`submitter_failed_to_write_samples` — 这表示Telemetry Agent无法将样本写入链上，可能是由于设备上的管理连接问题。

---

## 链路管理

### 链路排水

链路排水允许贡献者优雅地从活跃服务中移除链路，以进行维护或故障排除。有两种排水状态：

| 状态 | IS-IS行为 | 描述 |
|------|----------|------|
| `soft-drained` | 指标设置为1,000,000 | 链路降低优先级。流量将在有备用路径时使用备用路径，但如果此链路是唯一选项，仍会使用它。 |
| `hard-drained` | 设置为被动模式 | 链路从路由中完全移除。不会有流量经过此链路。 |

### 状态转换

允许以下状态转换：

```
activated → soft-drained ✓
activated → hard-drained ✓
soft-drained → hard-drained ✓
hard-drained → soft-drained ✓
soft-drained → activated ✓
hard-drained → activated ✗ （必须先经过soft-drained）
```

> ⚠️ **注意：**
> 您不能直接从`hard-drained`转到`activated`。必须先转换到`soft-drained`，再转换到`activated`。

### 软排水链路

软排水通过将IS-IS指标设置为1,000,000来降低链路优先级。流量将优先选择备用路径，但在必要时仍可使用此链路。

```bash
doublezero link update --pubkey <LINK_PUBKEY> --status soft-drained
```

### 硬排水链路

硬排水通过将IS-IS设置为被动模式，将链路从路由中完全移除。不会有流量经过此链路。

```bash
doublezero link update --pubkey <LINK_PUBKEY> --status hard-drained
```

### 将链路恢复为活跃状态

将已排水的链路恢复为正常运行：

```bash
# 从soft-drained恢复
doublezero link update --pubkey <LINK_PUBKEY> --status activated

# 从hard-drained恢复（必须先经过soft-drained）
doublezero link update --pubkey <LINK_PUBKEY> --status soft-drained
doublezero link update --pubkey <LINK_PUBKEY> --status activated
```

### 延迟覆盖

延迟覆盖功能允许贡献者临时更改链路的有效延迟，而无需修改实际测量的延迟值。这对于临时将链路从主路径降级为备用路径非常有用。

### 设置延迟覆盖

覆盖链路延迟（使其在路由中不太被优先选择）：

```bash
doublezero link update --pubkey <LINK_PUBKEY> --delay-override-ms 100
```

有效值为`0.01`到`1000`毫秒。

### 清除延迟覆盖

移除覆盖并恢复使用实际测量的延迟：

```bash
doublezero link update --pubkey <LINK_PUBKEY> --delay-override-ms 0
```

> ⚠️ **注意：**
> 当链路处于soft-drained状态时，`delay_ms`和`delay_override_ms`都会被覆盖为1000ms（1秒）以确保降低优先级。
