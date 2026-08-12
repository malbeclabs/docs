---
description: 面向 LLM 的运行手册 — 配置已连接的 Solana 验证器，将 leader shreds 发布到 DoubleZero Edge。通过 GitHub raw 提供给 MCP；不在文档站点上发布。
---

# 发布 shreds (Edge) — 运行手册

本页面通过 GitHub raw 提供给 DoubleZero MCP (`get_onboarding_runbook`)。不在文档站点上发布。

1. 连接 [DoubleZero MCP](mcp.md) (`https://data.doublezero.xyz/api/mcp`)。
2. 确认验证器**已接入 DoubleZero IBRL**（mainnet-beta）。如果尚未接入，请先完成[连接验证器 (IBRL Mainnet)](solana-ibrl-runbook.md)。
3. 按照以下步骤操作。人工指南：[Validator Multicast Connection](Validator Multicast Connection.md)。

**成功的标志：** 验证器向 `233.84.178.1:7733` 发送 leader shreds，`edge-solana-shreds` 上的多播发布已启动，且 [publisher-check](https://data.doublezero.xyz/dz/publisher-check) 在至少一个 leader slot 之后显示正在发布。

此路径适用于**验证器**。希望*订阅*的交易公司请使用[订阅 shreds](solana-shreds-runbook.md)。

---

## 前提条件

| 需求 | 备注 |
|------|--------|
| IBRL 隧道已建立 | [IBRL Mainnet 运行手册](solana-ibrl-runbook.md) / [人工指南](DZ Mainnet-beta Connection.md)。 |
| 支持的客户端 | Jito-Agave **3.1.9+**、JitoBam 3.1.9+、Frankendancer 或 Harmonic **3.1.11+**。其他版本将无法发布。 |
| 重启窗口 | 添加 shred 目标地址需要重启验证器。 |

---

## 步骤

### 1. 将客户端指向 Edge shred 组

**Jito-Agave (v3.1.9+) 和 Harmonic (3.1.11+)** — 在验证器启动脚本中添加：

```text
--shred-receiver-address 233.84.178.1:7733
```

您可以同时向 Jito 和 `edge-solana-shreds` 发送。重启验证器。

**Frankendancer** — 在 `config.toml` 中：

```toml
[tiles.shred]
additional_shred_destinations_leader = [ "233.84.178.1:7733", ]
```

重启验证器。

### 2. 在多播组上发布

```bash
doublezero connect ibrl && doublezero connect multicast --publish edge-solana-shreds
```

**验证：** `doublezero status` 仍显示 IBRL/up，且用户是 `edge-solana-shreds` 的发布者。

实时组 IP：`doublezero multicast group list`。所有 shred feed 使用 UDP **`7733`**；IP 地址选择对应的 feed。

| Feed | 地址 |
|------|---------|
| `edge-solana-shreds`（leader） | `233.84.178.1:7733` |
| `edge-solana-retrans-eu` | `233.84.178.12:7733` |
| `edge-solana-retrans-apac` | `233.84.178.13:7733` |
| `edge-solana-retrans-amer` | `233.84.178.14:7733` |

### 3. 确认发布状态

打开 [publisher-check](https://data.doublezero.xyz/dz/publisher-check)。在验证器发布了**至少一个 slot** 的 leader shreds 之前，您不会看到确认信息。

健康状态：出站流量峰值与 leader slot 对齐（锯齿形）。稳定的出站流量且无 slot 模式则为 **retransmit**（异常）。

---

## 常见问题

1. **客户端版本错误。** 不是 3.1.9+ / 3.1.11+ → 线路上不会有有用的数据。
2. **retransmit 标志未移除。** 从 Jito-Agave 中移除 `--shred-retransmit-receiver-address`。在 publisher-check 上检查 **No Retransmit Shreds** 列（2-epoch 与 recent-slot 视图）。
3. **尚未成为 leader。** 在获得 leader slot 之前，仪表盘保持空白。
4. **IBRL 未启动。** 不要从这里开始；请先完成 IBRL 配置。

---

## 另请参阅

- [Validator Multicast Connection](Validator Multicast Connection.md)
- [Validator Rewards](Validator Rewards.md)