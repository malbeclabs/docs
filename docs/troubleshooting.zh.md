---
description: 诊断常见的 DoubleZero 连接问题，包括参考命令、预期输出以及获取进一步支持的途径。
---

# 故障排除

本指南将涵盖各种问题，并持续更新。如果您完成了本指南仍未解决问题，可以在 [DoubleZero Tech](https://discord.com/channels/1341597747932958802/1344323790464880701) Discord 中寻求进一步支持。


## 常用命令和输出

首先，检查以下命令的输出及其预期输出。这些将帮助您进行更详细的故障排除。
如果您提交工单，可能会被要求提供这些输出。

#### 1. 检查版本
命令：

`doublezero --version`

示例输出：
```
DoubleZero 0.6.3
```
[comment]: # (when repo is public add this link to check https://github.com/malbeclabs/doublezero)

#### 2. 检查 DoubleZero 地址
命令：

`doublezero address`

示例输出：
```
MTAwoHgKyTwwDGJo2dye6EWqyTn27JRwXxaDEaeMqe2
```
[comment]: # ()

#### 3. 验证您的 Access Pass

示例公钥：`MTAwoHgKyTwwDGJo2dye6EWqyTn27JRwXxaDEaeMqe2`，运行命令时请替换为您的公钥。

命令：

`doublezero access-pass list | grep MTAwoHgKyTwwDGJo2dye6EWqyTn27JRwXxaDEaeMqe2`

输出：[注意我们使用 `doublezero access-pass list | awk 'NR==1 || /MTAwoHgKyTwwDGJo2dye6EWqyTn27JRwXxaDEaeMqe2/'` 来在此输出中显示表头]
```
account                                      | accesspass_type                                                | ip              | user_payer                                   | last_access_epoch | remaining_epoch | connections | status       | owner

2XHCWm8Sef1GirhAhAJVA8WTXToPT6gFYP7fA9mWMShR | prepaid                                                        | 141.14.14.14   | MTAwoHgKyTwwDGJo2dye6EWqyTn27JRwXxaDEaeMqe2 | MAX               | MAX             | 0           | requested    | DZfHh2vjXFqt8zfNbT1afm8PGuCm3BrQKegC5THtKFdn 
```
[comment]: # ()
#### 4. 检查 DoubleZero 账本积分
命令：

`doublezero balance`

示例输出：
```
0.78 Credits
```
[comment]: # (add section linked later for 0 balance mainnet/testnet)

#### 5. 检查连接状态
命令：

`doublezero status`

示例输出：

```bash
 Tunnel status | Last Session Update     | Tunnel Name | Tunnel src    | Tunnel dst     | Doublezero IP | User Type | Current Device | Lowest Latency Device | Metro     | Network 
 up            | 2025-10-20 12:12:55 UTC | doublezero0 | 11.11.11.111 | 12.34.56.789 | 11.11.11.111 | IBRL      | ams-dz001      | ✅ ams-dz001          | Amsterdam | testnet
```
[comment]: # (in next iteration add "up" "unknown" and "down" explainers, which then link to a sectino below for troubleshooting undesired states.)


#### 6. 检查延迟
命令：

`doublezero latency`

示例输出：
```
 pubkey                                       | code         | ip             | min      | max      | avg      | reachable 
 6E1fuqbDBG5ejhYEGKHNkWG5mSTczjy4R77XCKEdUtpb | nyc-dz001    | 64.86.249.22   | 2.49ms   | 2.61ms   | 2.56ms   | true
 Cpt3doj17dCF6bEhvc7VeAuZbXLD88a1EboTyE8uj6ZL | lon-dz001    | 195.219.120.66 | 71.94ms  | 72.11ms  | 72.02ms  | true
 CT8mP6RUoRcAB67HjKV9am7SBTCpxaJEwfQrSjVLdZfD | lax-dz001    | 207.45.216.134 | 72.42ms  | 72.51ms  | 72.45ms  | true
 4Wr7PQr5kyqCNJo3RKa8675K7ZtQ6fBUeorcexgp49Zp | ams-dz001    | 195.219.138.50 | 76.50ms  | 76.71ms  | 76.60ms  | true
 29ghthsKeH2ZCUmN2sUvhJtpEXn2ZxqAuq4sZFBFZmEs | fra-dz001    | 195.219.220.58 | 83.00ms  | 83.14ms  | 83.08ms  | true
 hWffRFpLrsZoF5r9qJS6AL2D9TEmSvPUBEbDrLc111Y  | fra-dz-001-x | 195.12.227.250 | 84.81ms  | 84.89ms  | 84.85ms  | true
 8jyamHfu3rumSEJt9YhtYw3J4a7aKeiztdqux17irGSj | prg-dz-001-x | 195.12.228.250 | 104.81ms | 104.83ms | 104.82ms | true
 5tqXoiQtZmuL6CjhgAC6vA49JRUsgB9Gsqh4fNjEhftU | tyo-dz001    | 180.87.154.78  | 178.04ms | 178.23ms | 178.13ms | true
 D3ZjDiLzvrGi5NJGzmM7b3YZg6e2DrUcBCQznJr3KfC8 | sin-dz001    | 180.87.102.98  | 227.67ms | 227.85ms | 227.75ms | true
```
[comment]: # ()

# 故障排除示例
现在我们已经检查了基本输出以及健康部署中的预期结果，接下来我们可以查看一些常见的故障排除示例。

### 问题：❌ Error creating user

此问题通常与预期的公钥/IP 配对和用户尝试访问 DoubleZero 时使用的公钥/IP 配对不匹配有关。

**症状：**
- 使用 `doublezero connect ibrl` 连接时，用户遇到 `❌ Error creating user`


**解决方案：**
1. 检查

    `doublezero address`

    示例输出：
    ```
    MTAwoHgKyTwwDGJo2dye6EWqyTn27JRwXxaDEaeMqe2
    ```
2. 验证此地址已在允许列表中：

    `doublezero access-pass list | awk 'NR==1 || /MTAwoHgKyTwwDGJo2dye6EWqyTn27JRwXxaDEaeMqe2/'`

    示例输出：
    ```
    account                                      | accesspass_type                                                | ip              | user_payer                                   | last_access_epoch | remaining_epoch | connections | status       | owner

    FHyoPs7U23MuSTtepEyXUtSAEffEpFpJGoYvug8X2sWY | prepaid                                                        | 141.14.14.14   | MTAwoHgKyTwwDGJo2dye6EWqyTn27JRwXxaDEaeMqe2 | MAX               | MAX             | 0           | requested    | DZfHh2vjXFqt8zfNbT1afm8PGuCm3BrQKegC5THtKFdn 
    ```
     `doublezero address` 中的公钥必须与 user_payer 公钥匹配，并且您尝试连接时使用的 IP 地址必须与 Access-Pass 中的 ip 匹配。
    `doublezero address` 默认从 ~/.config/doublezero/ 中的 id.json 文件获取。请参阅[此处的步骤 6](<setup.md>)
    
3. 如果以上信息看起来正确但连接时仍出现错误，或者上述映射不正确，请在 [DoubleZero Tech](https://discord.com/channels/1341597747932958802/1344323790464880701) 联系支持团队

### 问题：❌ Error provisioning service: malformed stuff: cannot provision multiple tunnels at the same time
此错误表示设备已连接到 DoubleZero。

**症状：**
- 用户尝试连接到 DoubleZero
- 遇到 `❌ Error provisioning service: malformed stuff: cannot provision multiple tunnels at the same time`

**解决方案：**
1. 检查
    `doublezero status`

    输出：
    ```bash
    Tunnel status | Last Session Update     | Tunnel Name | Tunnel src    | Tunnel dst     | Doublezero IP | User Type | Current Device | Lowest Latency Device | Metro     | Network 
    up            | 2025-10-20 12:12:55 UTC | doublezero0 | 11.11.11.111 | 12.34.56.789 | 11.11.11.111 | IBRL      | ams-dz001      | ✅ ams-dz001          | Amsterdam | testnet
    ```
2. -`up`- 表示连接健康。
3. 出现此错误是因为使用特定 DoubleZero IP 的隧道已在此机器上处于活动状态。

    此错误通常在 DoubleZero 客户端升级后出现。DoubleZero 升级会自动重启 doublezerod 服务，如果您在服务重启前已连接，它将自动重新连接。


### 问题：DoubleZero 状态为 unknown 或 down
此问题通常与以下情况有关：服务器和 DoubleZero 设备之间的 GRE 隧道已成功建立，但防火墙阻止了 BGP 会话的建立。因此，您无法从网络接收路由，也无法通过 DoubleZero 发送流量。

**症状：**
- `doublezero connect ibrl` 执行成功。但是，`doublezero status` 返回 `down` 或 `unknown`
    ```
    doublezero connect ibrl                                                                                                                                                                                                                                                                                                                                  
    DoubleZero Service Provisioning
    🔗  Start Provisioning User...
    Public IP detected: 111.11.11.11 - If you want to use a different IP, you can specify it with `--client-ip x.x.x.x`
    🔍  Provisioning User for IP: 111.11.11.11
    User account created
    Connected to device: nyc-dz001
    The user has been successfully activated
    Service provisioned with status: ok
    ✅  User Provisioned
    ```

    ```bash
    Tunnel status | Last Session Update     | Tunnel Name | Tunnel src    | Tunnel dst     | Doublezero IP | User Type | Current Device | Lowest Latency Device | Metro     | Network 
    up            | 2025-10-20 12:12:55 UTC | doublezero0 | 11.11.11.111 | 12.34.56.789 | 11.11.11.111 | IBRL      | ams-dz001      | ✅ ams-dz001          | Amsterdam | testnet
    ```

**解决方案：**
1. 检查您的防火墙规则！

   DoubleZero 使用链路本地地址空间：169.254.0.0/16 作为您的机器和 DoubleZero 设备之间的 GRE 隧道接口。169.254.0.0/16 通常是"不可路由"的地址空间，因此良好的安全实践会建议您阻止与此地址空间的通信。您需要在防火墙中添加一条规则，允许源 169.254.0.0/16 与目标 169.254.0.0/16 在 tcp 端口 179 上通信。该规则需要放置在任何拒绝 169.254.0.0/16 流量的规则之上。

    在类似 ufw 的防火墙中，您可以运行 `sudo ufw status` 来查看防火墙规则

    示例输出，类似于 Solana 验证节点可能使用的配置。
    ```
    To                         Action      From
    --                         ------      ----
    22/tcp                     ALLOW       Anywhere
    8899/tcp                   ALLOW       Anywhere
    8000:10000/tcp             ALLOW       Anywhere
    8000:10000/udp             ALLOW       Anywhere
    11200:11300/udp            ALLOW       Anywhere
    11200:11300/tcp            ALLOW       Anywhere

    To                         Action      From
    --                         ------      ----
    10.0.0.0/8                 DENY OUT    Anywhere
    169.254.0.0/16             DENY OUT    Anywhere
    172.16.0.0/12              DENY OUT    Anywhere
    192.168.0.0/16             DENY OUT    Anywhere
    ```

    在上面的输出中，您可以看到除了指定端口外，所有发往 169.254.0.0/16 的流量都被拒绝。
    使用 `sudo ufw insert <N> allow proto tcp from 169.254.0.0/16 to 169.254.0.0/16 port 179` 将规则插入到第 <N> 个位置。即如果 N = 1，则将此规则插入为第一条规则。
    `sudo ufw status numbered` 将显示规则的编号顺序。
    
### 问题：最近的 DoubleZero 设备已更改

这不是一个错误，但可以进行优化。以下是可以不时运行或自动化执行的最佳实践。

**解决方案：**

1. 检查到最近设备的延迟
    - 运行 `doublezero latency`

        输出
        ```
         pubkey                                       | code          | ip              | min      | max      | avg      | reachable 
         2hPMFJHh5BPX42ygBvuYYJfCv9q7g3rRR3ZRsUgtaqUi | dz-ny7-sw01   | 137.239.213.162 | 1.80ms   | 1.90ms   | 1.84ms   | true      
         ETdwWpdQ7fXDHH5ea8feMmWxnZZvSKi4xDvuEGcpEvq3 | dz-ny5-sw01   | 137.239.213.170 | 1.83ms   | 2.10ms   | 1.92ms   | true      
         8gisbwJnNhMNEWz587cAJMtSSFuWeNFtiufPuBTVqF2Z | dz-ny7-sw02   | 142.215.184.122 | 1.87ms   | 2.66ms   | 2.15ms   | true      
         8J691gPwzy9FzUZQ4SmC6jJcY7By8kZXfbJwRfQ8ns31 | nyc002-dz002  | 38.122.35.137   | 2.33ms   | 2.39ms   | 2.37ms   | true      
         FEML4XsDPN3WfmyFAXzE2xzyYqSB9kFCRrMik8JqN6kT | nyc001-dz001  | 38.104.167.29   | 2.29ms   | 2.59ms   | 2.40ms   | true   
        ```
        注意上面延迟最低的设备是 `dz-ny7-sw01`

        我们想要连接到此设备。：

2. 确定您是否已连接到目标设备
    - 运行 `doublezero user list --env testnet | grep 111.11.11.11`，将 `111.11.11.11` 替换为您连接到 DoubleZero 的设备公共 IPv4 地址。您也可以使用您的验证节点 ID 或 doublezero ID。

        输出
        ```
        account                                      | user_type           | groups                        | device       | location    | cyoa_type  | client_ip       | dz_ip           | accesspass                                                      | tunnel_id | tunnel_net       | status    | owner                                        
        6QRU1ivJnKGHpom2BdzH9PiTRkJ5WhunPNLtfYcqVisW | IBRL                |                               | dz-ny7-sw01     | New York    | GREOverDIA | 111.11.11.11    | 111.11.11.11    | Prepaid: (MAX)                                                  | 514       | 111.254.1.111/31 | activated | DZfHh2vjXFqt8zfNbT1afm8PGuCm3BrQKegC5THtKFdn 
        ```
        在此示例中，我们已经连接到最近的设备。无需更多步骤，可以到此为止。


        让我们考虑如果输出是这样的情况
         ```
        account                                      | user_type           | groups                        | device       | location    | cyoa_type  | client_ip       | dz_ip           | accesspass                                                      | tunnel_id | tunnel_net       | status    | owner                                        
        6QRU1ivJnKGHpom2BdzH9PiTRkJ5WhunPNLtfYcqVisW | IBRL                |                               | fra-dz-001-x     | New York    | GREOverDIA | 111.11.11.11    | 111.11.11.11    | Prepaid: (MAX)                                                  | 514       | 111.254.1.111/31 | activated | DZfHh2vjXFqt8zfNbT1afm8PGuCm3BrQKegC5THtKFdn 
        ```
        这将是一个次优连接。让我们考虑是否需要重新连接。

        在连接之前，我们将检查该设备是否有可用的用户隧道。

3. 可选：检查网络中的可用设备

    出于教育目的，我们首先：
    - 运行 `doublezero device list` 获取完整的设备列表。我们提取了 2 个设备作为示例来解释输出。

        输出：
        ```
        account                                      | code          | contributor | location  | exchange | device_type | public_ip       | dz_prefixes                      | users | max_users | status    | mgmt_vrf | owner                                        
        GphgLkA7JDVtkDQZCiDrwrDvaUs8r8XczEae1KkV6CGQ | ams001-dz002  | jump_       | EQX-AM4   | ams      | switch      | 149.11.64.57    | 38.246.201.64/27                 | 69    | 128       | activated |          | H647kAwTcWsGXZUK3BTr1JyTBZmbNcYyCmRFFCEnXUVp 
        7FfrX8YbvbzM8A1ojNynP9BjiKpK9rrmhdEdchB2myhG | dz-fr5-sw01   | glxy        | EQX-FR5   | fra      | switch      | 89.222.118.225  | 89.222.118.228/30                | 0     | 0         | activated |          | 5YbNrJHJJoiRwVEvgAWRGdFRG9gRdZ47hLCKSym8bqbp 
        ```
        注意上面 `ams001-dz002` 有 69 个用户和 128 个最大用户数。此设备还可以添加 59 个用户。

        然而，`dz-fr5-sw01` 有 0 个用户和 0 个最大用户数。您将无法连接到此设备。最大用户数为 0，该设备不接受任何连接。

        现在让我们回到连接最近设备的操作。

4. 确定目标设备是否有可用连接
    - 运行 `doublezero device list | grep dz-ny7-sw01`，将 `dz-ny7-sw01` 替换为您的目标设备

        输出
        ```
        2hPMFJHh5BPX42ygBvuYYJfCv9q7g3rRR3ZRsUgtaqUi | dz-ny7-sw01   | glxy        | EQX-NY7   | nyc      | switch      | 137.239.213.162 | 137.239.216.164/31               | 29    | 128       | activated |          | 5YbNrJHJJoiRwVEvgAWRGdFRG9gRdZ47hLCKSym8bqbp 
        ```
        这里我们可以看到 `dz-ny7-sw01` 有可用的连接空间。

5. 连接到最近的 DoubleZero 设备

    我们将先断开连接，然后重新连接到 DoubleZero。

    首先运行
    - `doublezero disconnect`

      输出

        ```
        DoubleZero Service Provisioning
        🔍  Decommissioning User
        Public IP detected: 111.11.11.11 - If you want to use a different IP, you can specify it with `--client-ip x.x.x.x`
        \ [00:00:00] [##########>-----------------------------] 1/4 deleting user       account...                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     🔍  Deleting User Account for: 6QRU1ivJnKGHpom2BdzH9PiTRkJ5WhunPNLtfYcqVisW
        🔍  User Account deleted
        ✅  Deprovisioning Complete
        ```
    现在我们检查状态以确认断开连接
    - `doublezero status`

    输出

    ```
    Tunnel status | Last Session Update | Tunnel Name | Tunnel src | Tunnel dst | Doublezero IP | User Type 
    disconnected  | no session data     |             |            |            |               |    
    ```
    最后我们重新连接
    - `doublezero connect ibrl`

    输出
    ```
    DoubleZero Service Provisioning
    🔗  Start Provisioning User...
    Public IP detected: 111.11.11.11 - If you want to use a different IP, you can specify it with `--client-ip x.x.x.x`
    🔍  Provisioning User for IP: 111.11.11.11
    User account created
    Connected to device: dz-ny7-sw01 
    Service provisioned with status: ok
    ✅  User Provisioned
    ```
    注意上面的输出中我们 `Connected to device: dz-ny7-sw01`，这是我们在步骤 1 中初始调查的预期结果，当时我们发现 `dz-ny7-sw01` 是延迟最低的设备。

### 问题：`doublezero status` 部分字段返回 N/A

此问题通常与当前守护进程和客户端与建立已连接 DZ 隧道时使用的守护进程和客户端版本不匹配有关。

**症状：**
- 运行 `doublezero status` 时，用户在某些字段中看到 `N/A`




**解决方案：**
1. 运行
`doublezero status`

    示例：

    ```
    Tunnel status | Last Session Update     | Tunnel Name | Tunnel src   | Tunnel dst   | Doublezero IP | User Type | Current Device | Lowest Latency Device | Metro | Network
    up            | 2025-10-20 20:06:18 UTC | doublezero0 | 149.28.38.64 | 64.86.249.22 | 149.28.38.64  | IBRL      | N/A            | ✅ dz-ny7-sw01        | N/A   | mainnet-beta
    ```

    注意在上面的示例输出中，`Tunnel status` 是 `up`。我们的 `Network` 是 `mainnet-beta`。然而，`Current Device` 和 `Metro` 是 `N/A`

    这表明您的机器上有一个不在当前环境中的已打开隧道。
    在这种情况下，`up` 状态以及在 `mainnet-beta` 上未找到 `Current Device` 的结果告诉我们，我们的隧道实际上在 testnet 上！
 
2. 切换您的环境。

    为了纠正不匹配问题，您需要将环境切换到与返回 `N/A` 的环境相反的环境

    ```bash
    DESIRED_DOUBLEZERO_ENV=testnet \
	    && sudo mkdir -p /etc/systemd/system/doublezerod.service.d \
	    && echo -e "[Service]\nExecStart=\nExecStart=/usr/bin/doublezerod -sock-file /run/doublezerod/doublezerod.sock -env $DESIRED_DOUBLEZERO_ENV" | sudo tee /etc/systemd/system/doublezerod.service.d/override.conf > /dev/null \
	    && sudo systemctl daemon-reload \
	    && sudo systemctl restart doublezerod \
	    && doublezero config set --env $DESIRED_DOUBLEZERO_ENV  > /dev/null \
	    && echo "✅ doublezerod configured for environment $DESIRED_DOUBLEZERO_ENV"
    ```

    要将 DoubleZero 客户端 CLI (`doublezero`) 和守护进程 (`doublezerod`) 配置为连接到 **DoubleZero mainnet-beta**：

    ```bash
    DESIRED_DOUBLEZERO_ENV=mainnet-beta \
	    && sudo mkdir -p /etc/systemd/system/doublezerod.service.d \
	    && echo -e "[Service]\nExecStart=\nExecStart=/usr/bin/doublezerod -sock-file /run/doublezerod/doublezerod.sock -env $DESIRED_DOUBLEZERO_ENV" | sudo tee /etc/systemd/system/doublezerod.service.d/override.conf > /dev/null \
	    && sudo systemctl daemon-reload \
	    && sudo systemctl restart doublezerod \
	    && doublezero config set --env $DESIRED_DOUBLEZERO_ENV  > /dev/null \
	    && echo "✅ doublezerod configured for environment $DESIRED_DOUBLEZERO_ENV"
    ```
    
3. 检查您的状态

    切换环境后运行：

    ```
    doublezero status
    ```

    预期输出应类似于：

    ``` 
    Tunnel status | Last Session Update     | Tunnel Name | Tunnel src   | Tunnel dst   | Doublezero IP | User Type | Current Device | Lowest Latency Device | Metro    | Network 
    up            | 2025-10-21 12:32:12 UTC | doublezero0 | 149.28.38.64 | 64.86.249.22 | 149.28.38.64  | IBRL      | nyc-dz001      | ✅ nyc-dz001          | New York | testnet 
    ```
所有字段都已填充，说明您现在处于正确的环境中。