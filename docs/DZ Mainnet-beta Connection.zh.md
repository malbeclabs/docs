---
description: 将 Solana 验证器（mainnet-beta 或 testnet）及最多三台备份机器以 IBRL 模式连接到 DoubleZero，包括身份证明和连接请求。
---

# IBRL 模式下的验证器连接

!!! warning "连接到 DoubleZero 即表示我同意 [DoubleZero 服务条款](https://doublezero.xyz/terms-protocol)"

??? warning "连接到 DoubleZero 测试网即表示我同意此处列出的评估协议条款（点击展开）"
    <span style="font-size:14px;">DoubleZero Testnet</span>
    评估协议

    通过访问或使用解决方案（定义如下），您同意自首次访问之日（"**生效日期**"）起，本评估协议（"**协议**"）规定了 DoubleZero Foundation（"**DZF**"）将在评估基础上向您（"**用户**"或"**您**"）提供解决方案访问权限的条款和条件。鉴于双方在此作出的相互承诺，您同意如下条款：

    <span style="font-size:14px;">1. 定义。</span>

    <span style="font-size:14px;">1.1 "**保密信息**"</span> 是指任何一方向另一方披露的、被标识为保密的或应被理解为保密的所有信息，包括但不限于解决方案、产品计划、商业计划、商业秘密、技术或任何其他专有信息。

    <span style="font-size:14px;">1.2 "**解决方案**" </span> 是指面向 web3 项目的 DoubleZero 高性能网络基础设施的测试网版本（"**Testnet**"）及相关的集成带宽的边缘过滤服务（"**信息服务**"）、DZ 软件（定义如下）、DZF 提供的与 DZ 软件相关的任何及所有材料（"**文档**"），以及 DZF 根据本协议向用户提供的其他材料。

    <span style="font-size:14px;">2. 访问权限。 </span>

    <span style="font-size:14px;">2.1 ^^解决方案访问权^^。</span> 在遵守本协议条款和条件的前提下，DZF 将通过互联网向用户提供解决方案的访问权限。用户的访问权限是非独占的、不可转让的、有限使用解决方案的权利，仅用于使用户能够评估信息服务。对于构成解决方案的任何软件（"**DZ 软件**"），DZF 特此授予用户在评估期间内的有限的、可撤销的许可，可以复制、下载、制作合理数量的副本、运行和部署（如适用）此类 DZ 软件，但仅限于文档所规定的方式。

    <span style="font-size:14px;">2.2 ^^限制^^。 </span>用户可以从生效日期起至 DZF 终止之日止（"**评估期**"）按照本协议使用解决方案。用户理解，在评估期之后使用解决方案的任何权利将受双方之间单独的商业协议的约束，包括费用支付。用户不得且不得允许任何第三方：(i) 基于解决方案或其任何部分修改或创建衍生作品；(ii) 除本协议明确允许外，复制解决方案；(iii) 再许可、分发、出售、出借、出租、租赁、转让或授予解决方案全部或任何部分的权利，或以服务局方式或其他方式向第三方提供解决方案的访问权限，但通过用户的平台或产品提供信息服务且非独立提供的除外；或 (iv) 以本协议规定以外的方式使用解决方案。

    <span style="font-size:14px;">2.3 ^^所有权^^。</span> DZF 保留对解决方案的所有权利、所有权和权益，包括知识产权。

    <span style="font-size:14px;">3 反馈。</span>
    DZF 可能会定期要求用户提供关于解决方案的使用、操作和功能方面的反馈（"反馈"），用户同意向 DZF 提供此类反馈。用户特此授予 DZF 非独占的、全球性的、永久的、不可撤销的、免版税的、全额付清的、可完全再许可和可转让的权利和许可，以将反馈纳入任何产品和服务中使用，制造、使用、销售、许诺销售、进口和以其他方式利用此类产品和服务，以及以其他方式不受限制地使用、复制、分发和利用反馈。

    <span style="font-size:14px;">4. 期限和终止。</span>

    <span style="font-size:14px;">4.1 ^^期限^^。</span> 本协议自生效日期起生效，并在评估期内持续完全有效。任何一方均可因便利原因，无论是否有理由，通过书面通知另一方（电子邮件即可）立即终止本协议。

    <span style="font-size:14px;">4.1 ^^终止的效果^^。</span> 因任何原因终止本协议后：(i) 根据本协议授予用户的权利将立即终止；(ii) 用户应立即停止使用解决方案，并应退还或销毁其控制下的所有文档和任何 DZ 软件；(iii) 各方应及时退还或销毁对方的所有保密信息和财产；以及 (iv) 第 2.2、2.3、3、4.2 和第 5 至第 8 条将继续有效。

    <span style="font-size:14px;">5. 保密性。</span>
    各方同意，仅为履行本协议项下的义务和行使本协议项下的权利而使用对方的保密信息，且不得披露或允许披露此类信息，除非本协议另有许可。但是，任何一方均可向其有知情需要的人员、律师和其他代表披露保密信息，前提是这些人员受到不低于本协议所规定的保密义务的约束；以及在法律要求时（在此情况下，接收方应事先通知披露方并给予其对此类披露提出异议的机会，并应在适用法律允许的范围内尽量减少此类披露）。本第 5 条的保密义务不适用于以下信息：(a) 非因接收方过错而已成为或成为公众所知或公开可用的信息；(b) 在披露方披露之前，接收方已正当知悉且不受限制的信息；(c) 由具有合法授权的另一人正当地、不受限制地向接收方披露的信息；或 (d) 接收方在未使用或参考披露方保密信息的情况下独立开发的信息。各方同意尽合理注意保护对方的保密信息免遭未经授权的使用和披露。在实际或可能违反本条或本协议所含许可的情况下，未违约方有权寻求即时禁令和其他衡平法救济，且不放弃其可获得的任何其他权利或救济。用户有责任将解决方案以及提供解决方案访问权限的任何密码、助记词或代码作为 DZF 的保密信息加以维护和保密。本协议中的任何内容不限制或限制 DZF 使用与解决方案的性能、可用性、使用情况、完整性和安全性有关的数据的权利或能力。如果任何一方违反或威胁违反本第 5 条的规定，双方同意未违约方将没有适当的法律救济，因此有权获得即时禁令和其他衡平法救济，无需保证金且无需证明实际金钱损失。

    <span style="font-size:14px;">6. 保证免责声明；责任限制。</span>

    <span style="font-size:14px;">6.1 ^^保证免责声明^^。</span> 解决方案按"现状"提供，不附带任何形式的保证。DZF 不对解决方案和文档作出任何明示、暗示、法定或其他形式的保证，包括其条件、是否符合任何陈述或描述，DZF 特此明确否认所有关于适销性、特定用途适用性、所有权和不侵权的暗示保证。

    <span style="font-size:14px;">6.2 ^^责任限制^^。</span>
    除违反第 2.1、2.2 和第 5 条外，在任何情况下，任何一方均不对另一方承担间接的、附带的、特殊的或其他后果性损害赔偿责任，包括但不限于利润损失或使用损失或数据丢失的损害赔偿，无论该等损害赔偿是由您或任何第三方所遭受的、因本协议引起的或与之相关的，无论是基于合同、侵权或其他诉讼，即使另一方已被告知可能发生此类损害。在任何情况下，DZF 因本协议引起的或与之相关的总责任不得超过一百美元（\$100），无论是基于合同、侵权或其他诉讼。**前述限制适用，即使本协议中任何有限救济的基本目的未能实现。** 双方同意前述限制构成本协议下的合理风险分配。

    <span style="font-size:14px;">7. 管辖法律。</span>
    本协议及由本协议引起的或与之相关的所有事项应受开曼群岛法律管辖、解释和解释。如因本协议产生争议、纠纷或索赔（"争议"），相关方应适当地向其他各方发出 30 天的争议通知（"争议通知"）。如争议在争议通知送达后 30 天届满时仍未解决，相关方可按本协议规定启动仲裁程序。如争议在争议通知送达后 30 天届满时仍然存在，争议应由开曼国际调解仲裁中心 (CI-MAC) 根据本协议签订日期有效的 CI-MAC 仲裁规则（"仲裁规则"）进行仲裁解决，该仲裁规则被视为以引用方式纳入本条款，并受仲裁法（经修订）管辖。仲裁地点为开曼群岛大开曼乔治城，并受开曼群岛法律管辖。仲裁语言为英语。仲裁应由按照仲裁规则指定的独任仲裁员裁决。仲裁员作出的任何裁决或决定应以书面形式作出，且对双方具有终局约束力，不得上诉，据此获得的任何裁决可在具有管辖权的任何法院登记或执行。基于因本协议引起的或与之相关的任何索赔的法律诉讼或衡平法诉讼不得在任何管辖区的任何法院提起。如需通过诉讼或仲裁来执行本协议的条款，胜诉方有权要求败诉方支付其律师费。各方放弃其可能享有的主张不方便法院原则的权利、主张不受此类仲裁或法院管辖的权利或在按照本协议提起的任何程序中反对审判地点的权利。</span>

    <span style="font-size:14px;">8. 一般条款。</span>
    未经 DZF 事先书面同意，用户不得转让或分配本协议。DZF 可以自由转让本协议。根据本协议要求发送的所有通知应通过电子邮件发送（发送至 DZF：legal@doublezero.xyz），并视为在发送次日收到（以确认传输为准）。如果本协议的任何条款被认定为无效或不可执行，本协议的其余条款将继续完全有效。任何一方对本协议任何违约或违反的放弃不构成对任何其他或后续违约或违反的放弃。任何一方均不对因天灾、地震、供应短缺、运输困难、劳资纠纷、暴乱、战争、火灾、流行病以及超出其控制范围的类似事件（无论是否可预见）造成的任何延迟或未能履行承担责任。本协议连同任何附件构成双方之间关于本文主题的完整协议，并取代所有先前或同期的协议或陈述，无论是书面的还是口头的。本协议不得被修改或修订，除非经各方正式授权代表书面签署。

