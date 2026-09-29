---
description: Obtenha dados de mercado da Kalshi no DoubleZero Edge — Edge Connect ou multicast nativo.
---

# Conexão de Assinante Kalshi Edge

!!! warning "Ao conectar-se ao DoubleZero, eu concordo com os [Termos de Uso do DoubleZero](https://doublezero.xyz/terms-protocol). Observe que os dados são apenas para seus propósitos internos e não podem ser retransmitidos (veja a Seção 2(e))."

Os feeds da Kalshi entregam dados de mercado de perps e esportes pela rede DoubleZero Edge como multicast UDP. Existem quatro feeds:

- perps Top of Book (TOB)
- perps Market by Price (MBP)
- sports Top of Book (TOB)
- sports Market by Price (MBP)

## Qual caminho devo seguir?

Dois caminhos. Prefira o Edge Connect a menos que precise controlar o decodificador.

| # | Caminho | Melhor para | Esforço |
|---|---------|-------------|---------|
| **1** | [Edge Connect](#1-edge-connect-recommended) | Agentes e aplicações que desejam uma CLI simples e um WebSocket JSON normalizado | Mais baixo |
| **2** | [Multicast nativo](#2-native-multicast-advanced) | Construir seu próprio decodificador contra o formato raw do wire | Mais alto |

Antes de qualquer caminho: adquira os feeds que você precisa em [doublezero.xyz/edge/subscribe](https://doublezero.xyz/edge/subscribe). Ao adquirir, você concorda com os [Termos de Uso do DoubleZero](https://doublezero.xyz/terms-protocol) e os [Termos de Serviço da Kalshi](https://doublezero.xyz/dz-edge-kalshi-terms).

Quer que uma IA faça a instalação com você? Conecte o [DoubleZero MCP](mcp.md) e peça para ele guiá-lo pelo Kalshi / Edge Connect.

---

## 1. Edge Connect (recomendado) {#1-edge-connect-recommended}

**Comece aqui.** [doublezero-edge-connect](https://github.com/malbeclabs/doublezero-edge-connect) é o caminho amigável para agentes: um comando de instalação, o host se junta ao DoubleZero, e sua aplicação consome **JSON normalizado via WebSocket** (`ws://<host>:8081`) em vez de decodificar multicast binário.

A equipe evolui o Edge Connect para atender às necessidades de sua base de usuários em expansão. Este é o método mais fácil de conexão e deve ser usado a menos que você tenha uma necessidade técnica específica.

Versão resumida:

```bash
DZ_SECRET=/path/to/keypair.json \
DZ_FEEDS=KALSHI \
DZ_ASSUME_YES=1 \
  curl -fsSL https://get.doublezero.xyz/connect | bash
```

`DZ_SECRET` é um token de acesso `DZ_…` **ou** o caminho para o JSON do keypair Solana que possui seu passe de acesso / compra de feed.

Se um `doublezerod` do host já estiver rodando, pare-o primeiro — ele conflita com o daemon do container pelo mesmo túnel:

```bash
sudo systemctl stop doublezerod
```

Em seguida, verifique o status **dentro do container** (espere `BGP Session Up` e seu grupo Kalshi) e conecte um cliente WebSocket na porta `:8081`:

```bash
docker exec doublezero-edge-connect doublezero status
```

**Passos completos, verificação e armadilhas:** conecte o [DoubleZero MCP](mcp.md) e peça para ele guiá-lo pelo Edge Connect para Kalshi.  
**Contrato WebSocket:** [PROTOCOL.md](https://github.com/malbeclabs/doublezero-edge-connect/blob/main/PROTOCOL.md).

---

## 2. Multicast nativo (avançado) {#2-native-multicast-advanced}

!!! warning "Conhecimento técnico aprofundado necessário"
    Multicast nativo significa que você se junta ao grupo por conta própria e decodifica o formato **raw** do wire Edge no seu host. Apenas os usuários mais tecnicamente capacitados devem seguir este caminho. Você precisará ler e entender as especificações, começando com [market-by-price/spec.md](https://github.com/malbeclabs/edge-feed-spec/blob/main/market-by-price/spec.md) e o restante do [edge-feed-spec](https://github.com/malbeclabs/edge-feed-spec). Prefira o [Edge Connect](#1-edge-connect-recommended) a menos que tenha um requisito rígido de controlar o decodificador.

### Compre um feed

Identifique o dispositivo de menor latência antes de comprar:

```bash
doublezero latency
```

Compre em [https://doublezero.xyz/edge/subscribe](https://doublezero.xyz/edge/subscribe).


### Configuração do cliente DoubleZero

Siga as instruções de [configuração](setup.md) para instalar e configurar o cliente DoubleZero. Mantenha o cliente atualizado:

```bash
sudo apt update && sudo apt install doublezero
```

### Configure o firewall

Permita GRE, BGP, PIM e o tráfego do feed Kalshi. As portas UDP da Kalshi estão no intervalo `30000`–`59999`: o primeiro dígito é a classe de tráfego (`3` dados de mercado, `4` dados de referência, `5` snapshot) e o segundo dígito é o feed, então referência é sempre mercado + `10000` e snapshot é sempre mercado + `20000`. Abra toda a faixa em `doublezero1` para que novos canais e feeds não exijam outra alteração de firewall — veja [Endereços dos Feeds](#feed-addresses).

**iptables:**

```bash
sudo iptables -A OUTPUT -p gre -j ACCEPT
sudo iptables -A INPUT -i doublezero1 -s 169.254.0.0/16 -d 169.254.0.0/16 -p tcp --dport 179 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero1 -s 169.254.0.0/16 -d 169.254.0.0/16 -p tcp --dport 179 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero1 -p pim -j ACCEPT
# Kalshi market / reference / snapshot (all feeds)
sudo iptables -A INPUT -i doublezero1 -p udp --dport 30000:59999 -j ACCEPT
```


**UFW:**

```bash
sudo ufw allow proto gre from any to any
sudo ufw allow in on doublezero1 from 169.254.0.0/16 to 169.254.0.0/16 port 179 proto tcp
sudo ufw allow out on doublezero1 from 169.254.0.0/16 to 169.254.0.0/16 port 179 proto tcp
sudo ufw allow out on doublezero1 proto pim from any to any
# Kalshi market / reference / snapshot (all feeds)
sudo ufw allow in on doublezero1 to any port 30000:59999 proto udp
```


### Inscreva-se

```bash
doublezero connect multicast --subscribe edge-kalshi-perps-tob
```

Múltiplos feeds, separados por espaço:

```bash
doublezero connect multicast --subscribe edge-kalshi-perps-tob edge-kalshi-perps-mbp edge-kalshi-sports-tob edge-kalshi-sports-mbp
```

Exemplo de saída de provisionamento:

```
DoubleZero Service Provisioning
🔗  Start Provisioning User...
Public IP detected: 137.174.145.145 - If you want to use a different IP, you can specify it with `--client-ip x.x.x.x`
    DoubleZero ID: <your dz_id>
🔍  Provisioning User for IP: <your public ip>
    The Device has been selected: <the doublezero device you are connecting to>
    Service provisioned with status: ok
✅  User Provisioned
```

Aguarde cerca de 60 segundos, depois:

```bash
doublezero status
```

Espere `BGP Session Up` na rede DoubleZero correta. Como assinante, seu IP DoubleZero corresponde ao seu Tunnel Src IP.

```bash
doublezero user list --client-ip <your ip>
```

Seus feeds aparecem na coluna `groups`. Inspecione os IPs dos grupos com:

```bash
doublezero multicast group list
```


### Decodifique o wire você mesmo

A versão do schema é **`3`** — descarte frames cuja versão seu decodificador não implementa. Layouts oficiais: [edge-feed-spec](https://github.com/malbeclabs/edge-feed-spec), incluindo [market-by-price/spec.md](https://github.com/malbeclabs/edge-feed-spec/blob/main/market-by-price/spec.md).

Todo datagrama começa com um cabeçalho de frame, seguido por uma ou mais mensagens de aplicação empacotadas até o MTU. Os frames são little-endian e de layout fixo.

| Campo | Notas |
|-------|-------|
| Versão do schema | `3` |
| Channel ID | Desmultiplexa streams que compartilham uma porta |
| Sequência | Monotônica por canal — use para detecção de gaps |
| Timestamp de envio | Nanossegundos desde a época Unix |
| Contagem de mensagens | Mensagens empacotadas neste frame |
| Contagem de reset | Avança por sessão. Um aumento significa reinício a frio do seu estado. |
| Tamanho do frame | Total de bytes |

#### Mensagens de aplicação (TOB)

| Tipo | ID | Tamanho | Porta | Conteúdo |
|------|----|---------|-------|----------|
| Heartbeat | `0x01` | 16 B | market | Liveness enquanto o mercado está quieto |
| InstrumentDefinition | `0x02` | 130 B | reference | Símbolo, expoentes, tick e lote, expiração |
| Quote | `0x03` | 60 B | market | Melhor bid e ask, preço e tamanho, flags de atualização |
| Trade | `0x04` | 52 B | market | Preço, tamanho, lado agressor, trade ID |
| ChannelReset | `0x05` | 12 B | both | Início ou reinício de sessão |
| EndOfSession | `0x06` | 12 B | both | Encerramento limpo |
| ManifestSummary | `0x07` | 24 B | reference | Fingerprint do conjunto ativo e contagem de instrumentos |
| PerpStats | `0x30` | 124 B | sibling | Funding, preços mark e oracle, open interest, volume diário |

O source ID da Kalshi no registro do edge-feed-spec é `3`. Leia `price_exponent` e `qty_exponent` de cada `InstrumentDefinition` — não os codifique de forma fixa.

Os feeds MBP usam o conjunto de mensagens market-by-price. Veja as especificações market-by-price e reference-data no edge-feed-spec.

A entrega é UDP fire-and-forget sem retransmissão. Recupere datagramas perdidos a partir do ciclo de reference-data (e do plano de snapshot nos feeds MBP), que é reemitido em uma cadência em vez de apenas uma vez.

---

## Endereços dos Feeds {#feed-addresses}

| Feed | Descrição | Grupo multicast | Dados de mercado | Dados de referência | Snapshot |
|------|-----------|-----------------|------------------|---------------------|----------|
| `edge-kalshi-perps-tob` | Perps top-of-book | `233.84.178.3` | `31000` | `41000` | — |
| `edge-kalshi-perps-mbp` | Perps market-by-price | `233.84.178.4` | `32000` | `42000` | `52000` |
| `edge-kalshi-sports-tob` | Sports top-of-book | `233.84.178.17` | `33000` + id | `43000` + id | — |
| `edge-kalshi-sports-mbp` | Sports market-by-price | `233.84.178.20` | `34000` + id | `44000` + id | `54000` + id |

Esquema de portas: o primeiro dígito é a classe de tráfego (`3` mercado, `4` referência, `5` snapshot); o segundo dígito é o feed. Referência é mercado + `10000`; snapshot é mercado + `20000`. As portas de perps são fixas. As portas de sports são `base + channel id` (por exemplo, id `10` em `edge-kalshi-sports-mbp` usa `34010` / `44010` / `54010`).

O grupo seleciona o feed; a porta seleciona dados de mercado, dados de referência ou snapshot dentro dele. A replicação multicast acontece por source e grupo, e o fabric nunca inspeciona a porta UDP, então ao se juntar a um grupo, tudo nesse grupo é entregue pelo seu link Edge Connect. A porta é um filtro de socket aplicado no seu próprio host após os bytes chegarem.

---

## Solução de Problemas

Se você encontrar um problema não coberto aqui, entre em contato pelo seu canal existente antes de tentar contorná-lo. Se você não tem um canal, veja [Suporte](support.md).

### Certifique-se de que seu cliente está atualizado

Execute: `sudo apt update && sudo apt install doublezero`

### Nenhum datagrama chegando

1. Confirme que o feed foi adquirido em [https://doublezero.xyz/edge/subscribe](https://doublezero.xyz/edge/subscribe). Um feed não adquirido não entrega tráfego.
2. Confirme que o BGP está ativo: `doublezero status` deve mostrar `BGP Session Up` na rede DoubleZero correta.
3. Confirme que a assinatura está ativa: `doublezero user list --client-ip <your ip>` deve listar o feed em `groups`.
4. Confirme que o grupo foi associado na interface correta. O multicast chega em `doublezero1`, não em `doublezero0`.
5. Confirme que o firewall permite as portas UDP do feed de entrada em `doublezero1`.

### Gaps de sequência

A sequência é monotônica por canal. Um gap significa datagramas perdidos; o próximo ciclo de reference-data restaura o estado dos instrumentos.

### Frames param e reiniciam com uma nova contagem de reset

Um reinício do publisher avança a contagem de reset no cabeçalho do frame. Descarte o estado da sessão anterior e faça um reinício a frio a partir do próximo ciclo de reference-data.

### O túnel não está subindo

1. **Edge Connect:** execute o status no container — `docker exec doublezero-edge-connect doublezero status`. O `doublezero status` do host frequentemente falha enquanto o feed está funcionando (o container possui o daemon). Confirme que o `doublezerod` do host está parado.
2. **Nativo:** verifique se o daemon do host está rodando: `sudo systemctl status doublezerod`
3. Verifique se as regras de firewall estão configuradas (GRE, BGP, PIM e as portas do feed em `doublezero1`)
4. Verifique o status da conexão a partir do mesmo lugar onde você conectou (container ou host) — espere `BGP Session Up` na rede DoubleZero correta

O IP do cliente é descoberto automaticamente a partir do IP público do seu host. Verifique se ele corresponde ao IP que você usou ao adquirir o feed.

---

## Design de referência para pesquisa

Opcional. Se você já tem um túnel DoubleZero e assinatura no host e deseja **gravar e visualizar** dados do feed, o design de referência para pesquisa executa multicast → parser → topofbook-bot → ClickHouse → Grafana com Docker Compose:

[github.com/malbeclabs/edge-multicast-ref/tree/main/demo](https://github.com/malbeclabs/edge-multicast-ref/tree/main/demo)

Aponte o `.env` para seu grupo Kalshi e portas (veja [Endereços dos Feeds](#feed-addresses)), depois:

```bash
cd demo
cp .env.example .env
# set DZ_MULTICAST_GROUP, DZ_MARKETDATA_PORT, DZ_REFDATA_PORT, DZ_INTERFACE=doublezero1
docker compose up -d --build
```

O Grafana normalmente está em `http://localhost:3000` no host. Detalhes e dashboards: o [README do demo](https://github.com/malbeclabs/edge-multicast-ref/blob/main/demo/README.md).

Isso visualiza dados que você já está recebendo. Não substitui a compra do feed, a assinatura ou qualquer um dos caminhos de conexão acima.