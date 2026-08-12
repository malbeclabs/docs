---
description: Runbook orientado a LLM — compre um seat de Edge shreds e receba multicast de shreds Solana no doublezero1. Servido ao MCP via GitHub raw; não publicado no site de documentação.
---

# Subscrever shreds (Edge) — runbook

Esta página é para o DoubleZero MCP (`get_onboarding_runbook`) via GitHub raw. Não é
publicada no site de documentação.

1. Conecte o [DoubleZero MCP](mcp.md) (`https://data.doublezero.xyz/api/mcp`).
2. Informe o host Linux que irá **receber** shreds (ou SSH), a wallet/keypair para `doublezero-solana`, e qual feed (leader vs retransmit).
3. Siga os passos abaixo em ordem. Guia humano: [Edge Subscriber Connection](Edge Subscriber Connection.md).

**Como é o sucesso:** seat alocado para o epoch atual, `doublezero status` mostra o túnel ativo, shreds UDP em `doublezero1` porta `7733` (grupo leader `233.84.178.1`).

Ao conectar, o usuário concorda com os [Termos de Uso do DoubleZero](https://doublezero.xyz/terms-protocol). Os dados são para uso interno e não podem ser retransmitidos.

---

## Pré-requisitos

| Necessário | Notas |
|------------|-------|
| Host Linux/amd64 | IPv4 público, sem NAT. Na AWS: desabilitar verificação de source/dest da ENI. |
| Solana CLI + `doublezero-solana` | `sudo apt update && sudo apt install doublezero-solana` |
| Wallet | `~/.config/solana/id.json` (ou `--keypair`). Precisa de **SOL** (taxas) + **USDC** (escrow do seat). |
| USDC mint | `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v` |
| Firewall | GRE, BGP (`169.254.0.0/16` tcp/179), PIM, UDP `7733` em `doublezero1`, UDP `44880` em `doublezero0`. |

---

## Passos

### 1. Instalar cliente + pacotes

Siga o [setup](setup.md), depois:

```bash
sudo apt update && sudo apt install doublezero-solana
```

Faça backup de `~/.config/doublezero/id.json`.

### 2. Firewall

```bash
sudo iptables -A OUTPUT -p gre -j ACCEPT
sudo iptables -A INPUT -i doublezero1 -s 169.254.0.0/16 -d 169.254.0.0/16 -p tcp --dport 179 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero1 -s 169.254.0.0/16 -d 169.254.0.0/16 -p tcp --dport 179 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero1 -p pim -j ACCEPT
sudo iptables -A INPUT -i doublezero1 -p udp --dport 7733 -j ACCEPT
sudo iptables -A INPUT -i doublezero0 -p udp --dport 44880 -j ACCEPT
```

Variantes UFW: guia humano.

### 3. Habilitar o reconciler

Necessário para que os seats provisionem automaticamente o túnel.

```bash
doublezero enable
```

### 4. Wallet

```bash
solana-keygen new    # se necessário — grava em ~/.config/solana/id.json; faça backup
solana address
```

Financie com SOL e USDC.

### 5. Escolher device + preço

```bash
doublezero latency
doublezero-solana shreds price
doublezero-solana shreds price --device-code <Device_Name>
```

Anote o **device code** de menor latência e o preço do epoch (base + premium). Prefira financiar **>1 epoch**. Interface de preços: [devices](https://data.doublezero.xyz/dz/shreds/devices).

### 6. Comprar um seat (bloqueante)

No host receptor:

```bash
curl -4 -s ifconfig.me; echo
```

```bash
doublezero-solana shreds pay \
  --device-code <Device_Name> \
  --client-ip <Target_IP> \
  --amount <Cost_Of_Seat>
```

`--client-ip` deve ser o IPv4 público da máquina que receberá shreds. `--amount` é em USDC decimal (ex.: `100`) e deve atender o preço do epoch.

Se restarem menos de 10% do epoch, o CLI avisa. `--accept-partial-epoch` aceita o restante agora; caso contrário, aguarde. Escrow insuficiente no settlement → seat perdido, túnel derrubado, **tenure perdido**.

Uma vez alocado, o daemon ativa o túnel GRE.

```bash
doublezero status
doublezero-solana shreds list
```

### 7. Confirmar shreds

Shreds leader: `233.84.178.1:7733` em `doublezero1`. Descubra grupos com `doublezero multicast group list`.

| Feed | Grupo | Endereço |
|------|-------|----------|
| Leader | `edge-solana-shreds` | `233.84.178.1:7733` |
| Root | `edge-solana-root` | `233.84.178.16:7733` |
| Retransmit EU | `edge-solana-retrans-eu` | `233.84.178.12:7733` |
| Retransmit APAC | `edge-solana-retrans-apac` | `233.84.178.13:7733` |
| Retransmit AMER | `edge-solana-retrans-amer` | `233.84.178.14:7733` |

A porta `5765` é um heartbeat do publisher — não são shreds. O tráfego é encapsulado em GRE; alguns pipelines (XDP deshredders) precisam remover o GRE.

```bash
sudo tcpdump -ni doublezero1 host 233.84.178.1 and udp port 7733
```

---

## Armadilhas

1. **Reconciler desligado.** Sem `doublezero enable`, pagar não ativa o túnel.
2. **`--client-ip` ≠ IP do daemon.** A auto-descoberta deve corresponder ao seat.
3. **`Multicast user already exists`.** Desconecte primeiro: `doublezero disconnect`, depois tente `shreds pay` novamente.
4. **Valor abaixo do preço atual.** Verifique novamente `shreds price` e aumente `--amount`.
5. **Seat não alocado após pagamento.** Epoch tardio (próximo epoch), device cheio (tenure mais alto), ou saque antes do settlement.
6. **Mantenha o escrow financiado.** Recarregue com outro `shreds pay`; não deixe o saldo cair abaixo do preço do epoch.

---

## Veja também

- [Edge Subscriber Connection](Edge Subscriber Connection.md)
- [Suporte](support.md)
- Scoreboard / seats: [data.doublezero.xyz](https://data.doublezero.xyz/dz/shreds/scoreboard)