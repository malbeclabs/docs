# 비검증자를 위한 IBRL 모드 허가된 DoubleZero 연결
!!! warning "This translation was generated using artificial intelligence and has not been reviewed by a human translator. It may contain inaccuracies or errors and should not be relied upon."

!!! warning "DoubleZero에 연결함으로써 [DoubleZero 서비스 약관](https://doublezero.xyz/terms-protocol)에 동의합니다"

<div data-wizard-step="rpc-onboarding" markdown>

### 허가된 사용자 온보딩 개요

현재 비검증자 및 RPC에 대한 사용자 온보딩은 허가제입니다. 허가된 흐름을 시작하려면 [이 양식](https://forms.fillout.com/t/s77k7wandMus?id=rec08iF4Z8kVFGm1z)을 작성하세요. 이 과정에서 예상되는 사항은 다음과 같습니다:

- 향후 허가된 사용자 사용과 관련된 수수료가 있을 수 있습니다.
- 양식 제출 후 기본 텔레그램 연락처를 모니터링하세요.

</div>

### IBRL 모드로 Mainnet-Beta 및 Testnet에 연결

!!! Note inline end
    IBRL 모드는 기존 공개 IP 주소를 사용하므로 검증자 클라이언트를 재시작할 필요가 없습니다.

허가된 사용자는 이 페이지에 설명된 DoubleZero Mainnet-beta 연결을 완료합니다.

## 1. 환경 구성

진행하기 전에 [설정](setup.md) 지침을 따르세요.

설정의 마지막 단계는 네트워크에서 연결을 해제하는 것이었습니다. 이는 DoubleZero에 한 개의 터널만 열려 있고 해당 터널이 올바른 네트워크에 있도록 하기 위한 것입니다.

**DoubleZero 테스트넷**에 연결하도록 DoubleZero 클라이언트 CLI(`doublezero`) 및 데몬(`doublezerod`)을 구성하려면:
```bash
DESIRED_DOUBLEZERO_ENV=testnet \
	&& sudo mkdir -p /etc/systemd/system/doublezerod.service.d \
	&& echo -e "[Service]\nExecStart=\nExecStart=/usr/bin/doublezerod -sock-file /run/doublezerod/doublezerod.sock -env $DESIRED_DOUBLEZERO_ENV" | sudo tee /etc/systemd/system/doublezerod.service.d/override.conf > /dev/null \
	&& sudo systemctl daemon-reload \
	&& sudo systemctl restart doublezerod \
	&& doublezero config set --env $DESIRED_DOUBLEZERO_ENV  > /dev/null \
	&& echo "✅ doublezerod configured for environment $DESIRED_DOUBLEZERO_ENV"
```
**DoubleZero mainnet-beta**에 연결하도록 DoubleZero 클라이언트 CLI(`doublezero`) 및 데몬(`doublezerod`)을 구성하려면:
```bash
DESIRED_DOUBLEZERO_ENV=mainnet-beta \
	&& sudo mkdir -p /etc/systemd/system/doublezerod.service.d \
	&& echo -e "[Service]\nExecStart=\nExecStart=/usr/bin/doublezerod -sock-file /run/doublezerod/doublezerod.sock -env $DESIRED_DOUBLEZERO_ENV" | sudo tee /etc/systemd/system/doublezerod.service.d/override.conf > /dev/null \
	&& sudo systemctl daemon-reload \
	&& sudo systemctl restart doublezerod \
	&& doublezero config set --env $DESIRED_DOUBLEZERO_ENV  > /dev/null \
	&& echo "✅ doublezerod configured for environment $DESIRED_DOUBLEZERO_ENV"
```

다음 출력이 표시되어야 합니다:
```
✅ doublezerod configured for environment mainnet-beta
```
다음 출력이 표시되어야 합니다:
`
✅ doublezerod configured for environment testnet
`

약 30초 후 DoubleZero 장치를 볼 수 있습니다:

```bash
doublezero latency
```
예시 출력 (테스트넷)
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
테스트넷 출력은 구조가 동일하지만 훨씬 더 많은 장치가 있습니다.
</details>


## 2. DoubleZero Foundation에 연락

DoubleZero Foundation에 연락하세요. `DoubleZeroID`, `검증자 ID`(노드 ID), 그리고 연결할 `공개 IPv4 주소`를 제공해야 합니다.


<div data-wizard-step="rpc-connect-ibrl" markdown>

## 3. IBRL 모드로 연결

서버에서 DoubleZero에 연결할 사용자로 `connect` 명령을 실행하여 DoubleZero에 연결을 설정하세요.

```bash
doublezero connect ibrl
```

다음과 같은 프로비저닝을 나타내는 출력이 표시되어야 합니다:

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
터널이 완료될 때까지 1분 기다리세요. 터널이 완료될 때까지 상태 출력이 "down" 또는 "Unknown"을 반환할 수 있습니다.

연결을 확인하세요:

```bash
doublezero status
```

**출력:**
```bash
Tunnel status | Last Session Update     | Tunnel Name | Tunnel src      | Tunnel dst   | DoubleZero IP   | User Type
up            | 2025-09-10 12:16:03 UTC | doublezero0 | 137.184.101.183 | 64.86.249.22 | 137.184.101.183 | IBRL
```
`up` 상태는 성공적으로 연결되었음을 의미합니다.

다음을 실행하여 DoubleZero의 다른 사용자가 전파한 경로를 볼 수 있습니다:

```
ip route
```
출력:

```
default via 149.28.38.1 dev enp1s0 proto dhcp src 149.28.38.64 metric 100
5.39.216.186 via 169.254.0.68 dev doublezero0 proto bgp src 149.28.38.64
5.39.251.201 via 169.254.0.68 dev doublezero0 proto bgp src 149.28.38.64
5.39.251.202 via 169.254.0.68 dev doublezero0 proto bgp src 149.28.38.64
...
```

</div>

### 다음 단계: 멀티캐스트

이 설정을 완료하고 멀티캐스트를 사용할 계획이라면 [다음 페이지](Other%20Multicast%20Connection.md)로 진행하세요.
