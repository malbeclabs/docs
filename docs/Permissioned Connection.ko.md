---
description: IBRL 모드에서 DoubleZero Mainnet-Beta 및 Testnet에 연결하는 비검증자 및 RPC를 위한 허가형 온보딩.
---

# IBRL 모드에서의 비검증자 허가형 DoubleZero 연결
!!! warning "DoubleZero에 연결함으로써 [DoubleZero 서비스 약관](https://doublezero.xyz/terms-protocol)에 동의합니다"

<div data-wizard-step="rpc-onboarding" markdown>

### 허가형 사용자 온보딩 개요

사용자 온보딩은 현재 비검증자 및 RPC에 대해 허가형으로 운영됩니다. 허가형 절차를 시작하려면 [이 양식](https://forms.fillout.com/t/s77k7wandMus?id=rec08iF4Z8kVFGm1z)을 작성해 주세요. 이 과정에서 예상되는 사항은 다음과 같습니다:

- 향후 허가형 사용자 이용에 수수료가 부과될 수 있습니다.
- 양식 제출 후 기본 Telegram 연락처를 모니터링해 주세요.

</div>

### IBRL 모드에서 Mainnet-Beta 및 Testnet에 연결하기

!!! Note inline end
    IBRL 모드는 기존 공개 IP 주소를 사용하므로 검증자 클라이언트를 재시작할 필요가 없습니다.

허가형 사용자는 DoubleZero Mainnet-beta 연결을 완료하게 되며, 자세한 내용은 이 페이지에 설명되어 있습니다.

## 1. 클라이언트 네트워크 확인

진행하기 전에 [설정](setup.md) 지침을 따라 주세요. 원하는 네트워크에 맞는 Mainnet-Beta 또는 Testnet 패키지를 설치하세요 — 서로 다른 패키지 저장소를 사용합니다.

설정의 마지막 단계는 네트워크에서 연결을 해제하는 것이었습니다. 이는 DoubleZero에 대한 터널이 하나만 열려 있고, 해당 터널이 올바른 네트워크에 연결되어 있는지 확인하기 위함입니다.

다음 명령으로 확인하세요:

```bash
doublezero status
```

`Network` 열이 참여하려는 네트워크와 일치해야 합니다. 일치하지 않는 경우 [문제 해결](troubleshooting.md#issue-wrong-doublezero-environment)의 복사-붙여넣기 전환 방법을 사용하세요.

약 30초 후 사용 가능한 DoubleZero 장치를 확인할 수 있습니다:

```bash
doublezero latency
```
예시 출력 (Testnet)
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
Testnet 출력은 구조적으로 동일하지만, 사용 가능한 장치가 훨씬 더 많습니다.

## 2. DoubleZero Foundation에 연락하기

DoubleZero foundation에 연락하세요. `DoubleZeroID`, `Validator ID`(노드 ID), 그리고 연결에 사용할 `public ipv4 address`를 제공해야 합니다.


<div data-wizard-step="rpc-connect-ibrl" markdown>

## 3. IBRL 모드로 연결하기

서버에서 DoubleZero에 연결할 사용자로 `connect` 명령을 실행하여 DoubleZero 연결을 설정하세요.

```bash
doublezero connect ibrl
```

다음과 같은 프로비저닝 진행 출력을 확인할 수 있습니다:

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
터널이 완료될 때까지 1분 정도 기다려 주세요. 터널이 완료되기 전까지 상태 출력이 "down" 또는 "Unknown"으로 표시될 수 있습니다.

연결을 확인하세요:

```bash
doublezero status
```

**출력:**
```bash
Tunnel status | Last Session Update     | Tunnel Name | Tunnel src      | Tunnel dst   | DoubleZero IP   | User Type
up            | 2025-09-10 12:16:03 UTC | doublezero0 | 137.184.101.183 | 64.86.249.22 | 137.184.101.183 | IBRL
```
상태가 `up`이면 성공적으로 연결된 것입니다.

다음 명령을 실행하면 DoubleZero의 다른 사용자가 전파한 라우트를 확인할 수 있습니다:

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

### 다음 단계: Multicast

이 설정을 완료했고 Multicast를 사용할 계획이라면 [다음 페이지](Other%20Multicast%20Connection.md)로 진행하세요.