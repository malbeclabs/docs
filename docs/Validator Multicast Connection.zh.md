---
description: 配置已连接的验证者，将领导者 shred 发布到 DoubleZero 组播边缘 feed。
---

# 验证者组播连接
!!! warning "连接到 DoubleZero 即表示我同意 [DoubleZero 服务条款](https://doublezero.xyz/terms-protocol)"

!!! note inline end "交易公司和企业"
    如果您经营交易公司或企业并希望订阅该 feed，请在[此处](https://doublezero.xyz/edge-form)注册以获取更多信息。

如果您尚未连接到 DoubleZero，请先完成 [Setup](<setup.md>) 和 [Mainnet-Beta](<DZ Mainnet-beta Connection.md>) 验证者连接文档。

如果您是已连接到 DoubleZero 的验证者，可以继续阅读本指南。

## 1. 客户端配置

### Jito-Agave (v3.1.9+) 和 Harmonic (3.1.11+)

1. 在您的验证者启动脚本中，添加：`--shred-receiver-address 233.84.178.1:7733`

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

2. 重启您的验证者。
3. 以发布者身份连接到 DoubleZero 组播组 `edge-solana-shreds`：`doublezero connect ibrl && doublezero connect multicast --publish edge-solana-shreds`

### Frankendancer

1. 在 `config.toml` 中，添加：

    ```toml
    [tiles.shred]
    additional_shred_destinations_leader = [ "233.84.178.1:7733", ]
    ```

2. 重启您的验证者。
3. 以发布者身份连接到 DoubleZero 组播组 `edge-solana-shreds`：`doublezero connect ibrl && doublezero connect multicast --publish edge-solana-shreds`

## 2. 确认您正在发布领导者 shred

连接成功后，您可以查看[此仪表板](https://data.doublezero.xyz/dz/publisher-check)来确认您正在发布 shred。在您至少发布了一个 slot 的领导者 shred 之后，才会看到确认信息。

## 组播端点（IP 与端口）

对于 shred 流量，**IP 地址**用于选择组播 feed，**端口**用于选择 UDP 服务。
以下所有 feed 均使用 UDP 端口 `7733`。

您可以使用以下命令查找当前的组 IP：

```bash
doublezero multicast group list
```

- `edge-solana-shreds`（领导者）：`233.84.178.1:7733`
- `edge-solana-retrans-eu`：`233.84.178.12:7733`
- `edge-solana-retrans-apac`：`233.84.178.13:7733`
- `edge-solana-retrans-amer`：`233.84.178.14:7733`

有关 API 参考和机器可读数据端点，请参阅 [https://data.doublezero.xyz/api/v1/docs](https://data.doublezero.xyz/api/v1/docs)。

## 3. 验证者奖励

对于验证者发布领导者 shred 的每个 epoch，他们将根据订阅情况按比例获得贡献奖励。该系统的具体细节将在稍后公布并详细说明。

## 故障排除

### 未发布领导者 shred：

无法传输 shred 的最常见原因是客户端版本问题：

您必须运行 Jito-Agave 3.1.9+、JitoBam 3.1.9+、Frankendancer 或 Harmonic 3.1.11+。其他客户端版本将无法工作。

### 重传问题：

1. shred 重传的常见原因是配置问题。您的启动脚本中可能启用了发送重传 shred 的标志；您需要将其禁用。

    在 Jito-Agave 中需要移除的标志是：`--shred-retransmit-receiver-address`。

1. 查看[发布者仪表板](https://data.doublezero.xyz/dz/publisher-check)，检查您是否有重传的 shred。在表格中，查看 **No Retransmit Shreds** 列——红色 X 表示您正在重传。

    !!! note "epoch 视图"
        请注意，发布者仪表板有不同的时间窗口可供查看。如果您在 **2 epoch 视图**中看到重传，但最近刚进行了更改，请尝试切换到**近期 slot** 视图。


    ![发布者检查仪表板](images/publisher-check-dashboard.png)

2. 找到您的客户端 IP，并在 [DoubleZero Data](https://data.doublezero.xyz/dz/users) 中查找您的用户。

    ![DoubleZero Data 用户](images/doublezero-data-users.png)

3. 点击 **Multicast** 打开您的组播视图。

    下方截图显示：**重传中**（不理想的状态）稳定的出站流量，没有领导者 slot 模式。

    ![用户组播视图 - 重传示例](images/user-multicast-view-retransmit.png)

    下方截图显示：**健康**（仅发布领导者 shred）的出站流量呈峰值状，称为锯齿模式，与您的领导者 slot 对齐。

    ![用户组播视图 - 健康发布者示例](images/user-multicast-view-healthy.png)

该图表显示您是否仅发送领导者 shred。流量峰值应与您拥有领导者 slot 的时间一致。当您没有领导者 slot 时，不应有任何流量。如果您正在重传，您将看到稳定的流量而非与 slot 对齐的峰值。