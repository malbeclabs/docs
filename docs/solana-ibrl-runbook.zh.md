---
description: 面向 LLM 的操作手册 — 以 IBRL 模式将 Solana Mainnet-Beta 验证者连接到 DoubleZero。通过 GitHub raw 提供给 MCP；不在文档站点上发布。
---

# 连接验证者（IBRL Mainnet）— 操作手册

本页面供 DoubleZero MCP（`get_onboarding_runbook`）通过 GitHub raw 使用。不在文档站点上发布。

1. 连接 [DoubleZero MCP](mcp.md)（`https://data.doublezero.xyz/api/mcp`）。
2. 告诉它这是一个 **Solana Mainnet-Beta 验证者**、Linux 主机（或 SSH），以及验证者身份密钥对的存放位置。
3. 按顺序执行以下步骤。更倾向于手动操作？请使用[人工指南](DZ Mainnet-beta Connection.md)。

**成功的标志：** `doublezero status` 显示隧道为 **up**，User Type 为 **IBRL**，Network 为 **mainnet-beta**。`Tunnel src` 和 `Doublezero IP` 与主机的公网 IPv4 匹配。

IBRL 不需要重启验证者客户端；它使用现有的公网 IP。

---

## 前提条件

| 需求 | 备注 |
|------|--------|
| Linux/amd64 主机 | 在**验证者主机上**安装 DoubleZero，不要在容器中安装。 |
| 公网 IPv4，无 NAT | Gossip IP 必须与此主机匹配。 |
| `$PATH` 中有 Solana CLI | 用于 `solana sign-offchain-message`。 |
| 验证者身份密钥对 | 运行命令的用户可读（通常在 `sol` 用户下）。 |
| 身份账户上 ≥1 SOL | Passport / 链上请求所需。 |
| GRE（IP 协议 47）+ BGP | BGP 在 `169.254.0.0/16` tcp/179 上。 |
| `doublezero-solana` | `sudo apt update && sudo apt install doublezero-solana`（或对应发行版的等效命令）。 |

验证者 ID 会通过 Solana gossip 进行检查以确定目标 IP。同一 IP 上的无效 ID 会被忽略；仅使用 gossip 中的主 ID。

---

## 步骤

### 1. 安装客户端

如果尚未安装 `doublezero`，请参照 [setup](setup.md)。Mainnet 软件包：

```bash
curl -1sLf https://dl.cloudsmith.io/public/malbeclabs/doublezero/setup.deb.sh | sudo -E bash
sudo apt-get install doublezero
```

Rocky / RHEL：使用 `setup.rpm.sh` 和 `sudo yum install doublezero`。

**验证：** `sudo systemctl status doublezerod` 状态为 active。备份 `~/.config/doublezero/id.json`。

### 2. 将守护进程指向 mainnet-beta

```bash
DESIRED_DOUBLEZERO_ENV=mainnet-beta \
	&& sudo mkdir -p /etc/systemd/system/doublezerod.service.d \
	&& echo -e "[Service]\nExecStart=\nExecStart=/usr/bin/doublezerod -sock-file /run/doublezerod/doublezerod.sock -env $DESIRED_DOUBLEZERO_ENV" | sudo tee /etc/systemd/system/doublezerod.service.d/override.conf > /dev/null \
	&& sudo systemctl daemon-reload \
	&& sudo systemctl restart doublezerod \
	&& doublezero config set --env $DESIRED_DOUBLEZERO_ENV  > /dev/null \
	&& echo "✅ doublezerod configured for environment $DESIRED_DOUBLEZERO_ENV"
```

等待约 30 秒，然后 `doublezero latency` 应列出 mainnet 设备。

### 3. 在 `doublezero0` 上开放 UDP 44880

```bash
sudo iptables -A INPUT -i doublezero0 -p udp --dport 44880 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero0 -p udp --dport 44880 -j ACCEPT
```

UFW：`sudo ufw allow in on doublezero0 to any port 44880 proto udp` 以及对应的 `out` 规则。同时按照 [setup](setup.md) 中的说明允许 GRE 和 BGP。

### 4. 确认 DoubleZero ID 和主验证者

setup 阶段在**主节点**上生成的 DoubleZero ID 必须存在于每个备用节点上（`~/.config/doublezero/id.json`）。

```bash
doublezero address
doublezero-solana passport find-validator -u mainnet-beta
```

预期主节点：在 gossip 中、在出块时间表中、"can connect as a primary"。在备用节点上运行相同的 `find-validator`；它们**不应该**在出块时间表中。

仅一台机器的情况：在后续命令中省略 `--backup-validator-ids` / `backup_ids=`。

### 5. 准备访问消息（主节点）

在主节点（有活跃质押，身份在 gossip 中）上：

```bash
doublezero-solana passport prepare-validator-access -u mainnet-beta \
  --doublezero-address <DOUBLEZERO_ADDRESS> \
  --primary-validator-id <NODE_ID> \
  --backup-validator-ids <ID2>,<ID3>,<ID4>
```

如果没有备用节点则省略 `--backup-validator-ids`（最多 3 个）。复制输出中的 `solana sign-offchain-message …` 行。

### 6. 使用验证者身份密钥签名

在主节点上运行输出的命令（身份密钥对，**不是**仅 DoubleZero 密钥）：

```bash
solana sign-offchain-message \
   service_key=<DOUBLEZERO_ADDRESS>,backup_ids=<ID2>,<ID3>,<ID4> \
   -k <identity-keypair-file.json>
```

**产出：** 一个签名字符串。将其带入下一步。

### 7. 请求验证者访问权限

```bash
doublezero-solana passport request-validator-access -k <path-to-keypair> -u mainnet-beta \
  --primary-validator-id <NODE_ID> \
  --backup-validator-ids <ID2>,<ID3>,<ID4> \
  --signature <SIGNATURE> \
  --doublezero-address <DOUBLEZERO_ADDRESS>
```

等待 Sentinel 验证并创建访问通行证。可选：代理可以使用 `pubkey`（`doublezero address`）和主机公网 IP 调用 **`check_edge_access`**，直到通行证出现。

### 8. 连接 IBRL

```bash
doublezero connect ibrl
```

等待约 1 分钟以建立 GRE。在此之前，状态可能显示为 `down` / `Unknown`。

```bash
doublezero status
```

**通过标志：** `up`，User Type 为 `IBRL`，Network 为 `mainnet-beta`，隧道通常为 `doublezero0`。

```bash
ip route
```

预期看到通过 `doublezero0` 学习到的 BGP 路由。

---

## 常见问题

1. **环境错误。** Testnet 软件包 / `DESIRED_DOUBLEZERO_ENV=testnet` 不会连接到 mainnet-beta。
2. **身份不在 gossip 中。** 同一 IP 上的无效 ID 无法注册该机器。
3. **备用节点必须共享主节点的 DoubleZero ID。** 复制 `id.json`；不要用 keygen 生成第二个身份。
4. **使用验证者身份密钥签名**，不是 DoubleZero 密钥。
5. **`connect ibrl` 后状态 down 约 1 分钟**是正常的，GRE 正在建立中。

---

## 另请参阅

- [验证者 Mainnet-Beta 连接](DZ Mainnet-beta Connection.md)
- [安装配置](setup.md)
- 下一步：[发布 shreds（Edge）](solana-shreds-publisher-runbook.md)