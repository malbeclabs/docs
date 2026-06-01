# 验证者奖励
!!! warning "连接到 DoubleZero 即表示我同意 [DoubleZero 使用条款](https://doublezero.xyz/terms-protocol)"

将领导者分片（leader shreds）发布到 DoubleZero Edge 的验证者每个纪元（epoch）可获得奖励。在支付奖励之前，每个验证者必须通过在 Solana 上配置一个 `ValidatorPublisherRewards` 账户来注册奖励的**接收地址**。该账户存储以下信息：

- **奖励代币类型（rewards mint）** — 奖励支付所使用的代币，默认为 2z（除非手动更改）
- **奖励所有者（rewards owner）** — 拥有接收奖励的关联代币账户（ATA）的钱包

`configure` 命令将设置这些字段，之后自动支付将按纪元逐期进行。您可以稍后重新运行 `configure` 来更改任一字段。

!!! info "如果您尚未完成 [安装设置](setup.md)、[验证者主网-Beta 连接](DZ%20Mainnet-beta%20Connection.md) 和 [验证者组播连接](Validator%20Multicast%20Connection.md)，请先完成这些步骤。"

## 前提条件

- 验证者正在发布领导者分片 - 参见 [验证者组播连接](Validator%20Multicast%20Connection.md)。
- 最新版本的 `doublezero-solana` CLI：`sudo apt update && sudo apt install doublezero-solana`，最低版本 `0.5.6`。
- 能够访问**验证者身份密钥对**，密钥对可以在同一台机器上，也可以离线保存并具备签名消息的能力。
- 一个目标钱包公钥，该钱包将拥有奖励 ATA。

---

## 1. 选择授权路径

配置奖励账户需要验证者身份密钥的授权。有两种方式可以提供授权：

| 路径 | 适用场景 |
|---|---|
| **直接路径（Direct）** | 验证者身份密钥对就在您运行命令的机器上。|
| **离线路径（Offchain）** | 验证者身份密钥对保存在离线环境或与手续费支付钱包不在同一台机器上。 |

---

## 2a. 直接路径

使用验证者身份密钥对作为 `-k` 参数运行 `configure`。

```bash
doublezero-solana shreds publisher-rewards configure \
    --node-id <ValidatorIdentity111111111111111111111111111> \
    --rewards-token-owner <Wallet567Identity111111111111111111111111111> \
    -k <path-to-validator-identity-keypair.json>
```
示例输出
```bash
Shred subscription - Configure Validator Publisher Rewards
Node ID:           ValidatorIdentity111111111111111111111111111
Rewards owner:     ValidatorIdentity111111111111111111111111111
Rewards mint:      J6pQQ3FAcJQeWPPGppWRb4nM8jU3wLyYbRrLh7feMfvd
Rewards ATA:       11111111111Pt3PatTj59dG5BhYuqPb9QJDUr1111111
Auth path:         direct
Configured validator publisher rewards: 41111111ntmoBTnvcKcP1g2a1111111HPoN3z5uf11111112jjzBJsr1B2JrTRff4dSGe1pdM1111111TMADi3Nz
```
`Configured validator publisher rewards: ` 输出的交易哈希可在区块浏览器中查看。

| 参数 | 描述 |
|---|---|
| `--node-id` | 验证者节点身份公钥。 |
| `--rewards-token-owner` | 将拥有接收 ATA 的钱包。 |
| `--rewards-token-mint` | 奖励将以 `2z` 代币接收的钱包代币类型。支持的代币还包括 `usdc` 和 `wsol`。 |
| `-k` | 验证者身份密钥对的路径。在直接路径中，密钥对的公钥必须与 `--node-id` 一致，否则命令将报错并提示您切换到离线路径。 |

如果 ATA 尚不存在，将在同一笔交易中自动初始化。

