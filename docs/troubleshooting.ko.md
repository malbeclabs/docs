# 문제 해결
!!! warning "This translation was generated using artificial intelligence and has not been reviewed by a human translator. It may contain inaccuracies or errors and should not be relied upon."


이 가이드는 다양한 문제를 다루며 계속 업데이트됩니다. 가이드를 완료한 후에도 추가 지원이 필요하다면 [DoubleZero Tech](https://discord.com/channels/1341597747932958802/1344323790464880701) Discord에서 도움을 받을 수 있습니다.


## 일반 명령 및 출력

다음 명령의 출력과 정상 배포 시 예상되는 출력을 살펴보겠습니다. 이는 더 자세한 문제 해결에 도움이 될 것입니다.
티켓을 제출하면 출력을 요청받을 수 있습니다.

#### 1. 버전 확인
명령:

`doublezero --version`

샘플 출력:
```
DoubleZero 0.6.3
```

#### 2. DoubleZero 주소 확인
명령:

`doublezero address`

샘플 출력:
```
MTAwoHgKyTwwDGJo2dye6EWqyTn27JRwXxaDEaeMqe2
```

#### 3. 액세스 패스 확인

샘플 공개 키: `MTAwoHgKyTwwDGJo2dye6EWqyTn27JRwXxaDEaeMqe2` — 명령 실행 시 이것을 본인의 공개 키로 교체하세요.

명령:

`doublezero access-pass list | grep MTAwoHgKyTwwDGJo2dye6EWqyTn27JRwXxaDEaeMqe2`

출력:
```
account                                      | accesspass_type                                                | ip              | user_payer                                   | last_access_epoch | remaining_epoch | connections | status       | owner

2XHCWm8Sef1GirhAhAJVA8WTXToPT6gFYP7fA9mWMShR | prepaid                                                        | 141.14.14.14   | MTAwoHgKyTwwDGJo2dye6EWqyTn27JRwXxaDEaeMqe2 | MAX               | MAX             | 0           | requested    | DZfHh2vjXFqt8zfNbT1afm8PGuCm3BrQKegC5THtKFdn
```

#### 4. DoubleZero 레저 크레딧 확인
명령:

`doublezero balance`

샘플 출력:
```
0.78 Credits
```

#### 5. 연결 상태 확인
명령:

`doublezero status`

샘플 출력:

```bash
 Tunnel status | Last Session Update     | Tunnel Name | Tunnel src    | Tunnel dst     | Doublezero IP | User Type | Current Device | Lowest Latency Device | Metro     | Network
 up            | 2025-10-20 12:12:55 UTC | doublezero0 | 11.11.11.111 | 12.34.56.789 | 11.11.11.111 | IBRL      | ams-dz001      | ✅ ams-dz001          | Amsterdam | testnet
```

#### 6. 대기 시간 확인
명령:

`doublezero latency`

샘플 출력:
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

# 문제 해결 예제
기본 출력과 정상 배포 시 예상되는 것을 살펴봤으니 이제 일반적인 문제 해결 예제를 살펴보겠습니다.

### 문제: ❌ 사용자 생성 오류

이 문제는 일반적으로 예상되는 공개 키/IP 쌍과 사용자가 DoubleZero에 접근하려는 공개 키/IP 쌍 간의 불일치와 관련이 있습니다.

**증상:**
- `doublezero connect ibrl`로 연결할 때 `❌ Error creating user`가 발생합니다


**해결 방법:**
1. 확인

    `doublezero address`

    샘플 출력:
    ```
    MTAwoHgKyTwwDGJo2dye6EWqyTn27JRwXxaDEaeMqe2
    ```
2. 이 주소가 허용 목록에 있는지 확인:

    `doublezero access-pass list | awk 'NR==1 || /MTAwoHgKyTwwDGJo2dye6EWqyTn27JRwXxaDEaeMqe2/'`

    샘플 출력:
    ```
    account                                      | accesspass_type                                                | ip              | user_payer                                   | last_access_epoch | remaining_epoch | connections | status       | owner

    FHyoPs7U23MuSTtepEyXUtSAEffEpFpJGoYvug8X2sWY | prepaid                                                        | 141.14.14.14   | MTAwoHgKyTwwDGJo2dye6EWqyTn27JRwXxaDEaeMqe2 | MAX               | MAX             | 0           | requested    | DZfHh2vjXFqt8zfNbT1afm8PGuCm3BrQKegC5THtKFdn
    ```
     `doublezero address`의 공개 키는 user_payer 공개 키와 일치해야 하며, 연결하려는 IP 주소는 액세스 패스의 IP와 일치해야 합니다.
    `doublezero address`는 기본적으로 `~/.config/doublezero/`의 id.json 파일에서 가져옵니다. [여기 6단계](https://docs.malbeclabs.com/setup/)를 참조하세요.

3. 위 내용이 올바르게 보이지만 연결 중 오류가 발생하거나 위 매핑이 올바르지 않은 경우 [DoubleZero Tech](https://discord.com/channels/1341597747932958802/1344323790464880701)에서 지원에 연락하세요.

### 문제: ❌ 서비스 프로비저닝 오류: 동시에 여러 터널을 프로비저닝할 수 없습니다
이 오류는 장치가 이미 DoubleZero에 연결되어 있음을 나타냅니다.

**증상:**
- 사용자가 DoubleZero에 연결하려고 합니다
- `❌ Error provisioning service: malformed stuff: cannot provision multiple tunnels at the same time`이 발생합니다

**해결 방법:**
1. 확인
    `doublezero status`

    출력:
    ```bash
    Tunnel status | Last Session Update     | Tunnel Name | Tunnel src    | Tunnel dst     | Doublezero IP | User Type | Current Device | Lowest Latency Device | Metro     | Network
    up            | 2025-10-20 12:12:55 UTC | doublezero0 | 11.11.11.111 | 12.34.56.789 | 11.11.11.111 | IBRL      | ams-dz001      | ✅ ams-dz001          | Amsterdam | testnet
    ```
2. `up`은 정상적인 연결을 나타냅니다.
3. 오류는 특정 DoubleZero IP를 사용하는 DoubleZero 터널이 이미 이 기계에서 활성화되어 있기 때문에 나타납니다.

    이 오류는 DoubleZero 클라이언트 업그레이드 후 자주 발생합니다. DoubleZero 업그레이드는 doublezerod 서비스를 자동으로 재시작하고 서비스 재시작 전에 연결되어 있었다면 다시 연결합니다.


### 문제: DoubleZero 상태가 unknown 또는 down
이 문제는 종종 서버와 DoubleZero 장치 간의 GRE 터널이 성공적으로 활성화되었지만 방화벽이 BGP 세션 설정을 방지하는 것과 관련이 있습니다. 이로 인해 네트워크로부터 경로를 받지 못하거나 DoubleZero를 통해 트래픽을 전송하지 못합니다.

**증상:**
- `doublezero connect ibrl`이 성공했습니다. 그러나 `doublezero status`가 `down` 또는 `unknown`을 반환합니다

**해결 방법:**
1. 방화벽 규칙을 확인하세요!

   DoubleZero는 귀하의 기계와 DoubleZero 장치 간의 GRE 터널 인터페이스에 링크 로컬 주소 공간인 169.254.0.0/16을 사용합니다. 169.254.0.0/16은 일반적으로 "라우팅 불가능한" 공간으로 간주되므로 좋은 보안 관행은 이 공간에서 오가는 통신을 차단하는 것을 권장합니다. 방화벽에서 src 169.254.0.0/16이 tcp 포트 179의 dst 169.254.0.0/16과 통신할 수 있도록 하는 규칙을 허용해야 합니다. 해당 규칙은 169.254.0.0/16 트래픽을 거부하는 규칙 위에 배치되어야 합니다.

    ufw와 같은 방화벽에서 `sudo ufw status`를 실행하여 방화벽 규칙을 볼 수 있습니다.

    Solana 검증자와 유사할 수 있는 샘플 출력:
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

    위 출력에서 지정된 포트를 제외한 169.254.0.0/16으로의 모든 트래픽이 거부됩니다.
    `sudo ufw insert <N> allow proto tcp from 169.254.0.0/16 to 169.254.0.0/16 port 179`를 사용하여 \<N\> 위치에 규칙을 삽입하세요. 즉, N = 1이면 이 규칙을 첫 번째 규칙으로 삽입합니다.
    `sudo ufw status numbered`는 규칙의 번호 순서를 표시합니다.

### 문제: 가장 가까운 DoubleZero 장치가 변경됨

이것은 오류가 아니라 최적화일 수 있습니다. 아래는 때때로 실행하거나 자동화할 수 있는 모범 사례입니다.

**해결 방법:**

1. 가장 가까운 장치의 대기 시간 확인
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
        위에서 가장 가까운 장치는 `dz-ny7-sw01`입니다.

        이 장치에 연결하고자 합니다.

2. 이미 대상 장치에 연결되어 있는지 확인
    - `doublezero user list --env testnet | grep 111.11.11.11`을 실행하여 `111.11.11.11`을 DoubleZero에 연결된 장치의 공개 IPv4 주소로 교체하세요.

        출력
        ```
        account                                      | user_type           | groups                        | device       | location    | cyoa_type  | client_ip       | dz_ip           | accesspass                                                      | tunnel_id | tunnel_net       | status    | owner
        6QRU1ivJnKGHpom2BdzH9PiTRkJ5WhunPNLtfYcqVisW | IBRL                |                               | dz-ny7-sw01     | New York    | GREOverDIA | 111.11.11.11    | 111.11.11.11    | Prepaid: (MAX)                                                  | 514       | 111.254.1.111/31 | activated | DZfHh2vjXFqt8zfNbT1afm8PGuCm3BrQKegC5THtKFdn
        ```
        이 예에서 우리는 이미 가장 가까운 장치에 연결되어 있습니다. 더 이상의 단계가 필요 없으며 여기서 멈출 수 있습니다.

5. 가장 가까운 DoubleZero 장치에 연결

    연결을 끊고 DoubleZero에 다시 연결합니다.

    먼저 실행:
    - `doublezero disconnect`

    이제 상태를 확인하여 연결 해제를 확인합니다:
    - `doublezero status`

    마지막으로 다시 연결:
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
    위 출력에서 `Connected to device: dz-ny7-sw01`로 연결되었음을 확인하세요.

### 문제: `doublezero status`가 일부 필드에서 N/A를 반환함

이 문제는 일반적으로 현재 데몬 및 클라이언트와 연결된 DZ 터널이 설정된 데몬 및 클라이언트 간의 불일치와 관련이 있습니다.

**증상:**
- `doublezero status`를 실행할 때 일부 필드에서 `N/A`가 발생합니다

**해결 방법:**
1. 실행
`doublezero status`

    예:

    ```
    Tunnel status | Last Session Update     | Tunnel Name | Tunnel src   | Tunnel dst   | Doublezero IP | User Type | Current Device | Lowest Latency Device | Metro | Network
    up            | 2025-10-20 20:06:18 UTC | doublezero0 | 149.28.38.64 | 64.86.249.22 | 149.28.38.64  | IBRL      | N/A            | ✅ dz-ny7-sw01        | N/A   | mainnet-beta
    ```

    위 예제 출력에서 `Tunnel status`가 `up`임을 확인하세요. `Network`는 `mainnet-beta`입니다. 그러나 `Current Device`와 `Metro`가 `N/A`입니다.

    이것은 현재 환경에 없는 열린 터널이 기계에 있음을 나타냅니다.
    이 경우 `mainnet-beta`에서 `Current Device`가 없는 `up` 상태는 터널이 testnet에 있음을 나타냅니다!

2. 환경을 변경하세요.

    불일치를 수정하려면 환경을 `N/A`를 반환하는 환경의 반대로 변경합니다.

    ```bash
    DESIRED_DOUBLEZERO_ENV=testnet \
	    && sudo mkdir -p /etc/systemd/system/doublezerod.service.d \
	    && echo -e "[Service]\nExecStart=\nExecStart=/usr/bin/doublezerod -sock-file /run/doublezerod/doublezerod.sock -env $DESIRED_DOUBLEZERO_ENV" | sudo tee /etc/systemd/system/doublezerod.service.d/override.conf > /dev/null \
	    && sudo systemctl daemon-reload \
	    && sudo systemctl restart doublezerod \
	    && doublezero config set --env $DESIRED_DOUBLEZERO_ENV  > /dev/null \
	    && echo "✅ doublezerod configured for environment $DESIRED_DOUBLEZERO_ENV"
    ```

3. 상태 확인

    환경 전환 후 실행:

    ```
    doublezero status
    ```

    예상 출력은 다음과 유사해야 합니다:

    ```
    Tunnel status | Last Session Update     | Tunnel Name | Tunnel src   | Tunnel dst   | Doublezero IP | User Type | Current Device | Lowest Latency Device | Metro    | Network
    up            | 2025-10-21 12:32:12 UTC | doublezero0 | 149.28.38.64 | 64.86.249.22 | 149.28.38.64  | IBRL      | nyc-dz001      | ✅ nyc-dz001          | New York | testnet
    ```
모든 필드가 채워지면 올바른 환경에 있는 것입니다.
