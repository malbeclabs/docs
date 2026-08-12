---
description: IBRL 모드로 DoubleZero에 연결하는 Shelby 테스트넷 사용자를 위한 허가된 연결 가이드.
---

# Shelby
!!! warning "DoubleZero에 연결함으로써 [DoubleZero 서비스 약관](https://doublezero.xyz/terms-protocol)에 동의합니다"

<div data-wizard-step="rpc-onboarding" markdown>

### DoubleZeroID 받기

이 [양식](https://forms.fillout.com/t/s77k7wandMus?id=rec08iF4Z8kVFGm1z)에 `DoubleZeroID`와 `public ipv4 address`를 제공해야 합니다.


- 향후 허가된 사용자 사용에 대해 수수료가 부과될 수 있습니다.
- 양식 제출 후 기본 Telegram 연락처를 모니터링하세요.
- 현재 Shelby는 DoubleZero 테스트넷에만 연결할 수 있습니다.

</div>

### IBRL 모드로 테스트넷에 연결하기

Shelby 허가된 사용자는 이 페이지에 자세히 설명된 DoubleZero 테스트넷에 대한 연결을 완료합니다.

## 1. 환경 구성

진행하기 전에 [설정](setup.md) 지침을 따르세요.

설정의 마지막 단계는 네트워크에서 연결을 해제하는 것이었습니다. 이는 DoubleZero에 대한 터널이 머신에서 하나만 열려 있고, 해당 터널이 올바른 네트워크에 있는지 확인하기 위함입니다.

DoubleZero Client CLI(`doublezero`)를 DoubleZero의 Shelby 테넌트에 연결하도록 구성하려면:
```bash
doublezero config set --tenant shelby
```

Shelby에 특화된 추가 방화벽 규칙을 적용합니다:

iptables:
```
sudo iptables -A INPUT -i doublezero0 -p tcp --dport 39431 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 39431 -j DROP
```

UFW:
```
sudo ufw allow in on doublezero0 to any port 39431 proto tcp
sudo ufw deny in to any port 39431 proto tcp
```

## 2. DoubleZero 재단에 연락하기

DoubleZero 재단에 연락하세요. 연결할 `DoubleZeroID`와 `public ipv4 address`를 제공해야 합니다.


<div data-wizard-step="rpc-connect-ibrl" markdown>

## 3. IBRL 모드로 연결하기

서버에서 DoubleZero에 연결할 사용자로 `connect` 명령을 실행하여 DoubleZero에 대한 연결을 설정합니다.

```bash
doublezero connect ibrl
```

다음과 같은 프로비저닝을 나타내는 출력이 표시됩니다:

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
터널이 완료될 때까지 1분간 기다리세요. 터널이 완료되기 전까지 상태 출력이 "down" 또는 "Unknown"을 반환할 수 있습니다.

연결을 확인합니다:

```bash
doublezero status
```

**출력:**
```bash
Tunnel status | Last Session Update     | Tunnel Name | Tunnel src      | Tunnel dst   | DoubleZero IP   | User Type
up            | 2025-09-10 12:16:03 UTC | doublezero0 | 137.184.101.183 | 64.86.249.22 | 137.184.101.183 | IBRL
```
상태가 `up`이면 성공적으로 연결된 것입니다.

다음 명령을 실행하여 DoubleZero의 다른 사용자들이 전파한 경로를 확인할 수 있습니다:

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