选择与您的 Solana 集群匹配的 DoubleZero 网络：`mainnet-beta` 或 `testnet`。在[设置](setup.md)中安装匹配的软件包，并在以下所有命令中使用相同的网络。

!!! Note inline end
    IBRL 模式不需要重新启动验证器客户端，因为它使用您现有的公共 IP 地址。

Solana 验证器使用本页上的步骤以 IBRL 模式连接到 DoubleZero。

每个 Solana 验证器都有自己的**身份密钥对**；从中提取的公钥称为**节点 ID**。这是验证器在 Solana 网络上的唯一指纹。

确定 DoubleZeroID 和节点 ID 后，您将证明机器的所有权。这通过创建一条包含 DoubleZeroID 的消息并使用验证器的身份密钥签名来完成。生成的加密签名作为您控制该验证器的可验证证明。

最后，您将向 DoubleZero 提交**连接请求**。此请求传达的信息是：*"这是我的身份，这是所有权证明，这是我打算连接的方式。"* DoubleZero 验证此信息，接受证明，并在 DoubleZero 上为该验证器配置网络访问权限。

本指南允许 1 台主验证器进行注册，同时最多可注册 3 台备份/故障转移机器。

## 前提条件 {#prerequisites}

- 已安装 Solana CLI 并添加到 $PATH
- 对于验证器：有权访问 sol 用户下的验证器身份密钥对文件（例如 validator-keypair.json）
- 对于验证器：验证正在连接的 Solana 验证器的身份密钥上至少有 1 SOL
- 防火墙规则允许 DoubleZero 和 Solana RPC 所需的出站连接，包括
 GRE（ip proto 47）和 BGP（169.254.0.0/16 上的 tcp/179）

