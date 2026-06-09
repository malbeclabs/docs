---
description: doublezerod를 설치하고 밸리데이터 또는 노드를 DoubleZero 네트워크에 연결하는 단계별 가이드.
---

# DoubleZero 설정 방법

!!! info "용어 안내"
    DoubleZero가 처음이신가요? [doublezerod](glossary.md#doublezerod), [IBRL](glossary.md#ibrl-increase-bandwidth-reduce-latency), [DZD](glossary.md#dzd-doublezero-device) 등의 용어 정의는 [용어집](glossary.md)을 참고하세요.

!!! warning "DoubleZero에 연결함으로써 [DoubleZero 서비스 약관](https://doublezero.xyz/terms-protocol)에 동의합니다"


## 사전 요구 사항
!!! warning inline end
    밸리데이터의 경우: DoubleZero는 컨테이너가 아닌 밸리데이터 호스트에 직접 설치해야 합니다.
- 공인 IP 주소를 사용하는 인터넷 연결 (NAT 불가)
- x86_64 서버
- 지원 OS: Ubuntu 22.04+ 또는 Debian 11+, 또는 Rocky Linux / RHEL 9+
- DoubleZero가 실행될 서버에서의 Root 또는 sudo 권한
- 선택 사항(디버깅에 유용): jq 및 curl

## DoubleZero 연결

DoubleZero Testnet과 DoubleZero Mainnet-Beta는 물리적으로 별개의 네트워크입니다. 설치 시 적절한 네트워크를 선택하세요.

DoubleZero에 온보딩할 때 **DoubleZero ID**라 불리는 공개 키로 표현되는 **DoubleZero 아이덴티티**를 생성하게 됩니다. 이 키는 DoubleZero가 귀하의 머신을 식별하는 방법의 일부입니다.

## 1. DoubleZero 패키지 설치

<div data-wizard-step="install-version-info" markdown>

!!! info "현재 버전"
    | 패키지 | Mainnet-Beta | Testnet |
    |---------|-------------|---------|
    | `doublezero` | `MAINNET_CLIENT_VERSION` | `TESTNET_CLIENT_VERSION` |

</div>

운영 체제에 따라 아래 단계를 따르세요:

### Ubuntu / Debian

<div data-wizard-step="install-deb-mainnet-beta" markdown>

Mainnet-Beta에 대한 현재 권장 배포 방법:
```bash
curl -1sLf https://dl.cloudsmith.io/public/malbeclabs/doublezero/setup.deb.sh | sudo -E bash
sudo apt-get install doublezero
```

</div>

<div data-wizard-step="install-deb-testnet" markdown>

Testnet에 대한 현재 권장 배포 방법:
```bash
curl -1sLf https://dl.cloudsmith.io/public/malbeclabs/doublezero-testnet/setup.deb.sh | sudo -E bash
sudo apt-get install doublezero
```

</div>

### Rocky Linux / RHEL

<div data-wizard-step="install-rpm-mainnet-beta" markdown>

Mainnet-Beta에 대한 현재 권장 배포 방법:
```bash
curl -1sLf https://dl.cloudsmith.io/public/malbeclabs/doublezero/setup.rpm.sh | sudo -E bash
sudo yum install doublezero
```

</div>

<div data-wizard-step="install-rpm-testnet" markdown>

Testnet에 대한 현재 권장 배포 방법:
```bash
curl -1sLf https://dl.cloudsmith.io/public/malbeclabs/doublezero-testnet/setup.rpm.sh | sudo -E bash
sudo yum install doublezero
```

</div>

<div data-wizard-step="install-network-warning" markdown>

??? info "기존 사용자 전용: *Testnet에서 Mainnet-Beta로* 또는 *Mainnet-Beta에서 Testnet으로* 패키지 변경"
    위의 패키지 저장소 중 하나에서 설치하면 해당 패키지는 DoubleZero **Testnet** 또는 **DoubleZero Mainnet Beta** 전용입니다. 네트워크를 전환하는 경우 이전에 설치된 패키지 저장소를 제거하고 대상 저장소로 업데이트해야 합니다.

    이 예시는 Testnet에서 Mainnet-Beta로의 마이그레이션을 안내합니다.

    Mainnet-Beta에서 Testnet으로 이동하는 경우에도 동일한 단계를 수행할 수 있으며, 3단계를 위의 Testnet 설치 명령어로 대체하면 됩니다.


    1. 기존 저장소 파일 찾기

        먼저, 시스템에 있는 기존 DoubleZero 저장소 설정 파일을 찾으세요:

        `find /etc/apt | grep doublezero`

        `find /usr/share/keyrings/ | grep doublezero`

    2. 기존 저장소 파일 제거

        이전 단계에서 찾은 기존 저장소 파일을 제거하세요. 예시:

        ```
        sudo rm /etc/apt/sources.list.d/malbeclabs-doublezero.list
        sudo rm /usr/share/keyrings/malbeclabs-doublezero-archive-keyring.gpg
        ```
    3. 새 저장소에서 설치

        새 Mainnet-Beta 저장소를 추가하고 최신 패키지를 설치하세요:

        ```
        curl -1sLf https://dl.cloudsmith.io/public/malbeclabs/doublezero/setup.deb.sh | sudo -E bash
        sudo apt-get install doublezero=<current_recomended_version_above>
        ```


</div>

<div data-wizard-step="install-verify-daemon" markdown>

#### `doublezerod` 상태 확인

패키지가 설치되면 새로운 systemd 유닛이 설치, 활성화 및 시작됩니다. 상태를 확인하려면 다음을 실행하세요:
```
sudo systemctl status doublezerod
```

</div>

### GRE 및 BGP를 위한 방화벽 설정

DoubleZero는 GRE 터널링(IP 프로토콜 47)과 BGP 라우팅(링크-로컬 주소의 tcp/179)을 사용합니다. 방화벽에서 이러한 프로토콜을 허용하는지 확인하세요:

iptables를 통해 GRE 및 BGP 허용:

<div data-wizard-step="firewall-gre-bgp-iptables" markdown>

```bash
sudo iptables -A INPUT -p gre -j ACCEPT
sudo iptables -A OUTPUT -p gre -j ACCEPT
sudo iptables -A INPUT -i doublezero0 -s 169.254.0.0/16 -d 169.254.0.0/16 -p tcp --dport 179 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero0 -s 169.254.0.0/16 -d 169.254.0.0/16 -p tcp --dport 179 -j ACCEPT
```

</div>

또는 UFW를 통해 GRE 및 BGP 허용:

<div data-wizard-step="firewall-gre-bgp-ufw" markdown>

```bash
sudo ufw allow proto gre from any to any
sudo ufw allow in on doublezero0 from 169.254.0.0/16 to 169.254.0.0/16 port 179 proto tcp
sudo ufw allow out on doublezero0 from 169.254.0.0/16 to 169.254.0.0/16 port 179 proto tcp
```

</div>

## 2. 새 DoubleZero 아이덴티티 생성

다음 명령어로 서버에 DoubleZero 아이덴티티를 생성하세요:

```bash
doublezero keygen
```

!!! info
    사용하려는 기존 ID가 있는 경우 다음 선택적 단계를 따를 수 있습니다.

    doublezero 설정 디렉토리 생성

    ```
    mkdir -p ~/.config/doublezero
    ```

    DoubleZero에서 사용할 `id.json`을 doublezero 설정 디렉토리로 복사하거나 링크하세요.

    ```
    sudo cp </path/to/id.json> ~/.config/doublezero/
    ```
## 3. 서버의 DoubleZero 아이덴티티 확인

DoubleZero 아이덴티티를 확인하세요. 이 아이덴티티는 귀하의 머신과 DoubleZero 간의 연결을 생성하는 데 사용됩니다.

```bash
doublezero address
```

**출력:**
```bash
YourDoubleZeroAddress11111111111111111111111111111
```

## 4. doublezerod가 DZ 디바이스를 발견했는지 확인

연결하기 전에, `doublezerod`가 사용 가능한 각 DZ 테스트넷 스위치를 발견하고 핑했는지 확인하세요:

```
doublezero latency
```

샘플 출력:

```
$ doublezero latency
 pubkey                                       | name      | ip             | min      | max      | avg      | reachable
 96AfeBT6UqUmREmPeFZxw6PbLrbfET51NxBFCCsVAnek | la2-dz01  | 207.45.216.134 |   0.38ms |   0.45ms |   0.42ms | true
 CCTSmqMkxJh3Zpa9gQ8rCzhY7GiTqK7KnSLBYrRriuan | ny5-dz01  | 64.86.249.22   |  68.81ms |  68.87ms |  68.85ms | true
 BX6DYCzJt3XKRc1Z3N8AMSSqctV6aDdJryFMGThNSxDn | ty2-dz01  | 180.87.154.78  | 112.16ms | 112.25ms | 112.22ms | true
 55tfaZ1kRGxugv7MAuinXP4rHATcGTbNyEKrNsbuVLx2 | ld4-dz01  | 195.219.120.66 | 138.15ms | 138.21ms | 138.17ms | true
 3uGKPEjinn74vd9LHtC4VJvAMAZZgU9qX9rPxtc6pF2k | ams-dz001 | 195.219.138.50 | 141.84ms | 141.97ms | 141.91ms | true
 65DqsEiFucoFWPLHnwbVHY1mp3d7MNM2gNjDTgtYZtFQ | frk-dz01  | 195.219.220.58 | 143.52ms | 143.62ms | 143.58ms | true
 9uhh2D5c14WJjbwgM7BudztdoPZYCjbvqcTPgEKtTMZE | sg1-dz01  | 180.87.102.98  | 176.66ms | 176.76ms | 176.72ms | true
```

출력에 디바이스가 반환되지 않으면 10-20초 기다린 후 다시 시도하세요.

## 5. DoubleZero 연결 해제

다음 섹션에서 DoubleZero 환경을 설정하게 됩니다. 성공을 보장하기 위해 현재 세션의 연결을 해제하세요. 이렇게 하면 머신에서 여러 터널이 열린 것과 관련된 문제를 방지할 수 있습니다.

확인

```bash
doublezero status
```

`up` 상태이면 다음을 실행하세요:

```bash
doublezero disconnect
```

### 다음 단계: 테넌트

DoubleZero 연결은 사용 사례에 따라 달라집니다. DoubleZero에서 테넌트는 유사한 사용자 프로필을 가진 그룹입니다. 예시로는 블록체인, 데이터 전송 레이어 등이 있습니다.

### [여기에서 테넌트를 선택하세요](tenant.md)


# 선택 사항: Prometheus 메트릭 활성화

Prometheus 메트릭에 익숙한 운영자는 DoubleZero 모니터링을 위해 메트릭을 활성화할 수 있습니다. 이를 통해 DoubleZero 클라이언트 성능, 연결 상태 및 운영 상태에 대한 가시성을 확보할 수 있습니다.

## 사용 가능한 메트릭

DoubleZero는 여러 주요 메트릭을 노출합니다:
- **빌드 정보**: 버전, 커밋 해시 및 빌드 날짜
- **세션 상태**: DoubleZero 세션의 활성 여부
- **연결 메트릭**: 지연 시간 및 연결 정보
- **성능 데이터**: 처리량 및 오류율

## Prometheus 메트릭 활성화

DoubleZero 클라이언트에서 Prometheus 메트릭을 활성화하려면 다음 단계를 따르세요:

### 1. doublezerod systemd 서비스 시작 명령어 수정

systemd 오버라이드 설정을 생성하거나 편집하세요:

```bash
sudo mkdir -p /etc/systemd/system/doublezerod.service.d/
sudo nano /etc/systemd/system/doublezerod.service.d/override.conf
```

다음 설정으로 교체하세요:

`-env` 플래그는 데이터를 수집하려는 네트워크에 따라 `testnet` 또는 `mainnet-beta`를 가리켜야 합니다. 샘플 블록에서는 `testnet`이 사용되었습니다. 필요한 경우 `mainnet-beta`로 교체할 수 있습니다.

```ini
[Service]
ExecStart=
ExecStart=/usr/bin/doublezerod -sock-file /run/doublezerod/doublezerod.sock -env testnet -metrics-enable -metrics-addr localhost:2113
```

### 2. 서비스 리로드 및 재시작

```bash
sudo systemctl daemon-reload
sudo systemctl restart doublezerod
sudo systemctl status doublezerod
```

### 3. 메트릭 사용 가능 여부 확인

메트릭 엔드포인트가 응답하는지 테스트하세요:

```bash
curl -s localhost:2113/metrics | grep doublezero
```

예상 출력:

```
# HELP doublezero_build_info Build information of the client
# TYPE doublezero_build_info gauge
doublezero_build_info{commit="0d684e1b",date="2025-09-10T16:30:25Z",version="0.6.4"} 1
# HELP doublezero_session_is_up Status of session to doublezero
# TYPE doublezero_session_is_up gauge
doublezero_session_is_up 0
```
## 문제 해결

메트릭이 나타나지 않는 경우:

1. **서비스 상태 확인**: `sudo systemctl status doublezerod`
2. **설정 확인**: `sudo systemctl cat doublezerod`
3. **로그 확인**: `sudo journalctl -u doublezerod -f`
4. **엔드포인트 테스트**: `curl -v localhost:2113/metrics`
5. **포트 확인**: `netstat -tlnp | grep 2113`


## Prometheus 서버 설정

설정 및 보안은 이 문서의 범위를 벗어납니다.
Grafana는 시각화를 위한 훌륭한 옵션이며, Prometheus 메트릭을 수집하는 방법을 설명하는 문서가 [여기](https://grafana.com/docs/alloy/latest/collect/prometheus-metrics/)에 있습니다.

## Grafana 대시보드 (선택 사항)

시각화를 위해 DoubleZero 메트릭을 사용하여 Grafana 대시보드를 생성할 수 있습니다. 일반적인 패널은 다음과 같습니다:
- 시간에 따른 세션 상태
- 빌드 정보
- 연결 지연 시간 추이
- 오류율 모니터링