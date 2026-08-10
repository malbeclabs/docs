---
description: 연결된 검증자가 리더 shred를 DoubleZero 멀티캐스트 엣지 피드에 게시하도록 구성합니다.
---

# 검증자 멀티캐스트 연결
!!! warning "DoubleZero에 연결함으로써 [DoubleZero 서비스 약관](https://doublezero.xyz/terms-protocol)에 동의합니다"

!!! note inline end "트레이딩 회사 및 기업"
    트레이딩 회사나 기업을 운영하며 피드 구독을 원하신다면 [여기](https://doublezero.xyz/edge-form)에서 관심 등록을 하시면 추가 정보를 받으실 수 있습니다.

아직 DoubleZero에 연결하지 않으셨다면 [설정](<setup.md>) 및 [Mainnet-Beta](<DZ Mainnet-beta Connection.md>) 검증자 연결 문서를 먼저 완료해 주세요.

이미 DoubleZero에 연결된 검증자라면 이 가이드를 계속 진행하셔도 됩니다.

## 1. 클라이언트 구성

### Jito-Agave (v3.1.9+) 및 Harmonic (3.1.11+)

1. 검증자 시작 스크립트에 다음을 추가하세요: `--shred-receiver-address 233.84.178.1:7733`

    Jito와 `edge-solana-shreds` 그룹에 동시에 전송할 수 있습니다.

    예시:

    ```json
    #!/bin/bash
    export PATH="/home/sol/.local/share/solana/install/releases/v3.1.9-jito/bin:$PATH"
    BLOCK_ENGINE_URL=https://ny.mainnet.block-engine.jito.wtf
    RELAYER_URL=http://ny.mainnet.relayer.jito.wtf:8100
    SHRED_RECEIVER_ADDR=<JitoBlockEngineAddress>
    <...The rest of your config...>
    --shred-receiver-address 233.84.178.1:7733
    ```

2. 검증자를 재시작하세요.
3. DoubleZero 멀티캐스트 그룹 `edge-solana-shreds`에 게시자로 연결하세요: `doublezero connect ibrl && doublezero connect multicast --publish edge-solana-shreds`

### Frankendancer

1. `config.toml`에 다음을 추가하세요:

    ```toml
    [tiles.shred]
    additional_shred_destinations_leader = [ "233.84.178.1:7733", ]
    ```

2. 검증자를 재시작하세요.
3. DoubleZero 멀티캐스트 그룹 `edge-solana-shreds`에 게시자로 연결하세요: `doublezero connect ibrl && doublezero connect multicast --publish edge-solana-shreds`

## 2. 리더 shred 게시 확인

연결이 완료되면 [이 대시보드](https://data.doublezero.xyz/dz/publisher-check)에서 shred를 게시하고 있는지 확인할 수 있습니다. 최소 하나의 슬롯에 대해 리더 shred를 게시한 후에야 확인 결과가 표시됩니다.

## 멀티캐스트 엔드포인트 (IP vs 포트)

shred 트래픽의 경우 **IP 주소**가 멀티캐스트 피드를 선택하고 **포트**가 UDP 서비스를 선택합니다.  
아래 모든 피드는 UDP 포트 `7733`을 사용합니다.

현재 그룹 IP는 다음 명령으로 확인할 수 있습니다:

```bash
doublezero multicast group list
```

- `edge-solana-shreds` (리더): `233.84.178.1:7733`
- `edge-solana-retrans-eu`: `233.84.178.12:7733`
- `edge-solana-retrans-apac`: `233.84.178.13:7733`
- `edge-solana-retrans-amer`: `233.84.178.14:7733`

API 참조 및 기계 판독 가능한 데이터 엔드포인트는 [https://data.doublezero.xyz/api/v1/docs](https://data.doublezero.xyz/api/v1/docs)를 참조하세요.

## 3. 검증자 보상

검증자가 리더 shred를 게시한 각 에포크에 대해 구독 기반으로 기여도에 비례하여 보상을 받게 됩니다. 이 시스템의 세부 사항은 추후 발표 및 상세 안내될 예정입니다.

## 문제 해결

### 리더 Shred가 게시되지 않는 경우:

shred를 전송하지 못하는 가장 흔한 원인은 클라이언트 버전입니다:

Jito-Agave 3.1.9+, JitoBam 3.1.9+, Frankendancer, 또는 Harmonic 3.1.11+을 실행해야 합니다. 다른 클라이언트 버전은 작동하지 않습니다.

### 재전송 문제:

1. shred 재전송의 일반적인 원인은 간단한 구성 문제입니다. 시작 스크립트에서 재전송 shred를 보내는 플래그가 활성화되어 있을 수 있으며, 이를 비활성화해야 합니다.

    Jito-Agave에서 제거해야 할 플래그: `--shred-retransmit-receiver-address`.

1. [게시자 대시보드](https://data.doublezero.xyz/dz/publisher-check)를 확인하여 재전송된 shred가 있는지 살펴보세요. 테이블에서 **No Retransmit Shreds** 열을 확인하세요—빨간색 X가 표시되면 재전송 중임을 의미합니다.

    !!! note "에포크 뷰"
        게시자 대시보드를 볼 수 있는 다양한 시간 범위가 있습니다. **2 에포크 뷰**에서 재전송이 보이지만 최근에 변경을 했다면 **최근 슬롯** 뷰로 전환해 보세요.


    ![게시자 확인 대시보드](images/publisher-check-dashboard.png)

2. 클라이언트 IP를 찾고 [DoubleZero Data](https://data.doublezero.xyz/dz/users)에서 사용자를 조회하세요.

    ![DoubleZero Data 사용자](images/doublezero-data-users.png)

3. **Multicast**를 클릭하여 멀티캐스트 뷰를 여세요.

    아래 스크린샷은 다음을 보여줍니다: **재전송 중** (바람직하지 않음) 리더 슬롯 패턴 없이 지속적인 아웃바운드 트래픽이 발생합니다.

    ![사용자 멀티캐스트 뷰 - 재전송 예시](images/user-multicast-view-retransmit.png)

    아래 스크린샷은 다음을 보여줍니다: **정상** (리더 shred만 게시) 아웃바운드 트래픽이 스파이크 형태로 나타나며, 톱니파 패턴으로 알려진 이 패턴이 리더 슬롯과 일치합니다.

    ![사용자 멀티캐스트 뷰 - 정상 게시자 예시](images/user-multicast-view-healthy.png)

차트는 리더 shred만 전송하고 있는지를 보여줍니다. 트래픽 스파이크는 리더 슬롯이 있는 시점과 일치해야 합니다. 리더 슬롯이 없을 때는 트래픽이 없어야 합니다. 재전송 중이라면 슬롯 정렬 스파이크 대신 지속적인 트래픽 흐름이 보일 것입니다.