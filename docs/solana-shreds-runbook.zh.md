---
description: 面向 LLM 的运行手册 — 购买 Edge shreds 席位并在 doublezero1 上接收 Solana shred 组播。通过 GitHub raw 提供给 MCP；不在文档站点上发布。
---

# 订阅 shreds (Edge) — 运行手册

本页面通过 GitHub raw 为 DoubleZero MCP (`get_onboarding_runbook`) 提供。不在文档站点上发布。

1. 连接 [DoubleZero MCP](mcp.md) (`https://data.doublezero.xyz/api/mcp`)。
2. 告知它将**接收** shreds 的 Linux 主机（或 SSH）、用于 `doublezero-solana` 的钱包/密钥对，以及所需的 feed 类型（leader 或 retransmit）。
3. 按顺序完成以下步骤。人工指南：[Edge Subscriber Connection](Edge Subscriber Connection.md)。

**成功标志：** 当前 epoch 已分配席位，`doublezero status` 显示隧道已建立，`doublezero1` 端口 `7733` 上有 UDP shreds（leader 组 `233.84.178.1`）。

连接即表示用户同意 [DoubleZero 使用条款](https://doublezero.xyz/terms-protocol)。数据仅供内部使用，不得转发。

---

## 前提条件

| 需求 | 说明 |
|------|--------|
| Linux/amd64 主机 | 公网 IPv4，无 NAT。在 AWS 上：禁用 ENI source/dest 检查。 |
| Solana CLI + `doublezero-solana` | `sudo apt update && sudo apt install doublezero-solana` |
| 钱包 | `~/.config/solana/id.json`（或 `--keypair`）。需要 **SOL**（手续费）+ **USDC**（席位托管）。 |
| USDC 铸币地址 | `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v` |
| 防火墙 | GRE、BGP（`169.254.0.0/16` tcp/179）、PIM、`doublezero1` 上的 UDP `7733`、`doublezero0` 上的 UDP `44880`。 |

---

## 步骤

### 1. 安装客户端和软件包

按照 [设置](setup.md) 操作，然后：

```bash
sudo apt update && sudo apt install doublezero-solana
```

备份 `~/.config/doublezero/id.json`。

### 2. 防火墙

```bash
sudo iptables -A OUTPUT -p gre -j ACCEPT
sudo iptables -A INPUT -i doublezero1 -s 169.254.0.0/16 -d 169.254.0.0/16 -p tcp --dport 179 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero1 -s 169.254.0.0/16 -d 169.254.0.0/16 -p tcp --dport 179 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero1 -p pim -j ACCEPT
sudo iptables -A INPUT -i doublezero1 -p udp --dport 7733 -j ACCEPT
sudo iptables -A INPUT -i doublezero0 -p udp --dport 44880 -j ACCEPT
```

UFW 变体：参见人工指南。

### 3. 启用 reconciler

必须启用，以便席位自动配置隧道。

```bash
doublezero enable
```

### 4. 钱包

```bash
solana-keygen new    # 如需要 — 写入 ~/.config/solana/id.json；请备份
solana address
```

充值 SOL 和 USDC。

### 5. 选择设备和价格

```bash
doublezero latency
doublezero-solana shreds price
doublezero-solana shreds price --device-code <Device_Name>
```

记下最低延迟的 **device code** 和 epoch 价格（基础 + 溢价）。建议充值 **超过 1 个 epoch** 的金额。定价界面：[devices](https://data.doublezero.xyz/dz/shreds/devices)。

### 6. 购买席位（阻塞操作）

在接收主机上：

```bash
curl -4 -s ifconfig.me; echo
```

```bash
doublezero-solana shreds pay \
  --device-code <Device_Name> \
  --client-ip <Target_IP> \
  --amount <Cost_Of_Seat>
```

`--client-ip` 必须是将接收 shreds 的机器的公网 IPv4。`--amount` 为 USDC 十进制数（例如 `100`），且必须满足 epoch 价格。

如果当前 epoch 剩余不足 10%，CLI 会发出警告。`--accept-partial-epoch` 会立即获取剩余时间；否则请等待。结算时托管资金不足 → 席位丢失、隧道拆除、**任期中断**。

分配完成后，守护进程会启动 GRE 隧道。

```bash
doublezero status
doublezero-solana shreds list
```

### 7. 确认 shreds

Leader shreds：`doublezero1` 上的 `233.84.178.1:7733`。使用 `doublezero multicast group list` 发现组播组。

| Feed | 组 | 地址 |
|------|-------|---------|
| Leader | `edge-solana-shreds` | `233.84.178.1:7733` |
| Root | `edge-solana-root` | `233.84.178.16:7733` |
| Retransmit EU | `edge-solana-retrans-eu` | `233.84.178.12:7733` |
| Retransmit APAC | `edge-solana-retrans-apac` | `233.84.178.13:7733` |
| Retransmit AMER | `edge-solana-retrans-amer` | `233.84.178.14:7733` |

端口 `5765` 是发布者心跳 — 不是 shreds。流量经过 GRE 封装；某些管道（XDP deshredder）需要剥离 GRE。

```bash
sudo tcpdump -ni doublezero1 host 233.84.178.1 and udp port 7733
```

---

## 常见问题

1. **Reconciler 未开启。** 未执行 `doublezero enable` 时，付款不会启动隧道。
2. **`--client-ip` ≠ 守护进程 IP。** 自动发现必须与席位匹配。
3. **`Multicast user already exists`。** 先断开连接：`doublezero disconnect`，然后重试 `shreds pay`。
4. **金额低于当前价格。** 重新检查 `shreds price` 并增加 `--amount`。
5. **付款后席位未分配。** epoch 末期（下一 epoch 生效）、设备已满（需要更高任期）、或结算前已提取。
6. **保持托管资金充足。** 通过另一次 `shreds pay` 充值；不要让余额低于 epoch 价格。

---

## 另请参阅

- [Edge Subscriber Connection](Edge Subscriber Connection.md)
- [支持](support.md)
- 记分板 / 席位：[data.doublezero.xyz](https://data.doublezero.xyz/dz/shreds/scoreboard)