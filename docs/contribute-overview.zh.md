# 贡献者文档

!!! info "术语"
    初次使用DoubleZero？请参阅[词汇表](glossary.md)了解[DZD](glossary.md#dzd-doublezero-device)、[DZX](glossary.md#dzx-doublezero-exchange)和[CYOA](glossary.md#cyoa-choose-your-own-adventure)等关键术语的定义。

欢迎阅读DoubleZero贡献者文档。本节涵盖成为网络贡献者所需的一切内容。

!!! tip "有兴趣成为网络贡献者？"
    请查看[需求与架构](contribute.md)页面，了解为DoubleZero网络做贡献所需的硬件、带宽和连接要求。

---

## 入职核对清单

使用此核对清单跟踪您的进度。**在您的贡献在技术上正式运营之前，所有项目必须完成。**

### 第一阶段：前提条件
- [ ] 在管理服务器上安装DoubleZero CLI
- [ ] 硬件已采购并符合[要求](contribute.md#hardware-requirements)
- [ ] 数据中心机架空间和电源可用（推荐4U、4KW）
- [ ] DZD已物理安装并具有管理连接
- [ ] 为DZ协议分配公共IPv4地址块（**参见[DZ前缀规则](#dz-prefix-rules)**）

### 第二阶段：账户设置
- [ ] 生成服务密钥对（`doublezero keygen`）
- [ ] 生成指标发布者密钥对
- [ ] 服务密钥已提交给DZF进行授权
- [ ] 链上创建贡献者账户（通过`doublezero contributor list`验证）
- [ ] 获得[malbeclabs/contributors](https://github.com/malbeclabs/contributors)仓库访问权限

### 第三阶段：设备配置
- [ ] 已应用基础设备配置（来自contributors仓库）
- [ ] 链上创建设备（`doublezero device create`）
- [ ] 设备接口已注册
- [ ] 环回接口已创建（Loopback255 vpnv4，Loopback256 ipv4）
- [ ] CYOA/DIA接口已配置（如果是边缘/混合设备）

### 第四阶段：链路建立与代理安装
- [ ] WAN链路已创建（如适用）
- [ ] DZX链路已创建（状态：`requested`）
- [ ] DZX链路已由对等贡献者接受
- [ ] 配置代理已安装并运行
- [ ] 配置代理正在从控制器接收配置
- [ ] 遥测代理已安装并运行
- [ ] 指标发布者已在链上注册
- [ ] 遥测提交在账本上可见

### 第五阶段：链路磨合
- [ ] 所有链路已清空进行24小时磨合期
- [ ] [metrics.doublezero.xyz](https://metrics.doublezero.xyz)显示24小时内零丢包和零错误
- [ ] 清洁磨合后链路已取消清空

### 第六阶段：验证与激活
- [ ] `doublezero device list`显示您的设备（`max_users = 0`）
- [ ] `doublezero link list`显示您的链路
- [ ] 配置代理日志显示成功的配置拉取
- [ ] 遥测代理日志显示成功的指标提交
- [ ] **与DZ/Malbec Labs协调**运行连接测试（连接、接收路由、通过DZ路由）
- [ ] 测试通过后，通过`doublezero device update`将`max_users`设置为96

---

## 获取帮助

作为入职的一部分，DZF将把您添加到贡献者Slack频道：

| 频道 | 用途 |
|---------|---------|
| **#dz-contributor-announcements** | DZF和Malbec Labs的官方通信——CLI/代理升级、重大更改、安全公告。监控关键更新；在线程中提问。 |
| **#dz-contributor-incidents** | 未计划的服务影响事件。事件通过API/Web表单自动发布，包含严重程度和受影响的设备/链路。讨论和故障排除在线程中进行。 |
| **#dz-contributor-maintenance** | 计划维护活动（升级、维修）。通过API/Web表单安排，包含计划开始/结束时间。讨论在线程中进行。 |
| **#dz-contributor-ops** | 所有贡献者的开放讨论——运营问题、CLI帮助、分享运行手册和操作手册。 |

您还将获得一个用于您组织直接支持的**私有DZ/Malbec Labs频道**。

---

## DZ前缀规则

!!! warning "重要：DZ前缀池使用"
    您提供的DZ前缀池由**DoubleZero协议管理，用于IP分配**。

    **DZ前缀的使用方式：**

    - **第一个IP**：为您的设备保留（分配给Loopback100接口）
    - **剩余IP**：分配给连接到您DZD的特定用户类型：
        - `IBRLWithAllocatedIP`用户
        - `EdgeFiltering`用户
        - 多播发布者
    - **IBRL用户**：不消耗此池（他们使用自己的公共IP）

    **您不能将这些地址用于：**

    - 您自己的网络设备
    - DIA接口上的点对点链路
    - 管理接口
    - DZ协议之外的任何基础设施

    **要求：**

    - 必须是**全球可路由（公共）**的IPv4地址
    - 智能合约拒绝私有IP范围（10.x、172.16-31.x、192.168.x）
    - **最小大小：/29**（8个地址），首选更大的前缀（如/28、/27）
    - 整个地址块必须可用——不要预先分配任何地址

    如果您需要用于自己设备的地址（DIA接口IP、管理地址等），请使用**单独的地址池**。

---

## 快速参考：关键术语

初次使用DoubleZero？以下是基本术语（参见[完整词汇表](glossary.md)）：

| 术语 | 定义 |
|------|------------|
| **DZD** | DoubleZero设备——运行DZ代理的物理Arista交换机 |
| **DZX** | DoubleZero交换点——贡献者对等的城域互连点 |
| **CYOA** | 自选冒险——用户连接方法（GREOverDIA、GREOverFabric等） |
| **DIA** | 直接互联网访问——所有DZD用于控制器和遥测的互联网连接，通常用作边缘/混合设备上用户连接的CYOA类型 |
| **WAN链路** | 您自己的DZD之间的链路（同一贡献者） |
| **DZX链路** | 到另一贡献者DZD的链路（需要相互接受） |
| **配置代理** | 轮询控制器，将配置应用到您的DZD |
| **遥测代理** | 收集TWAMP延迟/丢包指标，提交到链上账本 |
| **服务密钥** | 您的贡献者身份密钥，用于CLI操作 |
| **指标发布者密钥** | 用于签署链上遥测提交的密钥 |

---

---

## 文档结构

| 指南 | 描述 |
|-------|-------------|
| [需求与架构](contribute.md) | 硬件规格、网络架构、带宽选项 |
| [设备配置](contribute-provisioning.md) | 分步操作：密钥→仓库访问→设备→链路→代理 |
| [运营](contribute-operations.md) | 代理升级、链路管理、监控 |
| [词汇表](glossary.md) | 所有DoubleZero术语定义 |

---

## 非网络工程师的网络基础知识

如果您不是网络工程师背景，以下是本文档中使用的概念入门：

### IP寻址

- **IPv4地址**：网络上设备的唯一标识符（如`192.168.1.1`）
- **CIDR表示法**（`/29`、`/24`）：指示子网大小。`/29` = 8个地址，`/24` = 256个地址
- **公共IP**：在互联网上可路由；**私有IP**：仅限内部网络（10.x、172.16-31.x、192.168.x）

### 网络层

- **第1层（物理层）**：电缆、光纤、波长
- **第2层（数据链路层）**：交换机、VLAN、MAC地址
- **第3层（网络层）**：路由器、IP地址、路由协议

### 常用术语

- **MTU**：最大传输单元——最大数据包大小（WAN链路通常为9000字节）
- **VLAN**：虚拟局域网——在共享基础设施上逻辑分隔流量
- **VRF**：虚拟路由和转发——在同一设备上隔离路由表
- **BGP**：边界网关协议——网络间路由交换
- **GRE**：通用路由封装——覆盖网络的隧道协议
- **TWAMP**：双向主动测量协议——测量设备之间的延迟/丢包

### DoubleZero特定

- **链上**：在DoubleZero中，设备注册、链路配置和遥测记录在DoubleZero账本上——使所有参与者都能透明和可验证地了解网络状态
- **控制器**：从DoubleZero账本上的链上状态派生DZD配置的服务

---

准备好开始了吗？从[需求与架构](contribute.md)开始。
