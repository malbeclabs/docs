# 站点退役指南（贡献者）

本指南介绍如何退役 DoubleZero 设备（DZD）或退出站点：如何在不影响已连接用户的情况下从网络中移除您的设备和链路，然后在链上删除它们。

整个流程分为三个阶段：在退役日前 31 天对设备设置上限，在通知窗口期间通知已连接的用户以便他们迁移，然后在退役当天排空并删除链路、接口和设备。

> ⚠️ **请先与 DoubleZero 协调：**
> 在退役设备或站点之前，务必与 DoubleZero 团队保持一致。在对设备设置上限或排空链路之前，请先商定日期和计划，以便协调用户迁移以及基金会侧所需的步骤。

---

## 概述

| 时间 | 操作 | 负责方 |
|------|------|--------|
| 31 天前 | 对设备设置上限，使新用户无法接入（`--max-users 0`） | 贡献者 |
| 14 天前 | 通知已连接用户迁移至其他设备 | DoubleZero 团队 |
| 通知窗口期 | 用户自行重新连接到其他 DZD | 用户 |
| 退役当天 | 排空并删除链路、接口和设备 | 贡献者 |

原则：

- **尽早停止新用户接入，逐步迁移现有用户。** 提前对设备设置上限意味着从该时刻起只会流失用户。现有用户继续正常工作，按照自己的节奏进行迁移。
- **在通知窗口期内保持所有服务正常运行。** 在退役当天之前不要排空链路或设备，以确保迁移中的用户保持正常服务。
- **拆除顺序由合约强制执行。** 链路或设备在活跃状态下无法删除，因此以下步骤先排空再删除。

> ⚠️ **时间紧迫的情况：**
> 如果距离退出不足 31 天，请立即开始。现在就对设备设置上限，并根据可用时间压缩各窗口期。步骤顺序不变。

---

## 阶段 1 — 对设备设置上限（31 天前）

对设备设置上限，使新用户无法接入：

```bash
doublezero device update --pubkey <DEVICE_PUBKEY> --max-users 0
```

现有用户不受影响，继续正常工作。对站点中每个待退役的设备重复此操作。链路和设备保持完全活跃，已连接用户继续享受正常服务。

---

## 阶段 2 — 通知窗口期（14 天前）

DoubleZero 团队通知已连接的用户，要求他们在退役日期之前重新连接到其他 DZD。请与团队协调由谁联系哪些用户。

此窗口期内不进行任何排空操作，用户继续享受正常服务。用户按照自己的节奏进行重新连接。使用以下命令监控用户数量：

```bash
doublezero device list
```

---

## 阶段 3 — 退役当天

按顺序执行以下步骤。每个步骤解锁下一个步骤。

> ⚠️ **在最终删除设备之前：**
> 在执行最后一步之前，请通知 DoubleZero Foundation。基金会会移除未及时迁移的用户（否则这些用户会阻止删除操作），并完成基金会侧所需的步骤。

### 1. 排空链路

先软排空，再硬排空。请参阅[链路排空](contribute-operations.md#link-draining)了解每种状态的作用。

```bash
doublezero link update --pubkey <LINK_PUBKEY> --status soft-drained
# 流量迁移完成后：
doublezero link update --pubkey <LINK_PUBKEY> --status hard-drained
```

对待移除设备上的每条链路重复此操作。

### 2. 删除链路

```bash
doublezero link delete --pubkey <LINK_PUBKEY>
```

这将释放链路之前使用的接口。

### 3. 删除接口

```bash
doublezero device interface delete <DEVICE_CODE> <INTERFACE_NAME>
```

对设备上的每个接口重复此操作。

### 4. 排空设备

```bash
doublezero device update --pubkey <DEVICE_PUBKEY> --status drained
```

排空操作会将设备从路由中移除并关闭所有剩余的用户会话。同时将设备从活跃状态移出，使其可以被删除。

### 5. 删除设备

```bash
doublezero device delete --pubkey <DEVICE_PUBKEY>
```

设备只有在不再处于活跃状态、没有链路引用它、且没有剩余接口的情况下才能被删除，前面的步骤已处理了这些前提条件。

---

## 取消或推迟

在开始删除之前，设置上限和排空操作都是可逆的：

```bash
doublezero device update --pubkey <DEVICE_PUBKEY> --max-users <ORIGINAL_VALUE>   # 恢复容量
doublezero link update --pubkey <LINK_PUBKEY> --status soft-drained             # 从硬排空恢复
doublezero link update --pubkey <LINK_PUBKEY> --status activated                # 恢复为活跃状态
doublezero device update --pubkey <DEVICE_PUBKEY> --status activated            # 取消设备排空
```

删除链路、接口或设备是永久性操作：它会关闭链上账户。请在确认退出后再开始删除。