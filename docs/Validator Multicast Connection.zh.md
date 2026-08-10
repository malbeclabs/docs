---
description: 配置已连接的验证器，将领导者分片发布到 DoubleZero 多播边缘馈送。
---

# 验证器多播连接
!!! warning "连接到 DoubleZero 即表示我同意 [DoubleZero 服务条款](https://doublezero.xyz/terms-protocol)"

!!! note inline end "交易公司和企业"
    如果您经营的交易公司或企业希望订阅该馈送，请在[此处](https://doublezero.xyz/edge-form)注册以获取更多信息。

如果您尚未连接到 DoubleZero，请先完成[设置](<setup.md>)和 [Mainnet-Beta](<DZ Mainnet-beta Connection.md>) 验证器连接文档。

如果您是已经连接到 DoubleZero 的验证器，可以继续本指南。

## 1. 客户端配置

### Jito-Agave (v3.1.9+) 和 Harmonic (3.1.11+)

1. 在您的验证器启动脚本中，添加：`--shred-receiver-address 233.84.178.1:7733`

    您可以同时向 Jito 和 `edge-solana-shreds` 组发送数据。

    示例：

    ```json
    #!/bin/bash
    export PATH="/home/sol/.local/share/solana/install/releases/v3.1.9-jito/bin:$PATH"
    BLOCK_ENGINE_URL=https://ny.mainnet.block-engine.jito.wtf
    RELAYER_URL=http://ny.mainnet.relayer.jito.wtf:8100
    SHRED_RECEIVER_ADDR=<JitoBlockEngineAddress>
    <...The rest of your config...>
    --shred-receiver-address 233.84.178.1:7733
    ```

2. 重启您的验证器。
3. 作为发布者连接到 DoubleZero 多播组 `edge-solana-shreds`：`doublezero connect ibrl && doublezero connect multicast --publish edge-solana-shreds`

### Frankendancer

1. 在 `config.toml` 中，添加：

    ```toml
    [tiles.shred]
    additional_shred_destinations_leader = [ "233.84.178.1:7733", ]
    ```

2. 重启您的验证器。
3. 作为发布者连接到 DoubleZero 多播组 `edge-solana-shreds`：`doublezero connect ibrl && doublezero connect multicast --publish edge-solana-shreds`

## 2. 确认您正在发布领导者分片

连接后，您可以查看[此仪表板](https://data.doublezero.xyz/dz/publisher-check)以确认您正在发布分片。在您至少发布了一个槽位的领导者分片之后，才会看到确认信息。

## 多播端点（IP 与端口）

对于分片流量，**IP 地址**用于选择多播馈送，**端口**用于选择 UDP 服务。
以下所有馈送均使用 UDP 端口 `7733`。

您可以使用以下命令查看当前的组 IP：

```bash
doublezero multicast group list
```

- `edge-solana-shreds`（领导者）：`233.84.178.1:7733`
- `edge-solana-retrans-eu`：`233.84.178.12:7733`
- `edge-solana-retrans-apac`：`233.84.178.13:7733`
- `edge-solana-retrans-amer`：`233.84.178.14:7733`

有关 API 参考和机器可读数据端点，请参阅 [https://data.doublezero.xyz/api/v1/docs](https://data.doublezero.xyz/api/v1/docs)。

## 3. 验证器奖励

在验证器发布领导者分片的每个纪元中，它们将根据订阅情况按比例获得贡献奖励。该系统的具体细节将在后续公布并详细说明。

## 故障排除

### 未发布领导者分片：

未能传输分片的最常见原因是客户端版本问题：

您必须运行 Jito-Agave 3.1.9+、JitoBam 3.1.9+、Frankendancer 或 Harmonic 3.1.11+。其他客户端版本将无法工作。

### 重传问题：

1. 分片重传的常见原因是配置错误。您的启动脚本中可能启用了发送重传分片的标志；您需要将其禁用。

    在 Jito-Agave 中需要移除的标志是：`--shred-retransmit-receiver-address`。

1. 查看[发布者仪表板](https://data.doublezero.xyz/dz/publisher-check)，检查您是否有重传的分片。在表格中，查看 **No Retransmit Shreds** 列——红色 X 表示您正在重传。

    !!! note "纪元视图"
        请注意，发布者仪表板有不同的时间窗口可供查看。如果您在 **2 纪元视图**中看到重传，但最近刚做了更改，请尝试切换到**最近槽位**视图。


    ![发布者检查仪表板](images/publisher-check-dashboard.png)

2. 找到您的客户端 IP，并在 [DoubleZero Data](https://data.doublezero.xyz/dz/users) 中查找您的用户信息。

    ![DoubleZero Data 用户](images/doublezero-data-users.png)

3. 点击 **Multicast** 打开您的多播视图。

    下面的截图展示了：**重传**（不期望的）稳定出站流量，没有领导者槽位模式。

    ![用户多播视图 - 重传示例](images/user-multicast-view-retransmit.png)

    下面的截图展示了：**健康**（仅发布领导者分片）出站流量呈尖峰状，即锯齿模式，与您的领导者槽位一致。

    ![用户多播视图 - 健康发布者示例](images/user-multicast-view-healthy.png)

该图表显示您是否仅发送领导者分片。流量尖峰应与您拥有领导者槽位的时间一致。当您没有领导者槽位时，不应有任何流量。如果您正在重传，您将看到稳定的流量而非与槽位对齐的尖峰。