---
description: 设置边缘订阅者以接收 DoubleZero 分片数据流，包括客户端设置以及 GRE、BGP、PIM 和分片流量的防火墙规则。
---

# 边缘订阅者连接
!!! warning "连接到 DoubleZero 即表示我同意 [DoubleZero 使用条款](https://doublezero.xyz/terms-protocol)。请注意，数据仅供您内部使用，不得转发（见第 2(e) 条）。"

## 步骤 1：DoubleZero 设置

### 1. 完成设置

安装 [Solana CLI](https://docs.anza.xyz/cli/install)。

按照 [设置](setup.md) 说明安装和配置 DoubleZero 客户端。

如果您之前已设置过 DoubleZero，请确保您拥有最新的 Doublezero-Solana CLI，运行 `sudo apt update && sudo apt install doublezero-solana`

### 2. 配置防火墙

允许 GRE、BGP、PIM 和分片流量。

**iptables:**

```bash
sudo iptables -A OUTPUT -p gre -j ACCEPT
sudo iptables -A INPUT -i doublezero1 -s 169.254.0.0/16 -d 169.254.0.0/16 -p tcp --dport 179 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero1 -s 169.254.0.0/16 -d 169.254.0.0/16 -p tcp --dport 179 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero1 -p pim -j ACCEPT
sudo iptables -A INPUT -i doublezero1 -p udp --dport 7733 -j ACCEPT
sudo iptables -A INPUT -i doublezero0 -p udp --dport 44880 -j ACCEPT
```

**UFW:**

```bash
sudo ufw allow proto gre from any to any
sudo ufw allow in on doublezero1 from 169.254.0.0/16 to 169.254.0.0/16 port 179 proto tcp
sudo ufw allow out on doublezero1 from 169.254.0.0/16 to 169.254.0.0/16 port 179 proto tcp
sudo ufw allow out on doublezero1 proto pim from any to any
sudo ufw allow in on doublezero1 to any port 7733 proto udp
sudo ufw allow in on doublezero0 to any port 44880 proto udp
```

### 3. 启用协调器

协调器监控链上状态，并在您的席位被分配时自动配置隧道。默认情况下未启用。

```bash
doublezero enable
```

---

## 步骤 2：设置钱包

### 1. 创建 Solana 密钥对

`doublezero-solana` CLI 使用标准 Solana 密钥对进行链上席位管理。如果您还没有：

```bash
solana-keygen new
```

这会写入 `~/.config/solana/id.json`。如需使用不同路径，请在任何 `doublezero-solana` 命令中传递 `--keypair <path>`。

打印您的钱包地址：

```bash
solana address
```

### 2. 为钱包充值

您的钱包需要两种代币：

- **SOL** — 用于 Solana 交易费用。将 SOL 转账到上面打印的钱包地址。
- **2Z** — 用于席位资金。CLI 从您钱包的关联代币账户（ATA）中提取，对应主网 USDC 铸币地址（`xfrsfrvsrf`）。

---

## 步骤 3：购买席位

### 1. 查找最近的设备

在购买席位之前，找到从您的机器延迟最低的设备：

```bash
doublezero latency
```

记下延迟最低结果中的设备代码（例如 `<Device_Name>`）。购买席位时将使用此代码。

### 2. 查看定价

在投入资金之前查看当前设备定价。定价由两部分组成：**基础城域价格**和**每设备溢价**。您也可以在[此处](https://data.doublezero.xyz/dz/shreds/devices)查看定价和可用性。

**所有设备：**

```bash
doublezero-solana shreds price
```

**特定设备：**

```bash
doublezero-solana shreds price --device-code <Device_Name>
doublezero-solana shreds price --device <PUBKEY>
```

**某个城域的所有设备：**

```bash
doublezero-solana shreds price --metro <PUBKEY>
```

输出列：`Device Code`、`Metro Code`、`Metro Name`、`Status`、`Settled Seats`、`Available Seats`、`Base Price (USDC)`、`Premium (USDC)`、`Epoch Price (USDC)`。

纪元价格是该设备上每个席位每纪元的总费用（基础 + 溢价）。使用 `--wide` 显示完整公钥，或使用 `--json` 输出 JSON 格式。

### 3. 购买席位

通过单个命令购买席位。此操作会初始化您的席位、为托管账户注资并请求分配：

```bash
doublezero-solana shreds pay \
  --device-code <Device_Name> \
  --client-ip <Target_IP> \
  --amount <Cost_Of_Seat>
```

**参数：**

| 标志 | 描述 |
|------|-------------|
| `--device <PUBKEY>` | 通过公钥指定目标设备（与 `--device-code` 互斥） |
| `--device-code <CODE>` | 通过可读代码指定目标设备（例如 `<Device_Name>`） |
| `--client-ip <IP>` | 您机器的公共 IPv4 地址 |
| `--amount <USDC>` | 注资 USDC 金额（十进制格式，例如 `100` = 100 USDC）。必须满足最低纪元价格。 |
| `--source-token-account <PUBKEY>` | 自定义 USDC 来源账户（默认为您钱包的 ATA） |
| `--accept-partial-epoch` | 跳过纪元剩余时间警告（见下文） |
| `--fee-payer <PATH>` | 使用不同的钱包支付 SOL 交易费用 |
| `--dry-run` | 模拟交易但不实际执行 |
| `--with-compute-unit-price <PRICE>` | 设置计算单元价格，在拥堵时加速交易打包 |

席位分配后，守护进程会自动建立 GRE 隧道。使用以下命令检查连接：

```bash
doublezero status
```

### 纪元时间

席位按 Solana 纪元（约 2 天）分配。如果您付款时当前纪元剩余不足 10%，CLI 会警告您的席位将立即分配，但仅覆盖当前纪元的剩余部分。下一纪元开始时，将从您的托管账户中扣除单独的费用。

!!! info "建议一次性为多个纪元充值，以免失去席位。您可以在[此处](https://explorer.solana.com/)查看当前纪元剩余时间。"

您可以使用 `--accept-partial-epoch` 跳过此警告。

### 保持托管账户充值

!!! warning "如果您的托管账户余额在结算时低于纪元价格，您的席位将不会被分配，隧道将被拆除，您将失去累积的任期。任期决定您在未来纪元中的优先级——失去它意味着您将作为新用户重新竞争。"

您可以超额注资此账户以支付多个纪元的费用。每次结算从您的托管账户中扣除一个纪元的价格，剩余余额结转。例如，注资 5 倍纪元价格可以让您的席位在最多 5 个纪元内保持活跃，无需重新充值。

要补充托管账户余额，可随时再次运行 `shreds pay`：

```bash
doublezero-solana shreds pay \
  --device-code <Device_Name> \
  --client-ip <Target_IP> \
  --amount 500
```

请注意，`Target_IP` 必须是接收分片数据的机器上的公共 IPv4 地址。您可以在目标机器上运行类似 `curl -4 ifconfig.me` 的命令来获取。

### 监控席位

本节介绍如何通过 CLI 查看席位。您也可以使用 [https://data.malbeclabs.com/api/v1/docs](https://data.doublezero.xyz/api/v1/docs) 来监控席位并协助管理您的托管账户。

查看您的活跃席位和托管账户余额：

**您的所有席位：**

```bash
doublezero-solana shreds list
```

**按设备筛选：**

```bash
doublezero-solana shreds list --device-code <Device_Name>
```

**按客户端 IP 筛选：**

```bash
doublezero-solana shreds list --client-ip <Target_IP>
```

**按钱包筛选：**

```bash
doublezero-solana shreds list --withdraw-authority <PUBKEY>
```

输出列：`Device Code`、`Client IP`、`Tenure`、`Balance (USDC)`、`Est. Epochs Paid`。

"Est. Epochs Paid" 列显示按当前定价，您的余额可覆盖多少个纪元。如果价格变动，此估算会相应调整。

### 撤回席位和托管账户

此命令释放您的席位并关闭托管账户。您将收到当前纪元未使用部分的按比例退款，以及剩余的托管账户余额，退还至您的钱包。您将失去席位和所有累积的任期。

```bash
doublezero-solana shreds withdraw \
  --device-code <Device_Name> \
  --client-ip <Target_IP>
```

您可以通过 `--device <PUBKEY>` 或 `--device-code <CODE>` 来标识设备，与其他命令相同。

要将 USDC 退款发送到不同的代币账户：

```bash
doublezero-solana shreds withdraw \
  --device-code <Device_Name> \
  --client-ip <Target_IP> \
  --refund-token-account <PUBKEY>
```

!!! warning "此操作不可撤销。撤回后，您的席位将消失且任期将重置。"

---

## 分片地址（IP 与端口）

领导者分片和高质押权重的转发分片将通过 `doublezero1` 接口的端口 `7733` 到达。`doublezero0` 接口用于单播流量。端口 `5765` 是来自分片发布者的心跳监控——不会包含分片数据。

对于分片消费，**IP 地址**标识组播流，**端口**标识该流上的 UDP 服务。
以下所有分片流在 `doublezero1` 上使用 UDP 端口 `7733`。

您可以使用以下命令查看任何组播组的 IP：

```bash
doublezero multicast group list
```

### 领导者分片

- `edge-solana-shreds`: `233.84.178.1:7733`

### 根分片

- `edge-solana-root`: `233.84.178.16:7733`

### 转发分片

- `edge-solana-retrans-eu`: `233.84.178.12:7733`
- `edge-solana-retrans-apac`: `233.84.178.13:7733`
- `edge-solana-retrans-amer`: `233.84.178.14:7733`


## GRE 隧道头 — XDP

!!! note "通过网络传递的分片流量经过 GRE 封装。您可能需要在将数据送入现有处理管道（例如基于 XDP 的反分片器）之前剥离 GRE 头。"

---

## 工具和仪表板

### [边缘记分板](https://data.malbeclabs.com/dz/shreds/scoreboard)

记分板使用槽级数据对 DoubleZero Edge 和其他提供商的分片交付速度进行基准测试，实时比较性能。使用此仪表板查看 Edge 分片相对于其他提供商的胜率。您可以查看仅限领导者分片的结果，也可以查看完整数据流的比较。您还可以按区域深入查看预期性能。

### [边缘发布者](https://data.malbeclabs.com/dz/shreds/publishers)

仪表板左上角的"Publishing Shreds"指标显示了在 DoubleZero Edge 上发布领导者分片的所有 Solana 验证者的总质押权重百分比。您可以查看网络上每个发布者的详细信息。

### [边缘订阅者、设备和活动](https://data.malbeclabs.com/dz/shreds/subscribers)

您可以在此页面轻松搜索您的客户端 IP 以查看已订阅的席位和状态。点击特定席位订阅可查看支付历史和活动记录。您还可以在[设备](https://data.doublezero.xyz/dz/shreds/devices)页面查看可用设备，在[活动](https://data.malbeclabs.com/dz/shreds/activity)页面查看所有最近的活动。

### 数据 API 文档

如需以编程方式访问数据端点，请参阅 API 文档：[https://data.malbeclabs.com/api/v1/docs](https://data.doublezero.xyz/api/v1/docs)。

---

## 故障排除

如果您遇到此处未涵盖的问题，请在尝试自行解决之前通过您现有的沟通渠道联系我们。如果您没有沟通渠道，请搜索 [Discord](https://discord.gg/U2fEb4Jq)，如有需要请开启工单。

### 确保您的客户端是最新版本：

运行：`sudo apt update && sudo apt install doublezero-solana`

### 托管账户余额不足

如果您的托管账户余额在结算时低于纪元价格，席位将不会被分配，隧道将被拆除，任期将丢失。请在下次结算前使用 `shreds pay` 补充余额。

### 付款后席位未被分配

- 您可能在纪元后期付款——席位将在下一纪元生效。
- 该设备上的所有席位可能已被任期更长的在位者占据。使用 `shreds price` 检查可用席位。
- 如果您在结算前撤回，则席位不符合分配条件。

### 隧道未建立

1. 验证守护进程是否正在运行：`sudo systemctl status doublezerod`
2. 验证协调器是否已启用：`doublezero enable`
3. 验证防火墙规则是否已设置（GRE、BGP、PIM、`doublezero1` 上的分片流量、`doublezero0` 上的端口 44880）
4. 验证您的席位在当前纪元是否处于活跃状态：`doublezero-solana shreds list`
5. 检查您的连接状态：`doublezero status`

守护进程的客户端 IP 会从您主机的公共 IP 自动发现——请验证它与您在席位命令中使用的 `--client-ip` 是否一致。

### 纪元警告提示

当纪元剩余不足 10% 时，CLI 会发出警告。您的选择：

- 如果您希望立即获得席位，使用 `--accept-partial-epoch` 接受
- 等待下一个纪元以获得完整纪元的覆盖

### "金额低于当前价格"

`pay` 命令会根据最低纪元价格（城域基础价 + 设备溢价）验证您的金额。使用 `shreds price` 检查当前定价并增加您的金额。

### "组播用户已存在"

您已通过其他路径拥有活跃订阅。请先使用 `doublezero disconnect` 断开连接，然后重试 `shreds pay`。