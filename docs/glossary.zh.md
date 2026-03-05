# 词汇表

本页面定义了文档中使用的DoubleZero专用术语。

---

## 网络基础设施

### DZD（DoubleZero设备）
终止DoubleZero链路并运行DoubleZero代理软件的物理网络交换硬件。DZD部署在数据中心，提供路由、数据包处理和用户连接服务。每个DZD需要特定的[硬件规格](contribute.md#dzd-network-hardware)，并同时运行[配置代理](#config-agent)和[遥测代理](#telemetry-agent)。

### DZX（DoubleZero交换点）
网状网络中不同[贡献者](#contributor)链路相互桥接的互连点。DZX位于发生网络交叉的主要都市区（如纽约、伦敦、东京）。网络贡献者必须在最近的DZX将其链路交叉连接到更广泛的DoubleZero网状网络。概念上类似于互联网交换点（IX）。

### WAN链路
由**同一**贡献者运营的两个[DZD](#dzd-doublezero-device)之间的广域网链路。WAN链路在单个贡献者的基础设施内提供骨干连接。

### DZX链路
由**不同**贡献者运营的[DZD](#dzd-doublezero-device)之间在[DZX](#dzx-doublezero-exchange)建立的链路。DZX链路需要双方明确接受。

### DZ前缀
以CIDR格式分配给[DZD](#dzd-doublezero-device)的IP地址分配，用于覆盖网络寻址。在[设备创建](contribute-provisioning.md#step-32-create-your-device-onchain)时使用`--dz-prefixes`参数指定。

---

## 设备类型

### 边缘设备
为DoubleZero网络提供用户连接的[DZD](#dzd-doublezero-device)。边缘设备利用[CYOA](#cyoa-choose-your-own-adventure)接口终止用户（验证器、RPC运营商）并将其连接到网络。

### 中转设备
在DoubleZero网络内提供骨干连接的[DZD](#dzd-doublezero-device)。中转设备在DZD之间传输流量，但不直接终止用户连接。

### 混合设备
结合[边缘](#edge-device)和[中转](#transit-device)功能的[DZD](#dzd-doublezero-device)，同时提供用户连接和骨干路由。

---

## 连接性

### CYOA（自选冒险）
允许[贡献者](#contributor)为用户注册连接选项以连接到DoubleZero网络的接口类型。CYOA接口包括[DIA](#dia-direct-internet-access)、GRE隧道和私有对等互联等各种方法。有关配置详情，请参阅[创建CYOA接口](contribute-provisioning.md#step-35-create-cyoa-interface-for-edgehybrid-devices)。

### DIA（直接互联网访问）
通过公共互联网提供连接的标准网络术语。在DoubleZero中，DIA是一种[CYOA](#cyoa-choose-your-own-adventure)接口类型，用户（验证器、RPC运营商）通过其现有互联网连接连接到[DZD](#dzd-doublezero-device)。

### IBRL（增加带宽减少延迟）
允许验证器和RPC节点在不重启区块链客户端的情况下连接到DoubleZero的连接模式。IBRL使用现有公共IP地址，并建立到最近[DZD](#dzd-doublezero-device)的覆盖隧道。有关设置说明，请参阅[主网Beta连接](DZ%20Mainnet-beta%20Connection.md)。

### 多播
DoubleZero支持的一对多数据包传送方法。多播模式有两种角色：**发布者**（跨网络发送数据包）和**订阅者**（从发布者接收数据包）。开发团队使用此方式进行高效的数据分发。有关连接详情，请参阅[其他多播连接](Other%20Multicast%20Connection.md)。

---

## 软件组件

### doublezerod
运行在用户服务器（验证器、RPC节点）上的DoubleZero守护程序服务。它管理到DoubleZero网络的连接、处理隧道建立，并维持与[DZD](#dzd-doublezero-device)的连接。通过systemd配置，并通过[`doublezero`](#doublezero-cli) CLI控制。

### doublezero（CLI）
用于与DoubleZero网络交互的命令行界面。用于连接、管理身份、检查状态和行政操作。与[`doublezerod`](#doublezerod)守护程序通信。

### 配置代理
运行在[DZD](#dzd-doublezero-device)上的软件代理，管理设备配置。从[控制器](#controller)服务读取配置并将更改应用到设备。有关设置，请参阅[配置代理安装](contribute-provisioning.md#step-44-install-config-agent)。

### 遥测代理
运行在[DZD](#dzd-doublezero-device)上的软件代理，收集性能指标（延迟、抖动、丢包）并将其提交到DoubleZero账本。有关设置，请参阅[遥测代理安装](contribute-provisioning.md#step-45-install-telemetry-agent)。

### 控制器
向[DZD](#dzd-doublezero-device)代理提供配置的服务。控制器从DoubleZero账本上的[链上](#onchain)状态派生设备配置。

---

## 链路状态

### 已激活
链路的正常运行状态。流量通过链路流动，并参与路由决策。

### 软清空
流量将在特定链路上被阻止的维护状态。用于优雅的维护窗口。可以过渡到[已激活](#activated)或[硬清空](#hard-drained)。

### 硬清空
链路完全从服务中移除的维护状态。没有流量通过链路。必须先过渡到[软清空](#soft-drained)才能返回到[已激活](#activated)。

---

## 组织与代币

### DZF（DoubleZero基金会）
DoubleZero基金会是一个无成员的非营利开曼群岛基金会公司，成立目的是支持DoubleZero网络的开发、去中心化、安全性和采用。

### 2Z代币
DoubleZero网络的原生代币。用于支付验证器费用并作为奖励分配给[贡献者](#contributor)。验证器可以通过链上兑换程序以2Z支付费用。请参阅[使用2Z支付费用](paying-fees2z.md)和[将SOL兑换为2Z](Swapping-sol-to-2z.md)。

### 贡献者
向DoubleZero网络贡献带宽和硬件的网络基础设施提供商。贡献者运营[DZD](#dzd-doublezero-device)，提供[WAN](#wan-link)和[DZX](#dzx-link)链路，并因其贡献而获得[2Z](#2z-token)代币激励。请参阅[贡献者文档](contribute-overview.md)以开始。

---

## 网络概念

### MTU（最大传输单元）
可以通过网络链路传输的最大数据包大小（以字节为单位）。DoubleZero WAN链路通常使用MTU 9000（巨型帧）以提高效率。

### VRF（虚拟路由和转发）
允许同一物理路由器上存在多个隔离路由表的技术。贡献者通常使用单独的管理VRF将交换机管理流量与生产流量隔离。

### GRE（通用路由封装）
将网络数据包封装在IP数据包内的隧道协议。[IBRL](#ibrl-increase-bandwidth-reduce-latency)和[CYOA](#cyoa-choose-your-own-adventure)连接使用GRE在用户和DZD之间创建覆盖隧道。

### BGP（边界网关协议）
用于在互联网上的网络之间交换路由信息的路由协议。DoubleZero内部使用BGP，ASN为65342。

### ASN（自治系统号）
分配给网络用于BGP路由的唯一标识符。所有DoubleZero设备使用**ASN 65342**作为内部BGP进程。

### 环回接口
路由器/交换机上用于管理和路由目的的虚拟网络接口。DZD使用Loopback255（VPNv4）和Loopback256（IPv4）进行内部路由。

### CIDR（无类别域间路由）
指定IP地址范围的表示法。格式为`IP/前缀长度`，其中前缀长度表示网络大小（如`/29` = 8个地址，`/24` = 256个地址）。

### 抖动
随时间变化的数据包延迟变化。低抖动对于实时应用至关重要。

### RTT（往返时间）
数据包从源到目的地再返回所需的时间。用于测量设备之间的网络延迟。

### TWAMP（双向主动测量协议）
用于测量延迟和丢包等网络性能指标的协议。[遥测代理](#telemetry-agent)使用TWAMP收集DZD之间的指标。

### IS-IS（中间系统到中间系统）
DoubleZero网络内部使用的链路状态路由协议。在[链路清空](#soft-drained)操作期间调整IS-IS指标。

---

## 区块链与密钥

### 链上
在DoubleZero语境中，链上指记录在DoubleZero账本上的数据和操作。与传统网络中设备和链路配置存在于集中式管理系统不同，DoubleZero将设备注册、链路配置和遥测提交记录在链上——使所有参与者都能透明和可验证地了解网络状态。

### 服务密钥
用于验证CLI操作的加密密钥对。这是您与DoubleZero智能合约交互的贡献者身份。存储于`~/.config/solana/id.json`。

### 指标发布者密钥
[遥测代理](#telemetry-agent)用于签署向区块链提交指标的加密密钥对。与服务密钥分开，以实现安全隔离。存储于`~/.config/doublezero/metrics-publisher.json`。

---

## 硬件与软件

### EOS（可扩展操作系统）
运行在DZD交换机上的Arista网络操作系统。贡献者将[配置代理](#config-agent)和[遥测代理](#telemetry-agent)作为EOS扩展安装。

### EOS扩展
可以安装在Arista EOS交换机上的软件包。DZ代理以`.rpm`文件形式分发，通过`extension`命令安装。
