# IBRL 모드 검증자 메인넷-베타 연결
!!! warning "This translation was generated using artificial intelligence and has not been reviewed by a human translator. It may contain inaccuracies or errors and should not be relied upon."

!!! warning "DoubleZero에 연결함으로써 [DoubleZero 서비스 약관](https://doublezero.xyz/terms-protocol)에 동의합니다"



### IBRL 모드로 메인넷-베타에 연결

!!! Note inline end
    IBRL 모드는 기존 공개 IP 주소를 사용하므로 검증자 클라이언트를 재시작할 필요가 없습니다.

Solana 메인넷 검증자는 이 페이지에 자세히 설명된 DoubleZero 메인넷-베타 연결을 완료합니다.

각 Solana 검증자에는 고유한 **신원 키쌍**이 있으며, 이로부터 **노드 ID**로 알려진 공개 키를 추출합니다. 이것이 Solana 네트워크에서 검증자의 고유 지문입니다.

DoubleZeroID와 노드 ID가 확인되면 기계의 소유권을 증명해야 합니다. 이는 검증자의 신원 키로 서명된 DoubleZeroID를 포함하는 메시지를 생성하여 수행됩니다. 결과적인 암호화 서명은 검증자를 제어한다는 검증 가능한 증거로 사용됩니다.

마지막으로 **DoubleZero에 연결 요청을 제출**합니다. 이 요청은 다음을 전달합니다: *"제 신원이 여기 있고, 소유권 증거가 여기 있으며, 연결 방법이 여기 있습니다."* DoubleZero는 이 정보를 검증하고 증거를 수락하며 DoubleZero에서 검증자의 네트워크 액세스를 프로비저닝합니다.

이 가이드를 통해 1개의 기본 검증자가 자신을 등록하고 동시에 최대 3개의 백업/장애 조치 기계를 등록할 수 있습니다.

## 사전 요구사항

- Solana CLI 설치 및 $PATH 등록
- 검증자의 경우: sol 사용자 하에 검증자 신원 키쌍 파일(예: validator-keypair.json)에 대한 액세스 권한
- 검증자의 경우: 연결할 Solana 검증자의 신원 키에 최소 1 SOL이 있는지 확인
- 방화벽 규칙이 DoubleZero 및 Solana RPC에 대한 아웃바운드 연결을 허용해야 함 (GRE(ip proto 47) 및 BGP(169.254.0.0/16의 tcp/179) 포함)

!!! info
    검증자 ID는 Solana 가십에 대해 확인되어 대상 IP를 결정합니다. 대상 IP와 DoubleZero ID는 기계와 대상 DoubleZero 장치 간에 GRE 터널을 열 때 사용됩니다.

    고려사항: 동일한 IP에 정크 ID와 기본 ID가 있는 경우 기본 ID만 기계 등록에 사용됩니다. 정크 ID는 가십에 나타나지 않으므로 대상 기계의 IP를 확인하는 데 사용할 수 없습니다.

## 1. 환경 구성

진행하기 전에 [설정](setup.md) 지침을 따르세요.

설정의 마지막 단계는 네트워크에서 연결을 해제하는 것이었습니다. 이는 기계에 DoubleZero에 대한 터널이 하나만 열려 있고 해당 터널이 올바른 네트워크에 있도록 하기 위한 것입니다.

<div data-wizard-step="mainnet-env-config" markdown>

**DoubleZero 메인넷-베타**에 연결하도록 DoubleZero 클라이언트 CLI(`doublezero`) 및 데몬(`doublezerod`)을 구성하려면:
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
`
✅ doublezerod configured for environment mainnet-beta
`

약 30초 후 DoubleZero 장치를 볼 수 있습니다:

```bash
doublezero latency
```
예시 출력 (메인넷-베타)
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
테스트넷 출력은 구조가 동일하지만 장치 수가 더 적습니다.
</details>

</div>

## 2. 포트 44880 열기

