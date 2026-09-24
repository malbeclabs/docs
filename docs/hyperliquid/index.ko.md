---
description: "DoubleZero Hyperliquid 제공 서비스: Edge 시장 데이터 피드 및 비검증 노드를 위한 피어링."
---

# Hyperliquid

*개요*

Hyperliquid는 DoubleZero에서 두 가지 제품을 제공합니다: Edge 시장 데이터 피드와 비검증 노드를 위한 피어링입니다.

| 제공 서비스 | 설명 | 대상 | 가이드 |
| --- | --- | --- | --- |
| **시장 데이터 피드 (Edge)** | DoubleZero Edge에서 UDP 멀티캐스트로 제공되는 Top-of-Book 및 Market-by-Order. | 트레이더 | [Hyperliquid (Edge) 구독](/hyperliquid/edge/) |
| **피어링** | Block Proxy를 통한 하나의 중복 제거된 Hyperliquid 가십 피드 (시장 데이터 미포함). | 비검증 노드 | [피어링 액세스](/hyperliquid/peering/) |

## 시장 데이터 피드 (Edge)

퍼블리셔는 오더북을 재구성하고 고정 크기의 바이너리 메시지를 DoubleZero Edge를 통해 UDP 멀티캐스트로 전송합니다.

핵심 피드는 Hyperliquid 네이티브 무기한 선물(`hl`)과 [trade.xyz](https://trade.xyz) 무기한 선물(`xyz`)을 다룹니다:

| 피드 | 설명 |
|------|-------------|
| `hyper-hl-tob` | Hyperliquid 무기한 선물의 최우선 매수/매도 호가 및 체결 내역 |
| `hyper-hl-mbo` | Hyperliquid 무기한 선물의 전체 주문별 오더북 (추가, 취소, 체결) |
| `hyper-xyz-tob` | trade.xyz 무기한 선물의 최우선 매수/매도 호가 및 체결 내역 |
| `hyper-xyz-mbo` | trade.xyz 무기한 선물의 전체 주문별 오더북 (추가, 취소, 체결) |

- Top-of-Book 및 체결: 종목별 최우선 매수 및 매도 호가와 체결 내역.
- Market-by-Order: 모든 대기 주문 (추가, 취소, 체결), 인밴드 스냅샷 및 델타 복구 포함.

트레이더가 장애 조치를 하거나 가장 빠른 스트림을 선택할 수 있도록 여러 퍼블리셔를 운영합니다.

연결 방법: [Hyperliquid (Edge) 구독](/hyperliquid/edge/).

## 피어링

피어링은 시장 데이터 없이 Hyperliquid 가십이 필요한 비검증 노드를 위한 서비스입니다. Block Proxy 티어와 피어링하며, 이 프록시는 두 개의 업스트림 가십 소스(Hyper Foundation과 센트리)를 하나의 중복 제거된 피드로 병합하므로, 어느 한 소스가 중단되더라도 스트림이 멈추지 않습니다.

각 프록시는 노드에게 하나의 일반적인 가십 피어처럼 보입니다. 프록시를 추가하여 용량을 확장할 수 있으며, 피어 수가 증가해도 해당 노드의 부하는 증가하지 않습니다. 가용성 목표는 월간 99.9%입니다. 이 서비스에는 Edge 시장 데이터 피드가 포함되지 않습니다.

연결 방법: [피어링 액세스](/hyperliquid/peering/).