!!! info
    验证器 ID 将与 Solana gossip 进行检查以确定目标 IP。然后，目标 IP 和 DoubleZero ID 将在您的机器与目标 DoubleZero 设备之间建立 GRE 隧道时使用。

    注意：如果您在同一 IP 上同时拥有临时 ID 和主 ID，则注册机器时仅使用主 ID。这是因为临时 ID 不会出现在 gossip 中，因此无法用于验证目标机器的 IP。

## 1. 确认客户端网络 {#1-confirm-the-client-network}

请在继续之前按照[设置](setup.md)说明操作。为 **mainnet-beta** 或 **testnet** 安装软件包。它们使用不同的软件包仓库。

设置的最后一步是断开网络连接。这是为了确保您的机器上只有一条到 DoubleZero 的隧道处于打开状态，并且该隧道在正确的网络上。

确认客户端在您选择的网络上：

```bash
doublezero status
```

`Network` 列应显示 `mainnet-beta` 或 `testnet`，与您的 Solana 集群匹配。如果显示错误，或者您安装了错误的软件包，请使用[故障排除](troubleshooting.md#issue-wrong-doublezero-environment)中的复制粘贴切换方法。

大约 30 秒后，您将看到可用的 DoubleZero 设备：

```bash
doublezero latency
```

示例输出（mainnet-beta；testnet 看起来相同，但设备较少）：

```bash
 pubkey                                       | code          | ip              | min      | max      | avg      | reachable
 2hPMFJHh5BPX42ygBvuYYJfCv9q7g3rRR3ZRsUgtaqUi | dz-ny7-sw01   | 137.239.213.162 | 1.74ms   | 1.92ms   | 1.84ms   | true
 ETdwWpdQ7fXDHH5ea8feMmWxnZZvSKi4xDvuEGcpEvq3 | dz-ny5-sw01   | 137.239.213.170 | 1.88ms   | 4.39ms   | 2.72ms   | true
 8J691gPwzy9FzUZQ4SmC6jJcY7By8kZXfbJwRfQ8ns31 | nyc002-dz002  | 38.122.35.137   | 2.45ms   | 3.30ms   | 2.74ms   | true
 8gisbwJnNhMNEWz587cAJMtSSFuWeNFtiufPuBTVqF2Z | dz-ny7-sw02   | 142.215.184.122 | 1.88ms   | 5.13ms   | 3.02ms   | true
 uzyg9iYw2FEbtdTHaDb5HoeEWYAPRPQgvsgyd873qPS  | nyc001-dz002  | 4.42.212.122    | 3.17ms   | 3.63ms   | 3.33ms   | true
 FEML4XsDPN3WfmyFAXzE2xzyYqSB9kFCRrMik8JqN6kT | nyc001-dz001  | 38.104.167.29   | 2.33ms   | 5.46ms   | 3.39ms   | true
 9oKLaL6Hwno5TyAFutTbbkNrzxm1fw9fhzkiUHgsxgGx | dz-dc10-sw01  | 137.239.200.186 | 6.84ms   | 7.01ms   | 6.91ms   | true
 DESzDP8GkSTpQLkrUegLkt4S2ynGfZX5bTDzZf3sEE58 | was001-dz002  | 38.88.214.133   | 7.39ms   | 7.44ms   | 7.41ms   | true
 HHNCpqB7CwHVLxAiB1S86ko6gJRzLCtw78K1tc7ZpT5P | was001-dz001  | 66.198.11.74    | 7.67ms   | 7.85ms   | 7.76ms   | true
 9LFtjDzohKvCBzSquQD4YtL3HwuvkKBDE7KSzb8ztV2b | dz-mtl11-sw01 | 134.195.161.10  | 9.88ms   | 10.01ms  | 9.95ms   | true
 9M7FfYYyjM4wGinKPofZRNmQFcCjCKRbXscGBUiXvXnG | dz-tor1-sw01  | 209.42.165.10   | 14.52ms  | 14.53ms  | 14.52ms  | true
```

## 2. 开放端口 44880 {#2-open-port-44880}

用户需要开放端口 44880 以使用一些[路由功能](https://github.com/malbeclabs/doublezero/blob/main/rfcs/rfc7-client-route-liveness.md)。

要开放端口 44880，您可以更新 IP 表，例如：

```
sudo iptables -A INPUT -i doublezero0 -p udp --dport 44880 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero0 -p udp --dport 44880 -j ACCEPT
```


请注意 `-i doublezero0`、`-o doublezero0` 标志，它们将此规则限制为仅适用于 DoubleZero 接口

或者使用 UFW，例如：

```
sudo ufw allow in on doublezero0 to any port 44880 proto udp
sudo ufw allow out on doublezero0 to any port 44880 proto udp
```


请注意 `in on doublezero0`、`out on doublezero0` 标志，它们将此规则限制为仅适用于 DoubleZero 接口

## 3. 证明验证器所有权 {#3-attest-validator-ownership}

!!! note "网络标志"
    以下 Passport 命令使用 `-u mainnet-beta`。在测试网上，请改用 `-u testnet`（或 `-ut`）。

设置好 DoubleZero 环境后，现在是证明您的验证器所有权的时候了。

您在[设置](setup.md)主验证器时创建的 DoubleZero ID 必须在所有备份机器上使用。

您主机器上的 ID 可以通过 `doublezero address` 找到。相同的 ID 必须存在于集群中所有机器的 `~/.config/doublezero/id.json` 中。

为此，您首先需要验证运行命令的机器是您的**主验证器**：

```
doublezero-solana passport find-validator -u mainnet-beta
```

这将验证验证器已在 gossip 中注册并出现在出块计划中。

预期输出：

```
Connected to Solana: mainnet

DoubleZero ID: YourDoubleZeroAddress11111111111111111111111111111
Detected public IP: 11.11.11.111
Validator ID: ValidatorIdentity111111111111111111111111111
Gossip IP: 11.11.11.111
In Leader scheduler
✅ This validator can connect as a primary in DoubleZero 🖥️  💎. It is a leader scheduled validator.
```

!!! info
    无论是一台机器还是多台机器，都使用相同的工作流程。
    如果只注册一台机器，请在本页的所有命令中排除 "--backup-validator-ids" 或 "backup_ids=" 参数。

现在，在您打算运行**主验证器**的所有备份机器上执行以下命令：
```
doublezero-solana passport find-validator -u mainnet-beta
```

预期输出：

```
Connected to Solana: mainnet

DoubleZero ID: YourDoubleZeroAddress11111111111111111111111111111
Detected public IP: 22.22.22.222
Validator ID: ValidatorIdentity222222222222222222222222222
Gossip IP: 22.22.22.222
In Not in Leader scheduler
 ✅ This validator can only connect as a backup in DoubleZero 🖥️  🛟. It is not leader scheduled and cannot act as a primary validator.
```
此输出是预期的。备份节点在通行证创建时不能在出块计划中。

您现在需要在所有计划使用**主验证器**投票账户和身份的**备份机器**上运行此命令。


### 准备连接 {#prepare-the-connection}

在**主验证器**机器上运行以下命令。这是您拥有活跃质押的机器，该机器在出块计划中，并且您的主验证器 ID 在您运行命令的机器上的 solana gossip 中：

```
doublezero-solana passport prepare-validator-access -u mainnet-beta \
  --doublezero-address YourDoubleZeroAddress11111111111111111111111111111 \
  --primary-validator-id ValidatorIdentity111111111111111111111111111 \
  --backup-validator-ids ValidatorIdentity222222222222222222222222222,ValidatorIdentity33333333333333333333333333,ValidatorIdentity444444444444444444444444444>
```


示例输出：

```
DoubleZero Passport - Prepare Validator Access Request
Connected to Solana: mainnet-beta

Primary validator 🖥️  💎:
  ID: ValidatorIdentity111111111111111111111111111
  Gossip: ✅ OK 11.11.11.111)
  Leader scheduler: ✅ OK (Stake: 1,050,000.00 SOL)

Backup validator 🖥️ 🛡️:
  ID: ValidatorIdentity222222222222222222222222222
  Gossip: ✅ OK (22.22.22.222)
  Leader scheduler:  ✅ OK (not a leader scheduled validator)


Backup validator 🖥️ 🛡️:
  ID: ValidatorIdentity333333333333333333333333333
  Gossip: ✅ OK (33.33.33.333)
  Leader scheduler:  ✅ OK (not a leader scheduled validator)


  Backup validator 🖥️ 🛡️:
  ID: ValidatorIdentity444444444444444444444444444
  Gossip: ✅ OK (33.33.33.333)
  Leader scheduler:  ✅ OK (not a leader scheduled validator)

  To request access, sign the following message with your validator's identity key:

  solana sign-offchain-message \
     service_key=YourDoubleZeroAddress11111111111111111111111111111,backup_ids=ValidatorIdentity222222222222222222222222222,ValidatorIdentity33333333333333333333333333,ValidatorIdentity444444444444444444444444444 \
     -k <identity-keypair-file.json>

```
请注意此命令末尾的输出。它是下一步操作的结构。


## 4. 生成签名 {#4-generate-signature}

在上一步的最后，我们收到了 `solana sign-offchain-message` 的预格式化输出。

根据上述输出，我们将在**主验证器**机器上运行此命令。

```
  solana sign-offchain-message \
     service_key=YourDoubleZeroAddress11111111111111111111111111111,backup_ids=ValidatorIdentity222222222222222222222222222,ValidatorIdentity33333333333333333333333333,ValidatorIdentity444444444444444444444444444 \
     -k <identity-keypair-file.json>
```

**输出：**

```
  Signature111111rrNykTByK2DgJET3U6MdjSa7xgFivS9AHyhdSG6AbYTeczUNJSjYPwBGqpmNGkoWk9NvS3W7
```


## 5. 在 DoubleZero 中发起连接请求 {#5-initiate-a-connection-request-in-doublezero}

使用 `request-validator-access` 命令在 Solana 上为连接请求创建账户。DoubleZero Sentinel 代理会检测到新账户，验证其身份和签名，并在 DoubleZero 中创建访问通行证，以便服务器建立连接。


使用节点 ID、DoubleZeroID 和签名。

!!! note inline end
      在本示例中，我们使用 `-k /home/user/.config/solana/id.json` 来查找验证器身份。请根据您的本地部署使用相应的位置。

```
doublezero-solana passport request-validator-access -k <path to keypair> -u mainnet-beta \
--primary-validator-id ValidatorIdentity111111111111111111111111111 \
--backup-validator-ids ValidatorIdentity222222222222222222222222222,ValidatorIdentity33333333333333333333333333,ValidatorIdentity444444444444444444444444444 \
--signature Signature111111rrNykTByK2DgJET3U6MdjSa7xgFivS9AHyhdSG6AbYTeczUNJSjYPwBGqpmNGkoWk9NvS3W7 --doublezero-address YourDoubleZeroAddress11111111111111111111111111111
```

**输出：**

此输出可用于在 Solana 浏览器上查看交易。请确保将浏览器设置为与您的集群匹配的 mainnet-beta 或 testnet。此验证是可选的。

```bash
Request Solana validator access: Transaction22222222VaB8FMqM2wEBXyV5THpKRXWrPtDQxmTjHJHiAWteVYTsc7Gjz4hdXxvYoZXGeHkrEayp
```

如果成功，DoubleZero 将注册主验证器及其备份。您现在可以在访问通行证中注册的 IP 之间进行故障转移。当切换到以这种方式注册的备份节点时，DoubleZero 将自动维持连接。


## 6. 以 IBRL 模式连接 {#6-connect-in-ibrl-mode}

在服务器上，使用将连接到 DoubleZero 的用户，运行 `connect` 命令以建立与 DoubleZero 的连接。

```
doublezero connect ibrl
```

您应该会看到指示配置过程的输出，例如：

```
DoubleZero Service Provisioning
🔗  Start Provisioning User...
Public IP detected: 137.184.101.183 - If you want to use a different IP, you can specify it with `--client-ip x.x.x.x`
🔍  Provisioning User for IP: 137.184.101.183
    User account created
    Connected to device: nyc-dz001
    The user has been successfully activated
    Service provisioned with status: ok
✅  User Provisioned
```
请等待一分钟以完成 GRE 隧道的设置。在 GRE 隧道设置完成之前，您的状态输出可能返回 "down" 或 "Unknown"。

验证您的连接：

```bash
doublezero status
```

**输出：**
!!! note inline end
    检查此输出。注意 `Tunnel src` 和 `DoubleZero IP` 与您机器上的公共 IPv4 地址匹配。
    <!--`Tunnel dst` 是您连接的 DZ 设备的地址。-->

```bash
 Tunnel status | Last Session Update     | Tunnel Name | Tunnel src    | Tunnel dst     | Doublezero IP | User Type | Current Device | Lowest Latency Device | Metro     | Network
 up            | 2025-10-20 12:12:55 UTC | doublezero0 | 11.11.11.111 | 12.34.56.789 | 11.11.11.111 | IBRL      | ams-dz001      | ✅ ams-dz001          | Amsterdam | mainnet-beta
```

（当您在测试网上连接时，`Network` 显示 `testnet`。）

状态为 `up` 表示您已成功连接。

您可以通过运行以下命令查看 DoubleZero 上其他用户传播的路由：

```
ip route
```


```
default via 149.28.38.1 dev enp1s0 proto dhcp src 149.28.38.64 metric 100
5.39.216.186 via 169.254.0.68 dev doublezero0 proto bgp src 149.28.38.64
5.39.251.201 via 169.254.0.68 dev doublezero0 proto bgp src 149.28.38.64
5.39.251.202 via 169.254.0.68 dev doublezero0 proto bgp src 149.28.38.64
...
```


### 下一步：通过多播发布 Shreds {#up-next-publishing-shreds-via-multicast}

如果您已完成此设置并计划通过多播发布 shreds，请继续前往[下一页](Validator%20Multicast%20Connection.md)。