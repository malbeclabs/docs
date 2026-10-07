---
description: 成为 DoubleZero 网络贡献者的概述和入网清单。
---

# 贡献者文档

!!! info "术语说明"
    初次接触 DoubleZero？请参阅[术语表](../reference/glossary.md)，了解 [DZD](../reference/glossary.md#dzd-doublezero-device)、[DZX](../reference/glossary.md#dzx-doublezero-exchange) 和 [CYOA](../reference/glossary.md#cyoa-choose-your-own-adventure) 等关键术语的定义。

欢迎阅读 DoubleZero 贡献者文档。本部分涵盖成为网络贡献者所需了解的全部内容。

!!! tip "有意成为网络贡献者？"
    请查阅[要求与架构](requirements.md)页面，了解为 DoubleZero 网络做贡献所需的硬件、带宽和连接要求。

---

## 入网清单 {#onboarding-checklist}

使用此清单来跟踪您的进度。**在您的贡献进入技术运行状态之前，所有项目必须全部完成。**

### 阶段 1：前提条件
- [ ] 在管理服务器上安装 DoubleZero CLI
- [ ] 已采购硬件并满足[要求](requirements.md#hardware-requirements)
- [ ] 数据中心机架空间和电力就绪（建议 4U、4KW）
- [ ] DZD 已物理安装并具备管理连接
- [ ] 已为 DZ 协议分配公共 IPv4 地址块（**请参阅 [DZ 前缀规则](#dz-prefix-rules)**）

### 阶段 2：账户设置
- [ ] 已生成服务密钥对（`doublezero keygen`）
- [ ] 已生成指标发布者密钥对
- [ ] 已向 DZF 提交服务密钥以获得授权
- [ ] 已在链上创建贡献者账户（通过 `doublezero contributor list` 验证）
- [ ] 已获得 [malbeclabs/contributors](https://github.com/malbeclabs/contributors) 仓库的访问权限

### 阶段 3：设备配置
- [ ] 已应用基础设备配置（来自 contributors 仓库）
- [ ] 已在链上创建设备（`doublezero device create`）
- [ ] 已注册设备接口
- [ ] 已创建环回接口（Loopback255 vpnv4、Loopback256 ipv4）
- [ ] 已配置 CYOA/DIA 接口（如果是边缘/混合设备）

### 阶段 4：链路建立与代理安装
- [ ] 已创建 WAN 链路（如适用）
- [ ] 已创建 DZX 链路（状态：`requested`）
- [ ] DZX 链路已被对端贡献者接受
- [ ] Config Agent 已安装并运行
- [ ] Config Agent 正在从控制器接收配置
- [ ] Telemetry Agent 已安装并运行
- [ ] 指标发布者已在链上注册
- [ ] 遥测提交在账本上可见

### 阶段 5：链路老化测试
- [ ] 所有链路已排空，进行 24 小时老化测试期
- [ ] [metrics.doublezero.xyz](https://metrics.doublezero.xyz) 显示 24 小时内零丢包且零错误
- [ ] 老化测试通过后链路已恢复流量

### 阶段 6：验证与激活
- [ ] `doublezero device list` 显示您的设备（`max_users = 0`）
- [ ] `doublezero link list` 显示您的链路
- [ ] Config Agent 日志显示配置拉取成功
- [ ] Telemetry Agent 日志显示指标提交成功
- [ ] **与 DZ/Malbec Labs 协调**运行连通性测试（连接、接收路由、通过 DZ 路由）
- [ ] 测试通过后，通过 `doublezero device update` 将 `max_users` 设置为 96

---

## 获取帮助

在入网过程中，DZF 会将您添加到贡献者 Slack 频道：

| 频道 | 用途 |
|---------|---------|
| **#dz-contributor-announcements** | DZF 和 Malbec Labs 的官方通知——CLI/代理升级、重大变更、安全公告。请关注重要更新；有问题请在话题串中提问。 |
| **#dz-contributor-incidents** | 计划外的服务影响事件。事件通过 API/Web 表单自动发布，包含严重程度和受影响的设备/链路。讨论和故障排查在话题串中进行。 |
| **#dz-contributor-maintenance** | 计划维护活动（升级、维修）。通过 API/Web 表单安排，包含计划的开始/结束时间。讨论在话题串中进行。 |
| **#dz-contributor-ops** | 面向所有贡献者的开放讨论——运维问题、CLI 帮助、分享运维手册和操作指南。 |

您还将获得一个**专属的 DZ/Malbec Labs 私有频道**，为您的组织提供直接支持。

---

## DZ 前缀规则 {#dz-prefix-rules}

!!! warning "重要：DZ 前缀池使用规则"
    您提供的 DZ 前缀池**由 DoubleZero 协议管理，用于 IP 地址分配**。

    **DZ 前缀的使用方式：**

    - **第一个 IP**：保留给您的设备（分配给 Loopback100 接口）
    - **剩余 IP**：分配给连接到您 DZD 的特定用户类型：
        - `IBRLWithAllocatedIP` 用户
        - `EdgeFiltering` 用户
        - 组播发布者
    - **IBRL 用户**：不会消耗此池中的地址（他们使用自己的公共 IP）

    **您不能将这些地址用于：**

    - 您自己的网络设备
    - DIA 接口上的点对点链路
    - 管理接口
    - DZ 协议以外的任何基础设施

    **要求：**

    - 必须是**全局可路由（公共）**的 IPv4 地址
    - 私有 IP 范围（10.x、172.16-31.x、192.168.x）会被智能合约拒绝
    - **最小大小：/29**（8 个地址），更大的前缀更佳（例如 /28、/27）
    - 整个地址块必须可用——不要预先分配任何地址

    如果您需要为自己的设备（DIA 接口 IP、管理接口等）分配地址，请使用**单独的地址池**。

---

## 快速参考：关键术语

初次接触 DoubleZero？以下是核心术语（查看[完整术语表](../reference/glossary.md)）：

| 术语 | 定义 |
|------|------------|
| **DZD** | DoubleZero Device——运行 DZ 代理的物理 Arista 交换机 |
| **DZX** | DoubleZero Exchange——贡献者之间互联的城域互联点 |
| **CYOA** | Choose Your Own Adventure——用户连接方式（GREOverDIA、GREOverFabric 等） |
| **DIA** | Direct Internet Access——所有 DZD 都需要的互联网连接，用于控制器和遥测通信，在边缘/混合设备上通常作为用户连接的 CYOA 类型使用 |
| **WAN Link** | 您自己 DZD 之间的链路（同一贡献者） |
| **DZX Link** | 连接到其他贡献者 DZD 的链路（需要双方确认） |
| **Config Agent** | 轮询控制器，将配置应用到您的 DZD |
| **Telemetry Agent** | 收集 TWAMP 延迟/丢包指标，提交到链上账本 |
| **Service Key** | 您用于 CLI 操作的贡献者身份密钥 |
| **Metrics Publisher Key** | 用于链上签名遥测提交的密钥 |

---

---

## 文档结构

| 指南 | 描述 |
|-------|-------------|
| [要求与架构](requirements.md) | 硬件规格、网络架构、带宽选项 |
| [设备配置](provisioning.md) | 分步指南：密钥 → 仓库访问 → 设备 → 链路 → 代理 |
| [运维操作](operations.md) | 代理升级、链路管理、监控 |
| [Geoprobe 部署](geolocation.md) | 部署和配置 geoProbe 代理进行地理定位 |
| [术语表](../reference/glossary.md) | 所有 DoubleZero 术语定义 |

---

## 面向非网络工程师的网络基础知识

如果您没有网络工程背景，以下是本文档中涉及的概念入门介绍：

### IP 寻址

- **IPv4 地址**：网络上设备的唯一标识符（例如 `192.168.1.1`）
- **CIDR 表示法**（`/29`、`/24`）：表示子网大小。`/29` = 8 个地址，`/24` = 256 个地址
- **公共 IP**：可在互联网上路由；**私有 IP**：仅限内部网络（10.x、172.16-31.x、192.168.x）

### 网络层次

- **第 1 层（物理层）**：线缆、光模块、波长
- **第 2 层（数据链路层）**：交换机、VLAN、MAC 地址
- **第 3 层（网络层）**：路由器、IP 地址、路由协议

### 常见术语

- **MTU**：最大传输单元——最大数据包大小（WAN 链路通常为 9000 字节）
- **VLAN**：虚拟局域网——在共享基础设施上逻辑隔离流量
- **VRF**：虚拟路由和转发——在同一设备上隔离路由表
- **BGP**：边界网关协议——网络间路由交换
- **GRE**：通用路由封装——用于覆盖网络的隧道协议
- **TWAMP**：双向主动测量协议——测量设备间的延迟/丢包

### DoubleZero 特定概念

- **链上（Onchain）**：在 DoubleZero 中，设备注册、链路配置和遥测数据记录在 DoubleZero 账本上——使网络状态对所有参与者透明且可验证
- **控制器（Controller）**：从 DoubleZero 账本上的链上状态派生 DZD 配置的服务

---

准备好开始了吗？请从[要求与架构](requirements.md)开始。