사용자는 일부 [라우팅 기능](https://github.com/malbeclabs/doublezero/blob/main/rfcs/rfc7-client-route-liveness.md)을 활용하기 위해 포트 44880을 열어야 합니다.

포트 44880을 열려면 다음과 같이 IP 테이블을 업데이트할 수 있습니다:

<div data-wizard-step="firewall-iptables" markdown>

```
sudo iptables -A INPUT -i doublezero0 -p udp --dport 44880 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero0 -p udp --dport 44880 -j ACCEPT
```

</div>

이 규칙을 DoubleZero 인터페이스로만 제한하는 `-i doublezero0`, `-o doublezero0` 플래그에 주의하세요.

또는 UFW를 사용할 수 있습니다:

<div data-wizard-step="firewall-ufw" markdown>

```
sudo ufw allow in on doublezero0 to any port 44880 proto udp
sudo ufw allow out on doublezero0 to any port 44880 proto udp
```

</div>

이 규칙을 DoubleZero 인터페이스로만 제한하는 `in on doublezero0`, `out on doublezero0` 플래그에 주의하세요.

## 3. 검증자 소유권 증명

<div data-wizard-step="mainnet-find-validator" markdown>

DoubleZero 환경이 설정되었으면 이제 검증자 소유권을 증명할 차례입니다.

기본 검증자의 [설정](setup.md)에서 생성한 DoubleZero ID는 모든 백업 기계에서 사용해야 합니다.

기본 기계의 ID는 `doublezero address`로 찾을 수 있습니다. 동일한 ID가 클러스터의 모든 기계의 `~/.config/doublezero/id.json`에 있어야 합니다.

이를 위해 먼저 명령을 실행 중인 기계가 **기본 검증자**인지 다음 명령으로 확인합니다:

```
doublezero-solana passport find-validator -u mainnet-beta
```

이는 검증자가 가십에 등록되어 있고 리더 스케줄에 나타나는지 확인합니다.

예상 출력:

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
    동일한 워크플로우가 하나 또는 여러 기계에 사용됩니다.
    하나의 기계를 등록하려면 모든 명령에서 "--backup-validator-ids" 또는 "backup_ids=" 인수를 제외하세요.

이제 **기본 검증자**를 실행할 모든 백업 기계에서 다음을 실행합니다:
```
doublezero-solana passport find-validator -u mainnet-beta
```

예상 출력:

```
Connected to Solana: mainnet

DoubleZero ID: YourDoubleZeroAddress11111111111111111111111111111
Detected public IP: 22.22.22.222
Validator ID: ValidatorIdentity222222222222222222222222222
Gossip IP: 22.22.22.222
In Not in Leader scheduler
 ✅ This validator can only connect as a backup in DoubleZero 🖥️  🛟. It is not leader scheduled and cannot act as a primary validator.
```
이 출력은 예상된 것입니다. 백업 노드는 패스 생성 시 리더 스케줄에 있을 수 없습니다.

이제 **기본 검증자** 투표 계정과 신원을 사용할 계획인 **모든 백업 기계**에서 이 명령을 실행합니다.

</div>


<div data-wizard-step="mainnet-prepare-access" markdown>

### 연결 준비

**기본 검증자** 기계에서 다음 명령을 실행합니다. 이는 활성 지분이 있고, 리더 스케줄에 있으며, 명령을 실행 중인 기계의 Solana 가십에 기본 검증자 ID가 있는 기계입니다:

```
doublezero-solana passport prepare-validator-access -u mainnet-beta \
  --doublezero-address YourDoubleZeroAddress11111111111111111111111111111 \
  --primary-validator-id ValidatorIdentity111111111111111111111111111 \
  --backup-validator-ids ValidatorIdentity222222222222222222222222222,ValidatorIdentity33333333333333333333333333,ValidatorIdentity444444444444444444444444444>
```


예시 출력:

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
이 명령의 끝에 있는 출력에 주목하세요. 이것이 다음 단계의 구조입니다.

</div>

## 4. 서명 생성

<div data-wizard-step="mainnet-sign-message" markdown>

마지막 단계에서 `solana sign-offchain-message`에 대한 미리 형식화된 출력을 받았습니다.

위 출력에서 **기본 검증자** 기계에서 이 명령을 실행합니다.

```
  solana sign-offchain-message \
     service_key=YourDoubleZeroAddress11111111111111111111111111111,backup_ids=ValidatorIdentity222222222222222222222222222,ValidatorIdentity33333333333333333333333333,ValidatorIdentity444444444444444444444444444 \
     -k <identity-keypair-file.json>
```

**출력:**

```
  Signature111111rrNykTByK2DgJET3U6MdjSa7xgFivS9AHyhdSG6AbYTeczUNJSjYPwBGqpmNGkoWk9NvS3W7
```

</div>

## 5. DoubleZero에서 연결 요청 시작

<div data-wizard-step="mainnet-request-access" markdown>

`request-validator-access` 명령을 사용하여 연결 요청을 위한 Solana 계정을 생성합니다. DoubleZero Sentinel 에이전트가 새 계정을 감지하고 신원과 서명을 검증한 후 서버가 연결을 설정할 수 있도록 DoubleZero에 액세스 패스를 생성합니다.


노드 ID, DoubleZeroID, 서명을 사용합니다.

!!! note inline end
      이 예시에서는 검증자 신원을 찾기 위해 `-k /home/user/.config/solana/id.json`을 사용합니다. 로컬 배포에 적합한 위치를 사용하세요.

```
doublezero-solana passport request-validator-access -k <path to keypair> -u mainnet-beta \
--primary-validator-id ValidatorIdentity111111111111111111111111111 \
--backup-validator-ids ValidatorIdentity222222222222222222222222222,ValidatorIdentity33333333333333333333333333,ValidatorIdentity444444444444444444444444444 \
--signature Signature111111rrNykTByK2DgJET3U6MdjSa7xgFivS9AHyhdSG6AbYTeczUNJSjYPwBGqpmNGkoWk9NvS3W7 --doublezero-address YourDoubleZeroAddress11111111111111111111111111111
```

**출력:**

이 출력은 Solana 탐색기에서 트랜잭션을 확인하는 데 사용할 수 있습니다. 탐색기를 메인넷으로 변경해야 합니다. 이 확인은 선택 사항입니다.

```bash
Request Solana validator access: Transaction22222222VaB8FMqM2wEBXyV5THpKRXWrPtDQxmTjHJHiAWteVYTsc7Gjz4hdXxvYoZXGeHkrEayp
```

성공하면 DoubleZero가 기본을 백업과 함께 등록합니다. 이제 액세스 패스에 등록된 IP 간에 장애 조치할 수 있습니다. DoubleZero는 이 방식으로 등록된 백업 노드로 전환할 때 자동으로 연결을 유지합니다.

</div>

## 6. IBRL 모드로 연결

<div data-wizard-step="mainnet-connect-ibrl" markdown>

서버에서 DoubleZero에 연결할 사용자로 `connect` 명령을 실행하여 DoubleZero에 연결을 설정하세요.

```
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
GRE 터널이 완료될 때까지 1분 기다리세요. 터널이 완료될 때까지 상태 출력이 "down" 또는 "Unknown"을 반환할 수 있습니다.

연결을 확인하세요:

```bash
doublezero status
```

**출력:**
!!! note inline end
    이 출력을 확인하세요. `Tunnel src`와 `DoubleZero IP`가 기계의 공개 IPv4 주소와 일치하는지 주목하세요.

```bash
 Tunnel status | Last Session Update     | Tunnel Name | Tunnel src    | Tunnel dst     | Doublezero IP | User Type | Current Device | Lowest Latency Device | Metro     | Network
 up            | 2025-10-20 12:12:55 UTC | doublezero0 | 11.11.11.111 | 12.34.56.789 | 11.11.11.111 | IBRL      | ams-dz001      | ✅ ams-dz001          | Amsterdam | mainnet-beta
```
`up` 상태는 성공적으로 연결되었음을 의미합니다.

다음을 실행하여 DoubleZero의 다른 사용자가 전파한 경로를 볼 수 있습니다:

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

</div>

### 다음 단계: 멀티캐스트를 통한 Shred 발행

이 설정을 완료하고 멀티캐스트를 통한 Shred 발행을 계획하고 있다면 [다음 페이지](Validator%20Multicast%20Connection.md)로 진행하세요.
