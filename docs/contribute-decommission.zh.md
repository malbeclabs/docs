# 站点退役指南（面向贡献者）

本指南介绍如何退役 DoubleZero 设备 (DZD) 或退出站点：如何在不影响已连接用户的情况下从网络中移除您的设备和链路，然后在链上删除它们。

整个流程分为三个阶段：在退役日前 31 天对设备设置上限，在通知窗口期内通知已连接的用户以便其迁移，然后在退役当天排空并删除链路、接口和设备。

> ⚠️ **请先与 DoubleZero 协调：**
> 在退役设备或站点之前，务必与 DoubleZero 团队保持同步，并与我们确定退役日期和时间。我们需要在该时间段前后执行一些操作步骤，因此需要提前安排。在对设备设置上限或排空链路之前，请先就日期和计划达成一致。

> ⚠️ **DZX 交换机和链路：**
> 如果您要退役的设备是 DZX 交换机，或包含任何 DZX 链路，请尽早识别受影响的贡献者并通知他们，因为他们可能需要在您的退役日期之前迁移或重建其链路。同时，请在 [OPS 门户](contribute-ops-management.md) 中为退役日期创建维护事件。

---

## 概述

| 时间 | 操作 | 执行者 |
|------|------|--------|
| 31 天前 | 对设备设置上限，阻止新用户接入（`--max-users 0`） | 贡献者 |
| 14 天前 | 通知已连接用户迁移到其他设备 | DoubleZero 团队 |
| 通知窗口期 | 用户自行重新连接到其他 DZD | 用户 |
| 退役当天 | 排空并删除链路、接口和设备 | 贡献者 |

原则：

- **尽早阻止新用户，逐步迁移现有用户。** 提前对设备设置上限意味着从该时刻起不再接纳新用户。现有用户继续正常使用，按自己的时间安排进行迁移。
- **在通知窗口期内保持一切在线。** 在退役当天之前不要排空链路或设备，以便迁移中的用户继续获得正常服务。
- **拆除顺序由合约强制执行。** 在链路或设备处于活跃状态时无法删除，因此以下步骤先排空后删除。

> ⚠️ **紧急情况：**
> 如果距离退出不足 31 天，请立即开始。现在就对设备设置上限，并压缩窗口期以适应可用时间。步骤顺序不变。

---

## 第一阶段 — 设备设置上限（31 天前）

对设备设置上限，阻止新用户接入：

```bash
doublezero device update --pubkey <DEVICE_PUBKEY> --max-users 0
```

现有用户不受影响，继续正常使用。对站点中每个需要退役的设备重复此操作。链路和设备保持完全活跃，已连接用户继续获得正常服务。

---

## 第二阶段 — 通知窗口期（14 天前）

DoubleZero 团队通知已连接用户，要求他们在退役日期之前重新连接到其他 DZD。与团队协调确定由谁联系哪些用户。

在此窗口期内不进行任何排空操作，用户继续获得正常服务。用户按自己的节奏自行重新连接。使用以下命令监控用户数量：

```bash
doublezero device list
```

---

## 第三阶段 — 退役当天

在开始之前，明确需要移除的内容：设备、连接到设备的链路，以及需要清理的接口。您可以通过以下命令查找所有相关信息：

```bash
doublezero device list | grep <CONTRIBUTOR_CODE>    # 查找您的设备：设备代码和公钥
doublezero link list | grep <DEVICE_CODE>           # 查找连接到该设备的链路
doublezero device interface list <DEVICE_CODE>      # 列出设备上需要移除的接口
```

按顺序执行以下步骤。每个步骤为下一步解锁前置条件。

> ⚠️ **最终删除设备之前：**
> 在执行最后一步之前，请通知 DoubleZero 基金会。基金会会移除未及时迁移的用户（否则这些用户会阻止删除操作），并完成基金会方面所需的步骤。

### 1. 排空链路

先进行软排空，然后硬排空。有关每种状态的作用，请参阅 [链路排空](contribute-operations.md#link-draining)。

```bash
doublezero link update --pubkey <LINK_PUBKEY> --status soft-drained
# 流量迁移完成后：
doublezero link update --pubkey <LINK_PUBKEY> --status hard-drained
```

对所有需要移除的设备上的每条链路重复此操作。

### 2. 删除链路

```bash
doublezero link delete --pubkey <LINK_PUBKEY>
```

这将释放链路所占用的接口。

### 3. 删除接口

```bash
doublezero device interface delete <DEVICE_CODE> <INTERFACE_NAME>
```

对设备上的每个接口重复此操作。

### 4. 排空设备

```bash
doublezero device update --pubkey <DEVICE_PUBKEY> --status drained
```

排空操作会将设备从路由中移除并关闭所有剩余的用户会话。它还会将设备从活跃状态转出，使其可以被删除。

### 5. 删除设备

```bash
doublezero device delete --pubkey <DEVICE_PUBKEY>
```

设备只有在不再处于活跃状态、没有链路引用、且没有剩余接口的情况下才能被删除，前面的步骤已处理这些前置条件。

---

## 取消或延期

在开始删除之前，设置上限和排空操作都是可逆的：

```bash
doublezero device update --pubkey <DEVICE_PUBKEY> --max-users <ORIGINAL_VALUE>   # 恢复容量
doublezero link update --pubkey <LINK_PUBKEY> --status soft-drained             # 从硬排空恢复
doublezero link update --pubkey <LINK_PUBKEY> --status activated                # 恢复为活跃状态
doublezero device update --pubkey <DEVICE_PUBKEY> --status activated            # 取消设备排空
```

删除链路、接口或设备是永久性操作：它会关闭链上账户。请在确认退出后再开始删除。