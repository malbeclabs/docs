---
description: DoubleZero 网络架构中参与者和组件的概述。
---

# 架构

DoubleZero 网络由哪些不同的参与者和组件构成？

<figure markdown="span">
  ![Image title](images/figure8.png){ width="800" }
  <figcaption>图 1：网络架构组件</figcaption>
</figure>

## 贡献者

DoubleZero 网络由全球各城市中不断壮大的分布式网络基础设施提供商社区所贡献的连接和数据包处理资源组成。贡献者将光纤电缆链路和信息处理资源引入协议，以提供去中心化的网状网络。

### 网络带宽贡献者

网络贡献者必须在两点之间提供专用带宽，在每一端运行 DoubleZero 兼容设备（DZD），并在每一端提供互联网连接。网络贡献者还必须在每个 DZD 上运行 DoubleZero 软件，以提供组播、用户查找和边缘过滤等服务。

DoubleZero 网络的物理链路以光纤电缆的形式提供，通常称为波长服务。网络贡献者将两个或多个数据中心之间未充分利用的网络链路（自有或从基础设施提供商租赁）投入使用。这些链路的两端均由 DoubleZero 设备终结，这些设备是运行 DoubleZero Agent 软件实例的物理网络交换机柜。

#### DoubleZero 交换点（DZX / 交叉连接站点）

DoubleZero 交换点（DZX）是网状网络中的互联节点，不同贡献者的链路在此桥接在一起。DZX 位于全球网络交汇处的主要大都市区域。网络贡献者必须在地理位置最接近其链路端点的 DZX 处将其链路交叉连接到更广泛的 DoubleZero 网状网络中。

### 计算资源贡献者

与网络贡献者不同，资源贡献者是一组去中心化的网络参与者，负责执行维护 DoubleZero 网络技术完整性和持续功能所需的各种维护和监控职责。具体而言，他们（i）跟踪用户交易和支付；（ii）为网络贡献者计算费用；（iii）记录（i）和（ii）的结果；（iv）严格以非自由裁量的方式管理控制协议代币经济学的智能合约；（v）将证明中继到相应的区块链；以及（vi）发布关于链路质量和利用率的遥测数据，为所有网络贡献者提供透明的实时性能指标。

## 组件

### DoubleZero Daemon

DoubleZero Daemon 软件运行在需要通过 DoubleZero 网络进行通信的服务器上。该守护进程与主机的内核网络堆栈交互，以创建和管理隧道接口、路由表和路由。

### Activator

Activator 服务由 DoubleZero 社区中一个或多个计算资源贡献成员托管，负责监控需要 IP 地址分配和状态变更的合约事件，并代表网络管理这些变更。

### Controller

Controller 服务由 DoubleZero 社区中一个或多个计算资源贡献者托管，作为 DoubleZero Device Agent 的配置接口，根据智能合约事件呈现其当前配置。

### Agent

Agent 软件直接运行在 DoubleZero 设备上，并根据 Controller 服务解析的结果将配置变更应用到设备上。Agent 软件轮询 Controller 以获取配置变更，计算链上规范版本的设备状态与设备上活动配置之间的差异，并应用必要的变更以协调活动配置。

### Device

为 DoubleZero 网络提供路由和链路终结的物理设备机柜。DZD 运行 DoubleZero Agent 软件，并根据从 Controller 服务读取的数据进行配置。