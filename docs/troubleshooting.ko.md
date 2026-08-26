---
description: 일반적인 DoubleZero 연결 문제를 참조 명령어, 예상 출력, 추가 지원을 받을 수 있는 곳을 통해 진단합니다.
---

# 문제 해결

이 가이드는 다양한 문제를 다루며, 지속적으로 업데이트됩니다. 가이드를 완료한 후에도 추가 지원이 필요하면 [DoubleZero Tech](https://discord.com/channels/1341597747932958802/1344323790464880701) 디스코드에서 도움을 받을 수 있습니다.


## 일반적인 명령어 및 출력

먼저, 다음 명령어의 출력과 예상 출력을 확인하세요. 이 정보는 더 자세한 문제 해결에 도움이 됩니다. 
티켓을 열면 해당 출력을 요청받을 수 있습니다.

#### 1. 버전 확인
명령어: 

`doublezero --version`

예시 출력:
```
DoubleZero 0.6.3
```
[comment]: # (when repo is public add this link to check https://github.com/malbeclabs/doublezero)

#### 2. DoubleZero 주소 확인
명령어: 

`doublezero address`

예시 출력:
```
MTAwoHgKyTwwDGJo2dye6EWqyTn27JRwXxaDEaeMqe2
```
[comment]: # ()

#### 3. Access Pass 확인

예시 공개키: `MTAwoHgKyTwwDGJo2dye6EWqyTn27JRwXxaDEaeMqe2` 명령어 실행 시 본인의 공개키로 교체하세요.

명령어: 

`doublezero access-pass list | grep MTAwoHgKyTwwDGJo2dye6EWqyTn27JRwXxaDEaeMqe2`

출력: [참고로 이 출력에서 헤더를 표시하기 위해 `doublezero access-pass list | awk 'NR==1 || /MTAwoHgKyTwwDGJo2dye6EWqyTn27JRwXxaDEaeMqe2/'`를 사용합니다]
```
account                                      | accesspass_type                                                | ip              | user_payer                                   | last_access_epoch | remaining_epoch | connections | status       | owner

2XHCWm8Sef1GirhAhAJVA8WTXToPT6gFYP7fA9mWMShR | prepaid                                                        | 141.14.14.14   | MTAwoHgKyTwwDGJo2dye6EWqyTn27JRwXxaDEaeMqe2 | MAX               | MAX             | 0           | requested    | DZfHh2vjXFqt8zfNbT1afm8PGuCm3BrQKegC5THtKFdn 
```
[comment]: # ()
#### 4. DoubleZero 원장 크레딧 확인
명령어: 

`doublezero balance`

예시 출력:
```
0.78 Credits
```
[comment]: # (add section linked later for 0 balance mainnet/testnet)

#### 5. 연결 상태 확인
명령어: 

`doublezero status`

예시 출력:

```bash
 Tunnel status | Last Session Update     | Tunnel Name | Tunnel src    | Tunnel dst     | Doublezero IP | User Type | Current Device | Lowest Latency Device | Metro     | Network 
 up            | 2025-10-20 12:12:55 UTC | doublezero0 | 11.11.11.111 | 12.34.56.789 | 11.11.11.111 | IBRL      | ams-dz001      | ✅ ams-dz001          | Amsterdam | testnet
```
[comment]: # (in next iteration add "up" "unknown" and "down" explainers, which then link to a sectino below for troubleshooting undesired states.)


#### 6. 지연 시간 확인
명령어: 

`doublezero latency`

예시 출력:
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

# 문제 해결 예시
기본 출력과 정상적인 배포에서 예상되는 결과를 살펴보았으니, 이제 몇 가지 일반적인 문제 해결 예시를 살펴보겠습니다.

### 문제: ❌ Error creating user

이 문제는 일반적으로 예상되는 공개키/IP 쌍과 사용자가 DoubleZero에 접속하려는 공개키/IP 쌍 사이의 불일치와 관련이 있습니다.

**증상:**
- `doublezero connect ibrl`로 연결할 때 사용자가 `❌ Error creating user`를 만남


**해결 방법:**
1. 확인 

    `doublezero address`

    예시 출력:
    ```
    MTAwoHgKyTwwDGJo2dye6EWqyTn27JRwXxaDEaeMqe2
    ```
2. 이 주소가 허용 목록에 있는지 확인: 

    `doublezero access-pass list | awk 'NR==1 || /MTAwoHgKyTwwDGJo2dye6EWqyTn27JRwXxaDEaeMqe2/'`

    예시 출력:
    ```
    account                                      | accesspass_type                                                | ip              | user_payer                                   | last_access_epoch | remaining_epoch | connections | status       | owner

    FHyoPs7U23MuSTtepEyXUtSAEffEpFpJGoYvug8X2sWY | prepaid                                                        | 141.14.14.14   | MTAwoHgKyTwwDGJo2dye6EWqyTn27JRwXxaDEaeMqe2 | MAX               | MAX             | 0           | requested    | DZfHh2vjXFqt8zfNbT1afm8PGuCm3BrQKegC5THtKFdn 
    ```
     `doublezero address`의 공개키는 user_payer 공개키와 일치해야 하며, 연결하려는 IP 주소는 Access-Pass의 ip와 일치해야 합니다. 
    `doublezero address`는 기본적으로 ~/.config/doublezero/에 있는 id.json 파일에서 가져옵니다. [여기의 6단계](<setup.md>)를 참조하세요
    
3. 위의 내용이 올바른데도 연결 시 오류가 발생하거나 위의 매핑이 올바르지 않은 경우 [DoubleZero Tech](https://discord.com/channels/1341597747932958802/1344323790464880701)에서 지원팀에 문의하세요

### 문제: ❌ Error provisioning service: malformed stuff: cannot provision multiple tunnels at the same time
이 오류는 장치가 이미 DoubleZero에 연결되어 있음을 나타냅니다.

**증상:**
- 사용자가 DoubleZero에 연결을 시도함
- `❌ Error provisioning service: malformed stuff: cannot provision multiple tunnels at the same time`가 발생함.

**해결 방법:**
1. 확인
    `doublezero status`

    출력:
    ```bash
    Tunnel status | Last Session Update     | Tunnel Name | Tunnel src    | Tunnel dst     | Doublezero IP | User Type | Current Device | Lowest Latency Device | Metro     | Network 
    up            | 2025-10-20 12:12:55 UTC | doublezero0 | 11.11.11.111 | 12.34.56.789 | 11.11.11.111 | IBRL      | ams-dz001      | ✅ ams-dz001          | Amsterdam | testnet
    ```
2. -`up`-은 정상적인 연결을 나타냅니다.
3. 이 오류는 특정 DoubleZero IP로의 DoubleZero 터널이 이미 이 머신에서 활성화되어 있기 때문에 나타납니다. 

    이 오류는 DoubleZero 클라이언트 업그레이드 후에 자주 발생합니다. DoubleZero 업그레이드는 자동으로 doublezerod 서비스를 재시작하며, 서비스 재시작 전에 연결되어 있었다면 다시 연결합니다.


### 문제: DoubleZero 상태가 unknown 또는 down
이 문제는 서버와 DoubleZero 장치 간의 GRE 터널이 성공적으로 활성화되었지만, 방화벽이 BGP 세션 설정을 차단하는 것과 관련이 있는 경우가 많습니다. 이로 인해 네트워크에서 라우트를 수신하지 못하거나 DoubleZero를 통해 트래픽을 전송하지 못합니다.

**증상:**
- `doublezero connect ibrl`은 성공했으나 `doublezero status`가 `down` 또는 `unknown`을 반환함
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

**해결 방법:**
1. 방화벽 규칙을 확인하세요!

   DoubleZero는 사용자의 머신과 DoubleZero 장치 간의 GRE 터널 인터페이스에 링크 로컬 주소 공간 169.254.0.0/16을 사용합니다. 169.254.0.0/16은 일반적으로 "라우팅 불가능한" 공간이므로 좋은 보안 관행에서는 이 공간으로의/으로부터의 통신을 차단하도록 권장합니다. 방화벽에서 src 169.254.0.0/16이 dst 169.254.0.0/16과 tcp 포트 179에서 통신할 수 있도록 허용하는 규칙을 추가해야 합니다. 이 규칙은 169.254.0.0/16으로의 트래픽을 거부하는 규칙보다 위에 배치해야 합니다. 

    ufw와 같은 방화벽에서는 `sudo ufw status`를 실행하여 방화벽 규칙을 확인할 수 있습니다

    Solana 검증자가 가질 수 있는 것과 유사한 예시 출력:
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

    위의 출력에서 169.254.0.0/16으로의 모든 트래픽이 지정된 포트를 제외하고 거부되어 있음을 볼 수 있습니다. 
    `sudo ufw insert <N> allow proto tcp from 169.254.0.0/16 to 169.254.0.0/16 port 179`을 사용하여 <N> 위치에 규칙을 삽입합니다. 예를 들어 N = 1이면 이 규칙이 첫 번째 규칙으로 삽입됩니다.
    `sudo ufw status numbered`는 규칙의 번호 순서를 보여줍니다.
    
### 문제: 가장 가까운 DoubleZero 장치가 변경됨

이것은 오류가 아니지만 최적화할 수 있습니다. 아래는 수시로 실행하거나 자동화할 수 있는 모범 사례입니다.

**해결 방법:**

1. 가장 가까운 장치까지의 지연 시간 확인
    - `doublezero latency` 실행

        출력
        ```
         pubkey                                       | code          | ip              | min      | max      | avg      | reachable 
         2hPMFJHh5BPX42ygBvuYYJfCv9q7g3rRR3ZRsUgtaqUi | dz-ny7-sw01   | 137.239.213.162 | 1.80ms   | 1.90ms   | 1.84ms   | true      
         ETdwWpdQ7fXDHH5ea8feMmWxnZZvSKi4xDvuEGcpEvq3 | dz-ny5-sw01   | 137.239.213.170 | 1.83ms   | 2.10ms   | 1.92ms   | true      
         8gisbwJnNhMNEWz587cAJMtSSFuWeNFtiufPuBTVqF2Z | dz-ny7-sw02   | 142.215.184.122 | 1.87ms   | 2.66ms   | 2.15ms   | true      
         8J691gPwzy9FzUZQ4SmC6jJcY7By8kZXfbJwRfQ8ns31 | nyc002-dz002  | 38.122.35.137   | 2.33ms   | 2.39ms   | 2.37ms   | true      
         FEML4XsDPN3WfmyFAXzE2xzyYqSB9kFCRrMik8JqN6kT | nyc001-dz001  | 38.104.167.29   | 2.29ms   | 2.59ms   | 2.40ms   | true   
        ```
        위에서 가장 가까운 장치가 `dz-ny7-sw01`임을 확인하세요

        이 장치에 연결하고자 합니다:

2. 이미 대상 장치에 연결되어 있는지 확인
    - `doublezero user list --env testnet | grep 111.11.11.11` 실행 — `111.11.11.11`을 DoubleZero에 연결된 장치의 공인 IPv4 주소로 교체하세요. 검증자 ID 또는 doublezero ID를 사용할 수도 있습니다.

        출력
        ```
        account                                      | user_type           | groups                        | device       | location    | cyoa_type  | client_ip       | dz_ip           | accesspass                                                      | tunnel_id | tunnel_net       | status    | owner                                        
        6QRU1ivJnKGHpom2BdzH9PiTRkJ5WhunPNLtfYcqVisW | IBRL                |                               | dz-ny7-sw01     | New York    | GREOverDIA | 111.11.11.11    | 111.11.11.11    | Prepaid: (MAX)                                                  | 514       | 111.254.1.111/31 | activated | DZfHh2vjXFqt8zfNbT1afm8PGuCm3BrQKegC5THtKFdn 
        ```
        이 예시에서는 이미 가장 가까운 장치에 연결되어 있습니다. 추가 단계가 필요 없으며 여기서 중단할 수 있습니다.


        대신 출력이 다음과 같은 경우를 생각해 봅시다
         ```
        account                                      | user_type           | groups                        | device       | location    | cyoa_type  | client_ip       | dz_ip           | accesspass                                                      | tunnel_id | tunnel_net       | status    | owner                                        
        6QRU1ivJnKGHpom2BdzH9PiTRkJ5WhunPNLtfYcqVisW | IBRL                |                               | fra-dz-001-x     | New York    | GREOverDIA | 111.11.11.11    | 111.11.11.11    | Prepaid: (MAX)                                                  | 514       | 111.254.1.111/31 | activated | DZfHh2vjXFqt8zfNbT1afm8PGuCm3BrQKegC5THtKFdn 
        ```
        이는 최적이 아닌 연결입니다. 재연결이 필요한지 확인해 봅시다.

        연결하기 전에 해당 장치에 사용 가능한 사용자 터널이 있는지 확인합니다.

3. 선택 사항: 네트워크에서 사용 가능한 장치 확인

    교육 목적으로 먼저: 
    - `doublezero device list`를 실행하여 전체 장치 목록을 확인합니다. 출력을 설명하기 위해 2개의 장치를 예시로 가져왔습니다.

        출력:
        ```
        account                                      | code          | contributor | location  | exchange | device_type | public_ip       | dz_prefixes                      | users | max_users | status    | mgmt_vrf | owner                                        
        GphgLkA7JDVtkDQZCiDrwrDvaUs8r8XczEae1KkV6CGQ | ams001-dz002  | jump_       | EQX-AM4   | ams      | switch      | 149.11.64.57    | 38.246.201.64/27                 | 69    | 128       | activated |          | H647kAwTcWsGXZUK3BTr1JyTBZmbNcYyCmRFFCEnXUVp 
        7FfrX8YbvbzM8A1ojNynP9BjiKpK9rrmhdEdchB2myhG | dz-fr5-sw01   | glxy        | EQX-FR5   | fra      | switch      | 89.222.118.225  | 89.222.118.228/30                | 0     | 0         | activated |          | 5YbNrJHJJoiRwVEvgAWRGdFRG9gRdZ47hLCKSym8bqbp 
        ```
        위에서 `ams001-dz002`는 69명의 사용자가 있고 최대 사용자 수는 128명입니다. 이 장치는 59명의 사용자를 추가할 수 있습니다. 

        그러나 `dz-fr5-sw01`은 사용자 0명, 최대 사용자 0명입니다. 이 장치에는 연결할 수 없습니다. 최대 사용자가 0이므로 이 장치는 어떠한 연결도 수락하지 않습니다.

        이제 가장 가까운 장치에 연결하는 것으로 돌아가겠습니다.

4. 대상 장치에 사용 가능한 연결이 있는지 확인
    - `doublezero device list | grep dz-ny7-sw01` 실행 — `dz-ny7-sw01`을 대상 장치로 교체하세요

        출력
        ```
        2hPMFJHh5BPX42ygBvuYYJfCv9q7g3rRR3ZRsUgtaqUi | dz-ny7-sw01   | glxy        | EQX-NY7   | nyc      | switch      | 137.239.213.162 | 137.239.216.164/31               | 29    | 128       | activated |          | 5YbNrJHJJoiRwVEvgAWRGdFRG9gRdZ47hLCKSym8bqbp 
        ```
        여기서 `dz-ny7-sw01`에 연결 가능한 공간이 있음을 확인할 수 있습니다.

5. 가장 가까운 DoubleZero 장치에 연결

    연결을 해제한 다음 doublezero에 다시 연결합니다.

    먼저 실행
    - `doublezero disconnect`

      출력

        ```
        DoubleZero Service Provisioning
        🔍  Decommissioning User
        Public IP detected: 111.11.11.11 - If you want to use a different IP, you can specify it with `--client-ip x.x.x.x`
        \ [00:00:00] [##########>-----------------------------] 1/4 deleting user       account...                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     🔍  Deleting User Account for: 6QRU1ivJnKGHpom2BdzH9PiTRkJ5WhunPNLtfYcqVisW
        🔍  User Account deleted
        ✅  Deprovisioning Complete
        ```
    이제 연결 해제를 확인하기 위해 상태를 확인합니다
    - `doublezero status`

    출력

    ```
    Tunnel status | Last Session Update | Tunnel Name | Tunnel src | Tunnel dst | Doublezero IP | User Type 
    disconnected  | no session data     |             |            |            |               |    
    ```
    마지막으로 다시 연결합니다
    - `doublezero connect ibrl`

    출력
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
    위 출력에서 `Connected to device: dz-ny7-sw01`에 연결된 것을 확인할 수 있습니다. 이는 1단계 초기 조사에서 `dz-ny7-sw01`이 가장 낮은 지연 시간을 가진 장치임을 발견한 결과와 일치하는 원하는 결과입니다.

### 문제: 잘못된 DoubleZero 환경

Mainnet-Beta와 Testnet은 서로 다른 패키지 저장소를 사용합니다. `doublezero status`는 클라이언트가 연결된 네트워크를 표시합니다(`Network` 열). 사용자가 잘못된 클라이언트를 설치했거나 데몬이 여전히 다른 환경을 가리키고 있는 경우, 아래의 복사-붙여넣기 전환 명령을 사용하세요.

DoubleZero 클라이언트 CLI(`doublezero`)와 데몬(`doublezerod`)을 **DoubleZero testnet**에 연결하도록 구성하려면:

```bash
DESIRED_DOUBLEZERO_ENV=testnet \
	&& sudo mkdir -p /etc/systemd/system/doublezerod.service.d \
	&& echo -e "[Service]\nExecStart=\nExecStart=/usr/bin/doublezerod -sock-file /run/doublezerod/doublezerod.sock -env $DESIRED_DOUBLEZERO_ENV" | sudo tee /etc/systemd/system/doublezerod.service.d/override.conf > /dev/null \
	&& sudo systemctl daemon-reload \
	&& sudo systemctl restart doublezerod \
	&& doublezero config set --env $DESIRED_DOUBLEZERO_ENV  > /dev/null \
	&& echo "✅ doublezerod configured for environment $DESIRED_DOUBLEZERO_ENV"
```

DoubleZero 클라이언트 CLI(`doublezero`)와 데몬(`doublezerod`)을 **DoubleZero mainnet-beta**에 연결하도록 구성하려면:

```bash
DESIRED_DOUBLEZERO_ENV=mainnet-beta \
	&& sudo mkdir -p /etc/systemd/system/doublezerod.service.d \
	&& echo -e "[Service]\nExecStart=\nExecStart=/usr/bin/doublezerod -sock-file /run/doublezerod/doublezerod.