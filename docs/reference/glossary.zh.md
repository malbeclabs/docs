---
description: 本文档中使用的 DoubleZero 专用术语定义。
---

# 术语表

本页面定义了整个文档中使用的 DoubleZero 专用术语。

---

## 网络基础设施

### DZD（DoubleZero 设备） {#dzd-doublezero-device}
终结 DoubleZero 链路并运行 DoubleZero Agent 软件的物理网络交换硬件。DZD 部署在数据中心，提供路由、数据包处理和用户连接服务。每个 DZD 需要满足特定的[硬件规格](../contributors/requirements.md#dzd-network-hardware)，并同时运行 [Config Agent](#config-agent) 和 [Telemetry Agent](#telemetry-agent)。

### DZX（DoubleZero 交换点） {#dzx-doublezero-exchange}
网状网络中的互连点，不同[贡献者](#contributor)的链路在此桥接在一起。DZX 位于主要都市区域（例如 NYC、LON、TYO），即网络交汇发生的地方。网络贡献者必须在最近的 DZX 将其链路交叉连接到更广泛的 DoubleZero 网状网络中。概念上类似于互联网交换点（IX）。

### WAN 链路 {#wan-link}
由**同一**贡献者运营的两个 [DZD](#dzd-doublezero-device) 之间的广域网链路。WAN 链路在单个贡献者的基础设施内提供骨干连接。

### DZX 链路 {#dzx-link}
由**不同**贡献者运营的 [DZD](#dzd-doublezero-device) 之间的链路，在 [DZX](#dzx-doublezero-exchange) 建立。DZX 链路需要双方明确接受。

### DZ 前缀
以 CIDR 格式分配给 [DZD](#dzd-doublezero-device) 的 IP 地址，用于覆盖网络寻址。在[设备创建](../contributors/provisioning.md#step-32-create-your-device-onchain)时使用 `--dz-prefixes` 参数指定。

---

## 设备类型

### 边缘设备 {#edge-device}
为用户提供 DoubleZero 网络连接的 [DZD](#dzd-doublezero-device)。边缘设备利用 [CYOA](#cyoa-choose-your-own-adventure) 接口终结用户（验证者、RPC 运营商）并将他们连接到网络。

### 传输设备 {#transit-device}
在 DoubleZero 网络内提供骨干连接的 [DZD](#dzd-doublezero-device)。传输设备在 DZD 之间转发流量，但不直接终结用户连接。

### 混合设备
同时具备[边缘](#edge-device)和[传输](#transit-device)功能的 [DZD](#dzd-doublezero-device)，既提供用户连接又提供骨干路由。

---

## 连接方式

### CYOA（自选冒险） {#cyoa-choose-your-own-adventure}
允许[贡献者](#contributor)注册连接选项的接口类型，用户可通过这些选项连接到 DoubleZero 网络。CYOA 接口包括多种方法，如 [DIA](#dia-direct-internet-access)、GRE 隧道和私有对等互联。有关配置详情，请参阅[创建 CYOA 接口](../contributors/provisioning.md#step-35-create-cyoa-interface-for-edgehybrid-devices)。

### DIA（直接互联网接入） {#dia-direct-internet-access}
通过公共互联网提供连接的标准网络术语。在 DoubleZero 中，DIA 是一种 [CYOA](#cyoa-choose-your-own-adventure) 接口类型，用户（验证者、RPC 运营商）通过其现有的互联网连接接入 [DZD](#dzd-doublezero-device)。

### IBRL（增加带宽降低延迟） {#ibrl-increase-bandwidth-reduce-latency}
一种连接模式，允许验证者和 RPC 节点无需重启区块链客户端即可连接到 DoubleZero。IBRL 使用现有的公共 IP 地址，并与最近的 [DZD](#dzd-doublezero-device) 建立覆盖隧道。有关设置说明，请参阅 [Mainnet-Beta 连接](../solana/ibrl/publish.md)。

### 组播
DoubleZero 支持的一对多数据包传输方法。组播模式有两种角色：**发布者**（在网络中发送数据包）和**订阅者**（从发布者接收数据包）。开发团队用于高效的数据分发。有关连接详情，请参阅[其他组播连接](other-multicast.md)。

---

## 软件组件

### doublezerod {#doublezerod}
在用户服务器（验证者、RPC 节点）上运行的 DoubleZero 守护进程服务。它管理与 DoubleZero 网络的连接，处理隧道建立，并维护与 [DZD](#dzd-doublezero-device) 的连接。通过 systemd 配置，并通过 [`doublezero`](#doublezero-cli) CLI 进行控制。

### doublezero（CLI） {#doublezero-cli}
用于与 DoubleZero 网络交互的命令行界面。用于连接、管理身份、检查状态和管理操作。与 [`doublezerod`](#doublezerod) 守护进程通信。

### Config Agent {#config-agent}
运行在 [DZD](#dzd-doublezero-device) 上的软件代理，用于管理设备配置。从 [Controller](#controller) 服务读取配置并将更改应用到设备。有关设置，请参阅 [Config Agent 安装](../contributors/provisioning.md#step-44-install-config-agent)。

### Telemetry Agent {#telemetry-agent}
运行在 [DZD](#dzd-doublezero-device) 上的软件代理，收集性能指标（延迟、抖动、丢包率）并将其提交到 DoubleZero 账本。有关设置，请参阅 [Telemetry Agent 安装](../contributors/provisioning.md#step-45-install-telemetry-agent)。

### Controller {#controller}
向 [DZD](#dzd-doublezero-device) 代理提供配置的服务。Controller 从 DoubleZero 账本上的[链上](#onchain)状态派生设备配置。

---

## 链路状态

### 已激活 {#activated}
链路的正常运行状态。流量通过该链路流动，并参与路由决策。

### 软排空 {#soft-drained}
一种维护状态，流量将被引导避开特定链路。用于平滑的维护窗口。可以转换为[已激活](#activated)或[硬排空](#hard-drained)状态。

### 硬排空 {#hard-drained}
一种维护状态，链路完全从服务中移除。没有流量通过该链路。必须先转换为[软排空](#soft-drained)，然后才能恢复为[已激活](#activated)状态。

---

## 组织与代币

### DZF（DoubleZero 基金会） {#dzf-doublezero-foundation}
DoubleZero Foundation 是一家无会员制的开曼群岛非营利基金会公司，旨在支持 DoubleZero 网络的开发、去中心化、安全和推广。

### 2Z 代币 {#2z-token}
DoubleZero 网络的原生代币。用于支付验证者费用，并作为奖励分发给[贡献者](#contributor)。验证者可以通过链上兑换程序使用 2Z 支付费用。请参阅[将 SOL 兑换为 2Z](../Swapping-sol-to-2z.md)。

### 贡献者 {#contributor}
向 DoubleZero 网络贡献带宽和硬件的网络基础设施提供商。贡献者运营 [DZD](#dzd-doublezero-device)，提供 [WAN](#wan-link) 和 [DZX](#dzx-link) 链路，并因其贡献获得 [2Z](#2z-token) 代币激励。请参阅[贡献者文档](../contributors/index.md)以开始使用。

---

## 网络概念

### MTU（最大传输单元）
可以通过网络链路传输的最大数据包大小（以字节为单位）。DoubleZero WAN 链路通常使用 MTU 9000（巨型帧）以提高效率。

### VRF（虚拟路由和转发）
一种允许多个隔离路由表共存于同一物理路由器上的技术。贡献者通常使用单独的管理 VRF 将交换机管理流量与生产流量隔离。

### GRE（通用路由封装）
一种将网络数据包封装在 IP 数据包内的隧道协议。[IBRL](#ibrl-increase-bandwidth-reduce-latency) 和 [CYOA](#cyoa-choose-your-own-adventure) 连接使用 GRE 在用户和 DZD 之间创建覆盖隧道。

### BGP（边界网关协议）
用于在互联网上的网络之间交换路由信息的路由协议。DoubleZero 内部使用 BGP，ASN 为 65342。

### ASN（自治系统号）
分配给网络用于 BGP 路由的唯一标识符。所有 DoubleZero 设备的内部 BGP 进程使用 **ASN 65342**。

### 环回接口
路由器/交换机上用于管理和路由目的的虚拟网络接口。DZD 使用 Loopback255（VPNv4）和 Loopback256（IPv4）进行内部路由。

### CIDR（无类别域间路由）
一种指定 IP 地址范围的表示法。格式为 `IP/前缀长度`，其中前缀长度表示网络大小（例如，`/29` = 8 个地址，`/24` = 256 个地址）。

### 抖动
数据包延迟随时间的变化。低抖动对实时应用至关重要。

### RTT（往返时间） {#rtt-round-trip-time}
数据包从源到目的地再返回所需的时间。用于测量设备之间的网络延迟。

### TWAMP（双向主动测量协议） {#twamp-two-way-active-measurement-protocol}
一种用于测量延迟和丢包率等网络性能指标的协议。[Telemetry Agent](#telemetry-agent) 使用 TWAMP 收集 DZD 之间的指标。

### IS-IS（中间系统到中间系统）
DoubleZero 网络内部使用的链路状态路由协议。在[链路排空](#soft-drained)操作期间会调整 IS-IS 指标。

---

## 地理定位 {#geolocation}

### 地理定位
一种 DoubleZero 服务，使用延迟测量验证设备的物理位置。已知位置的基础设施（[DZD](#dzd-doublezero-device)）与目标设备之间的 [RTT](#rtt-round-trip-time) 测量提供了经过加密签名的证明，证明设备位于参考点的一定距离内。链上记录测量数据计划在未来版本中实现。请参阅[地理定位](geolocation.md)获取用户文档。

### geoProbe
在[地理定位](#geolocation)系统中充当延迟测量中介的裸金属服务器。geoProbe 位于距 [DZD](#dzd-doublezero-device) 约 1ms 以内的位置，从父 DZD 接收签名的 LocationOffset，并通过 [TWAMP](#twamp-two-way-active-measurement-protocol)、签名 TWAMP 或 ICMP echo 测量到目标设备的 [RTT](#rtt-round-trip-time)。每个 geoProbe 在[链上](#onchain)注册，并关联到一个或多个父 DZD。请参阅 [Geoprobe 部署](../contributors/geolocation.md)获取贡献者文档。

### LocationOffset
一种签名数据结构，包含 [DZD](#dzd-doublezero-device) 的地理位置（纬度和经度）以及实体之间（DZD↔Probe 或 Probe↔Target）的延迟关系链。LocationOffset 使用 Ed25519 签名，并通过 UDP 在测量链中发送。复合偏移包含对先前测量的引用，形成可审计的追踪链。

---

## 区块链与密钥

### 链上 {#onchain}
在 DoubleZero 的语境中，链上指的是记录在 DoubleZero 账本上的数据和操作。与传统网络中设备和链路配置存储在集中式管理系统中不同，DoubleZero 将设备注册、链路配置和遥测提交记录在链上——使网络状态对所有参与者透明且可验证。

### 服务密钥
用于认证 CLI 操作的加密密钥对。这是您与 DoubleZero 智能合约交互时的贡献者身份。存储在 `~/.config/solana/id.json`。

### 指标发布密钥
[Telemetry Agent](#telemetry-agent) 用于对提交到区块链的指标进行签名的加密密钥对。出于安全隔离的目的，与服务密钥分开。存储在 `~/.config/doublezero/metrics-publisher.json`。

---

## 硬件与软件

### EOS（可扩展操作系统）
Arista 的网络操作系统，运行在 DZD 交换机上。贡献者将 [Config Agent](#config-agent) 和 [Telemetry Agent](#telemetry-agent) 作为 EOS 扩展安装。

### EOS 扩展
可以安装在 Arista EOS 交换机上的软件包。DZ 代理以 `.rpm` 文件形式分发，并通过 `extension` 命令安装。