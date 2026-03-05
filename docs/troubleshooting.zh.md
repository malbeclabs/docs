# 故障排除

本指南将涵盖各种问题，并持续更新。如果您完成了本指南仍需进一步支持，可以在[DoubleZero Tech](https://discord.com/channels/1341597747932958802/1344323790464880701) Discord中寻求帮助。


## 常用命令和输出

首先检查以下命令的输出及其预期输出。这将帮助您进行更详细的故障排除。
如果您提交工单，可能会被要求提供这些输出。

#### 1. 检查版本
命令：

`doublezero --version`

示例输出：
```
DoubleZero 0.6.3
```

#### 2. 检查DoubleZero地址
命令：

`doublezero address`

示例输出：
```
MTAwoHgKyTwwDGJo2dye6EWqyTn27JRwXxaDEaeMqe2
```

#### 3. 验证您的访问通行证

示例公钥：`MTAwoHgKyTwwDGJo2dye6EWqyTn27JRwXxaDEaeMqe2` 运行命令时请替换为您的公钥。

命令：

`doublezero access-pass list | grep MTAwoHgKyTwwDGJo2dye6EWqyTn27JRwXxaDEaeMqe2`

输出：[注意我们使用`doublezero access-pass list | awk 'NR==1 || /MTAwoHgKyTwwDGJo2dye6EWqyTn27JRwXxaDEaeMqe2/'`在此输出中显示标题]
```
account                                      | accesspass_type                                                | ip              | user_payer                                   | last_access_epoch | remaining_epoch | connections | status       | owner

2XHCWm8Sef1GirhAhAJVA8WTXToPT6gFYP7fA9mWMShR | prepaid                                                        | 141.14.14.14   | MTAwoHgKyTwwDGJo2dye6EWqyTn27JRwXxaDEaeMqe2 | MAX               | MAX             | 0           | requested    | DZfHh2vjXFqt8zfNbT1afm8PGuCm3BrQKegC5THtKFdn
```

#### 4. 检查DoubleZero账本余额
命令：

`doublezero balance`

示例输出：
```
0.78 Credits
```

#### 5. 检查连接状态
命令：

`doublezero status`

示例输出：

```bash
 Tunnel status | Last Session Update     | Tunnel Name | Tunnel src    | Tunnel dst     | Doublezero IP | User Type | Current Device | Lowest Latency Device | Metro     | Network
 up            | 2025-10-20 12:12:55 UTC | doublezero0 | 11.11.11.111 | 12.34.56.789 | 11.11.11.111 | IBRL      | ams-dz001      | ✅ ams-dz001          | Amsterdam | testnet
```


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

# 故障排除示例
现在我们已检查了基本输出及健康部署中的预期内容，可以检查一些常见的故障排除示例。

### 问题：❌ 创建用户时出错

此问题通常与预期的公钥/IP配对与用户尝试访问DoubleZero的公钥/IP配对不匹配有关。

**症状：**
- 使用`doublezero connect ibrl`连接时，用户遇到`❌ Error creating user`


**解决方案：**
1. 检查

    `doublezero address`

    示例输出：
    ```
    MTAwoHgKyTwwDGJo2dye6EWqyTn27JRwXxaDEaeMqe2
    ```
2. 验证此地址已被列入白名单：

    `doublezero access-pass list | awk 'NR==1 || /MTAwoHgKyTwwDGJo2dye6EWqyTn27JRwXxaDEaeMqe2/'`

    示例输出：
    ```
    account                                      | accesspass_type                                                | ip              | user_payer                                   | last_access_epoch | remaining_epoch | connections | status       | owner

    FHyoPs7U23MuSTtepEyXUtSAEffEpFpJGoYvug8X2sWY | prepaid                                                        | 141.14.14.14   | MTAwoHgKyTwwDGJo2dye6EWqyTn27JRwXxaDEaeMqe2 | MAX               | MAX             | 0           | requested    | DZfHh2vjXFqt8zfNbT1afm8PGuCm3BrQKegC5THtKFdn
    ```
     `doublezero address`的公钥必须与user_payer公钥匹配，且您尝试连接的IP地址必须与访问通行证中的ip匹配。
    `doublezero address`来源于默认情况下`~/.config/doublezero/`中的id.json文件。请参阅[此处的步骤6](https://docs.malbeclabs.com/setup/)

3. 如果上述内容看起来正确但您在连接时遇到错误，或者如果上述映射不正确，请在[DoubleZero Tech](https://discord.com/channels/1341597747932958802/1344323790464880701)联系支持

### 问题：❌ 配置服务时出错：格式错误：无法同时配置多个隧道
此错误表示设备已连接到DoubleZero。

**症状：**
- 用户尝试连接到DoubleZero
- 遇到`❌ Error provisioning service: malformed stuff: cannot provision multiple tunnels at the same time`。

**解决方案：**
1. 检查
    `doublezero status`

    输出：
    ```bash
    Tunnel status | Last Session Update     | Tunnel Name | Tunnel src    | Tunnel dst     | Doublezero IP | User Type | Current Device | Lowest Latency Device | Metro     | Network
    up            | 2025-10-20 12:12:55 UTC | doublezero0 | 11.11.11.111 | 12.34.56.789 | 11.11.11.111 | IBRL      | ams-dz001      | ✅ ams-dz001          | Amsterdam | testnet
    ```
2. `up`表示连接正常。
3. 出现此错误是因为具有特定DoubleZero IP的到DoubleZero的隧道已在此机器上处于活跃状态。

    此错误通常在DoubleZero客户端升级后遇到。DoubleZero升级会自动重启doublezerod服务，如果您在服务重启之前已连接，将会重新连接您。


### 问题：DoubleZero状态为unknown或down
此问题通常与服务器和DoubleZero设备之间的GRE隧道已成功激活，但防火墙阻止BGP会话建立有关。因此，您没有从网络接收路由或通过DoubleZero发送流量。

**症状：**
- `doublezero connect ibrl`成功。但是，`doublezero status`返回`down`或`unknown`
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

   DoubleZero使用链路本地地址空间：169.254.0.0/16用于您的机器和DoubleZero设备之间的GRE隧道接口。169.254.0.0/16通常是"不可路由"的地址空间，因此良好的安全实践会建议您阻止与此地址空间之间的通信。您需要在防火墙中允许一条规则，使src 169.254.0.0/16可以与dst 169.254.0.0/16在tcp端口179上通信。该规则需要放在任何拒绝169.254.0.0/16流量的规则之上。

    在ufw等防火墙中，您可以运行`sudo ufw status`查看防火墙规则，以及

    示例输出，可能类似于Solana验证器会有的内容：
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

    在上面的输出中，您可以看到除了指定端口外，所有到169.254.0.0/16的流量都被拒绝。
    `sudo ufw insert <N> allow proto tcp from 169.254.0.0/16 to 169.254.0.0/16 port 179`将规则插入到<N>位置。即如果N=1，则将此规则插入为第一条规则。
    `sudo ufw status numbered`将显示规则的数字排序。

### 问题：最近的DoubleZero设备已更改

这不是一个错误，但可以是一种优化。以下是可以不时运行或自动化的最佳实践。

**解决方案：**

1. 检查到最近设备的延迟
    - 运行`doublezero latency`

        输出
        ```
         pubkey                                       | code          | ip              | min      | max      | avg      | reachable
         2hPMFJHh5BPX42ygBvuYYJfCv9q7g3rRR3ZRsUgtaqUi | dz-ny7-sw01   | 137.239.213.162 | 1.80ms   | 1.90ms   | 1.84ms   | true
         ETdwWpdQ7fXDHH5ea8feMmWxnZZvSKi4xDvuEGcpEvq3 | dz-ny5-sw01   | 137.239.213.170 | 1.83ms   | 2.10ms   | 1.92ms   | true
         8gisbwJnNhMNEWz587cAJMtSSFuWeNFtiufPuBTVqF2Z | dz-ny7-sw02   | 142.215.184.122 | 1.87ms   | 2.66ms   | 2.15ms   | true
         8J691gPwzy9FzUZQ4SmC6jJcY7By8kZXfbJwRfQ8ns31 | nyc002-dz002  | 38.122.35.137   | 2.33ms   | 2.39ms   | 2.37ms   | true
         FEML4XsDPN3WfmyFAXzE2xzyYqSB9kFCRrMik8JqN6kT | nyc001-dz001  | 38.104.167.29   | 2.29ms   | 2.59ms   | 2.40ms   | true
        ```
        注意上面最近的设备是`dz-ny7-sw01`

        我们想要连接到此设备。：

2. 确定您是否已连接到目标设备
    - 运行`doublezero user list --env testnet | grep 111.11.11.11`，将`111.11.11.11`替换为您已连接到DoubleZero的设备的公共IPv4地址。您也可以使用您的验证器ID或DoubleZero ID。

        输出
        ```
        account                                      | user_type           | groups                        | device       | location    | cyoa_type  | client_ip       | dz_ip           | accesspass                                                      | tunnel_id | tunnel_net       | status    | owner
        6QRU1ivJnKGHpom2BdzH9PiTRkJ5WhunPNLtfYcqVisW | IBRL                |                               | dz-ny7-sw01     | New York    | GREOverDIA | 111.11.11.11    | 111.11.11.11    | Prepaid: (MAX)                                                  | 514       | 111.254.1.111/31 | activated | DZfHh2vjXFqt8zfNbT1afm8PGuCm3BrQKegC5THtKFdn
        ```
        在此示例中，我们已连接到最近的设备。无需更多步骤，我们可以在这里停止。


        让我们考虑如果输出为
         ```
        account                                      | user_type           | groups                        | device       | location    | cyoa_type  | client_ip       | dz_ip           | accesspass                                                      | tunnel_id | tunnel_net       | status    | owner
        6QRU1ivJnKGHpom2BdzH9PiTRkJ5WhunPNLtfYcqVisW | IBRL                |                               | fra-dz-001-x     | New York    | GREOverDIA | 111.11.11.11    | 111.11.11.11    | Prepaid: (MAX)                                                  | 514       | 111.254.1.111/31 | activated | DZfHh2vjXFqt8zfNbT1afm8PGuCm3BrQKegC5THtKFdn
        ```
        这将是一个次优连接。让我们考虑是否需要重新连接。

        在连接之前，我们将检查设备是否有可用的用户隧道。

3. 可选：检查网络中的可用设备

    出于教育目的，我们将首先：
    - 运行`doublezero device list`获取完整的设备列表。我们以2个设备为例来解释输出。

        输出：
        ```
        account                                      | code          | contributor | location  | exchange | device_type | public_ip       | dz_prefixes                      | users | max_users | status    | mgmt_vrf | owner
        GphgLkA7JDVtkDQZCiDrwrDvaUs8r8XczEae1KkV6CGQ | ams001-dz002  | jump_       | EQX-AM4   | ams      | switch      | 149.11.64.57    | 38.246.201.64/27                 | 69    | 128       | activated |          | H647kAwTcWsGXZUK3BTr1JyTBZmbNcYyCmRFFCEnXUVp
        7FfrX8YbvbzM8A1ojNynP9BjiKpK9rrmhdEdchB2myhG | dz-fr5-sw01   | glxy        | EQX-FR5   | fra      | switch      | 89.222.118.225  | 89.222.118.228/30                | 0     | 0         | activated |          | 5YbNrJHJJoiRwVEvgAWRGdFRG9gRdZ47hLCKSym8bqbp
        ```
        注意上面`ams001-dz002`有69个用户，最多128个用户。此设备可以再增加59个用户。

        但是，`dz-fr5-sw01`有0个用户，0个最大用户。您将无法连接到此设备。最大用户为0，设备不接受任何连接。

        现在让我们回到连接到最近的设备。

4. 确定目标设备是否有可用连接
    - 运行`doublezero device list | grep dz-ny7-sw01`，将`dz-ny7-sw01`替换为您的目标设备

        输出
        ```
        2hPMFJHh5BPX42ygBvuYYJfCv9q7g3rRR3ZRsUgtaqUi | dz-ny7-sw01   | glxy        | EQX-NY7   | nyc      | switch      | 137.239.213.162 | 137.239.216.164/31               | 29    | 128       | activated |          | 5YbNrJHJJoiRwVEvgAWRGdFRG9gRdZ47hLCKSym8bqbp
        ```
        这里我们可以看到`dz-ny7-sw01`有可用的连接空间。

5. 连接到最近的DoubleZero设备

    我们将断开连接，然后重新连接到doublezero。

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
    现在我们用以下命令检查状态以确认断开连接
    - `doublezero status`

    输出

    ```
    Tunnel status | Last Session Update | Tunnel Name | Tunnel src | Tunnel dst | Doublezero IP | User Type
    disconnected  | no session data     |             |            |            |               |
    ```
    最后我们将重新连接
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
    注意上面的输出中我们`Connected to device: dz-ny7-sw01`，这是我们在步骤1初始调查中发现`dz-ny7-sw01`是延迟最低设备的期望结果。

### 问题：`doublezero status`返回某些字段为N/A

此问题通常与当前守护程序和客户端与建立已连接DZ隧道时的守护程序和客户端不匹配有关。

**症状：**
- 运行`doublezero status`时，用户在某些字段中遇到`N/A`




**解决方案：**
1. 运行
`doublezero status`

    示例：

    ```
    Tunnel status | Last Session Update     | Tunnel Name | Tunnel src   | Tunnel dst   | Doublezero IP | User Type | Current Device | Lowest Latency Device | Metro | Network
    up            | 2025-10-20 20:06:18 UTC | doublezero0 | 149.28.38.64 | 64.86.249.22 | 149.28.38.64  | IBRL      | N/A            | ✅ dz-ny7-sw01        | N/A   | mainnet-beta
    ```

    注意在上面的示例输出中，`Tunnel status`为`up`。我们的`Network`是`mainnet-beta`。但是，`Current Device`和`Metro`是`N/A`。

    这表明您的机器上有一个开放隧道，它不在您当前的环境中。
    在这种情况下，在`mainnet-beta`上找不到`Current Device`的`up`状态告诉我们我们的隧道在测试网上！

2. 更改您的环境。

    为了纠正不匹配，您将把环境更改为返回`N/A`的相反环境。

    ```bash
    DESIRED_DOUBLEZERO_ENV=testnet \
	    && sudo mkdir -p /etc/systemd/system/doublezerod.service.d \
	    && echo -e "[Service]\nExecStart=\nExecStart=/usr/bin/doublezerod -sock-file /run/doublezerod/doublezerod.sock -env $DESIRED_DOUBLEZERO_ENV" | sudo tee /etc/systemd/system/doublezerod.service.d/override.conf > /dev/null \
	    && sudo systemctl daemon-reload \
	    && sudo systemctl restart doublezerod \
	    && doublezero config set --env $DESIRED_DOUBLEZERO_ENV  > /dev/null \
	    && echo "✅ doublezerod configured for environment $DESIRED_DOUBLEZERO_ENV"
    ```

    要配置DoubleZero客户端CLI（`doublezero`）和守护程序（`doublezerod`）连接到**DoubleZero主网Beta**：

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
所有字段都已填充，您现在处于正确的环境中。