跳转到[步骤 3](#3-验证配置)。

---

## 2b. 离线路径

三个子步骤：准备、签名、配置。

### 2b.i. 准备离线消息

可以在任何地方运行此命令 — 这是只读操作，不需要验证者身份密钥对。它会打印需要签名的十六进制数据以及签名过期的绝对槽位（slot）。

```bash
doublezero-solana shreds publisher-rewards prepare-offchain-message \
    --node-id <ValidatorIdentity111111111111111111111111111> \
    --rewards-token-owner <Wallet567Identity111111111111111111111111111> \
    --valid-for 1h
```
示例输出

```bash
Hex message:    123457fc138f556a2578bdb079dc923342cc4e4a376683dc4c6cb923051e0be3
Deadline slot:  422954444

Sign with:
  solana sign-offchain-message 123457fc138f556a2578bdb079dc923342cc4e4a376683dc4c6cb923051e0be3 --keypair <validator-identity>

Then submit:
  doublezero-solana shreds publisher-rewards configure \
    --node-id ValidatorIdentity111111111111111111111111111 --rewards-token-mint J6pQQ3FAcJQeWPPGppWRb4nM8jU3wLyYbRrLh7feMfvd --rewards-token-owner Wallet567Identity111111111111111111111111111 \
    --deadline-slot 422954444 --signature <BASE58>
```


| 参数 | 描述 |
|---|---|
| `--node-id` | 验证者节点身份公钥。 |
| `--rewards-token-owner` | 将拥有接收 ATA 的钱包。 |
| `--rewards-token-mint` | 奖励将以 `2z` 代币接收的钱包代币类型。支持的代币还包括 `usdc` 和 `wsol`。 |
| `--valid-for` | 相对于当前槽位的签名有效期。接受 `<n>s`、`<n>m` 或 `<n>h`。默认值：`1h`。 |
| `--deadline-slot` | `--valid-for` 的替代选项：授权过期的绝对槽位。与 `--valid-for` 互斥。 |
| `--json` | 输出 JSON（`{ hex, deadline_slot }`）而非人类可读的摘要。 |

该命令会打印十六进制编码的授权消息、解析后的截止槽位，以及可直接运行的后续两个步骤的 shell 命令片段。

### 2b.ii. 签名消息

在持有验证者身份密钥对的机器上：

```bash
solana sign-offchain-message <123457fc138f556a2578bdb079dc923342cc4e4a376683dc4c6cb923051e0be3> \
--keypair <path-to-validator-identity-keypair.json>
```

此命令会打印一个 base58 编码的签名。

示例输出

```bash
SignatureTBUwGq511mPLMCEE4f5fNsmX1PQrozXBBJeCdSrcbhqSX1MwFp8NsNZbhCNMZ1kPWakjsLL9e3GUxxp
```

### 2b.iii. 提交 `configure`

回到持有手续费支付钱包的机器上：

```bash
doublezero-solana shreds publisher-rewards configure \
    --node-id <ValidatorIdentity111111111111111111111111111> \
    --rewards-token-owner <Wallet567Identity111111111111111111111111111> \
    --signature <SignatureTBUwGq511mPLMCEE4f5fNsmX1PQrozXBBJeCdSrcbhqSX1MwFp8NsNZbhCNMZ1kPWakjsLL9e3GUxxp> \
    --deadline-slot <DEADLINE_SLOT>
```

`--signature` 和 `--deadline-slot` 必须同时传递。其值必须与步骤 2b.i 和 2b.ii 中生成的值一致。

如果 ATA 尚不存在，将在同一笔交易中自动初始化。


示例输出

```bash
Shred subscription - Configure Validator Publisher Rewards
Node ID:           ValidatorIdentity111111111111111111111111111
Rewards owner:     ValidatorIdentity111111111111111111111111111
Rewards mint:      J6pQQ3FAcJQeWPPGppWRb4nM8jU3wLyYbRrLh7feMfvd
Rewards ATA:       11111111111Pt3PatTj59dG5BhYuqPb9QJDUr1111111
Auth path:         offchain
Configured validator publisher rewards: 41111111ntmoBTnvcKcP1g2a1111111HPoN3z5uf11111112jjzBJsr1B2JrTRff4dSGe1pdM1111111TMADi3Nz
```

---

## 3. 验证配置

```bash
doublezero-solana shreds publisher-rewards show --node-id <NODE_ID>
```

该命令会打印 `Node ID`、`Rewards owner`、`Rewards mint`、解析后的 ATA 地址以及 ATA 状态。**Resolved ATA** 是由奖励所有者 + 奖励代币类型推导出的确定性地址 — 每个纪元的奖励将存入该地址。

---

## 故障排除

### 直接路径：`-k` 公钥与 `--node-id` 不匹配

您传入的手续费支付密钥对不是验证者身份密钥对。请将验证者身份密钥对作为 `-k` 传入，或切换到[离线路径](#2b-离线路径)。

### 签名已过期

每个离线签名都有一个截止槽位。如果在 `prepare-offchain-message` 和 `configure` 之间间隔时间过长，请重新运行 `prepare-offchain-message`，重新签名并重新提交。默认有效期为 1 小时 — 如果您的离线签名流程需要更多时间，可以使用 `--valid-for 4h` 或类似参数来延长有效期。