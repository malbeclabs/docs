---
description: Execute o doublezero-edge-connect para reencaminhar shreds Solana para uma porta UDP local e consumir dados de mercado Edge normalizados através de um WebSocket local.
---

# Conexão Edge

!!! warning "Ao conectar-me ao DoubleZero, concordo com os [Termos de Uso do DoubleZero](https://doublezero.xyz/terms-protocol). Os dados são apenas para uso interno e não podem ser retransmitidos (ver Secção 2(e))."

`doublezero-edge-connect` é uma ponte que se junta ao **multicast binário do DoubleZero Edge** e o re-serve localmente como dois feeds:

1. **Encaminhamento de shreds Solana** — shreds deduplicados (opcionalmente com verificação de assinatura) distribuídos para um ou mais destinos UDP locais, prontos para o seu validador ou RPC.
2. **Dados de mercado normalizados** — feeds de venues Edge decodificados, com precisão corrigida, e re-servidos como um único WebSocket JSON em `ws://host:8081`.

Ambos executam a partir do mesmo container e da mesma instalação de uma linha. Ative os feeds que a sua autorização onchain permitir.

```
                                        ┌─ UDP datagrams ──▶  validator / RPC
DZ Edge multicast ──▶  doublezero-edge-connect ─┤
  (binary)             (dedup · decode · normalize)  └─ WebSocket (JSON) ──▶  trading engine
                                                          ws://host:8081
```

---

## Requisitos

- Host **Linux/amd64** com um endereço IPv4 público autorizado onchain para o ambiente alvo.
- **Docker** (o comando de uma linha instala-o se estiver em falta).
- **Conectividade GRE** — permita o protocolo IP 47 no seu fornecedor de cloud; na AWS desative a verificação source/dest do ENI.
- Um **segredo de acesso DoubleZero**: um token base64 com prefixo `DZ_` ou um caminho para um ficheiro de keypair, obtido no processo de [onboarding DoubleZero](setup.md).

---

## Passo 1: Instalar e Executar

Um único comando prepara o host e inicia o container da ponte. Junta-se à rede DoubleZero e inicia todos os feeds que a sua autorização concede — encaminhamento de shreds e/ou o WebSocket de dados de mercado na porta `:8081`:

=== "Mainnet-beta"

    ```bash
    curl -fsSL https://get.doublezero.xyz/connect | bash
    ```

=== "Testnet"

    ```bash
    curl -fsSL https://get.doublezero.xyz/connect-testnet | bash
    ```

=== "Devnet (privada)"

    ```bash
    # Requer um token GHCR com read:packages
    DZ_GHCR_TOKEN=<your-token> curl -fsSL https://get.doublezero.xyz/connect-devnet | bash
    ```

O que o script faz:

1. Verifica que o host é Linux/amd64.
2. Carrega o seu segredo de acesso (solicitado uma vez se `DZ_SECRET` não estiver definido) e **verifica o passe de acesso onchain antes de instalar qualquer coisa** — uma verificação pura do lado do host contra o JSON-RPC público do ledger. Se o passe estiver vinculado a um IP diferente do host, aborta (quando o IP foi dado explicitamente via `DZ_CLIENT_IP`) ou avisa e continua (quando o IP foi apenas auto-detetado, o que pode estar errado atrás de NAT), deixando `doublezero connect` como a verificação real.
3. Garante que o Docker está presente (oferece-se para instalá-lo) e prepara o kernel do host para o túnel GRE: carrega `tun`/`ip_gre`, aumenta `net.core.rmem_max`, avisa sobre regras de firewall e fornecedor de cloud.
4. Executa o container da ponte (`--network host`, `NET_ADMIN`/`NET_RAW`, `/dev/net/tun`) e executa `doublezero connect multicast`.

!!! tip "Instalação não-interativa"
    Defina `DZ_SECRET=DZ_…` antes do pipe para executar completamente sem supervisão — sem prompts de todo.

---

## Passo 2: Configurar

Toda a configuração é feita via **variáveis de ambiente definidas antes do pipe**. Não existe ficheiro de configuração.

```bash
DZ_SECRET=DZ_… VAR=value curl -fsSL https://get.doublezero.xyz/connect | bash
```

### Variáveis do instalador

| Variável | Padrão | Finalidade |
|----------|--------|------------|
| `DZ_SECRET` | *(solicitado)* | Token base64 com prefixo `DZ_` **ou** caminho para um ficheiro de keypair. Um token é injetado no container e nunca escrito em disco; um ficheiro é montado em bind como apenas leitura. |
| `DZ_ENV` | por script | `mainnet-beta` \| `testnet` \| `devnet`. |
| `DZ_IMAGE` | por script | Substituir a imagem do container. |
| `DZ_NAME` | `doublezero-edge-connect` | Nome do container. |
| `DZ_FEEDS` | *(todos)* | Venues separadas por vírgula para restringir a ingestão de dados de mercado (ex.: `VenueA,VenueB`). Não afeta o encaminhamento de shreds Solana. |
| `DZ_CLIENT_IP` | *(auto-detetado)* | Substituir o IPv4 público usado pela pré-verificação do passe de acesso onchain. Defina-o quando a auto-deteção estiver errada (ex.: atrás de NAT) para que a pré-verificação possa confirmar em vez de apenas avisar. |
| `DZ_LEDGER_RPC_URL` | por env | Substituir o endpoint RPC do ledger DoubleZero usado pela pré-verificação. |
| `DZ_ASSUME_YES` | `0` | Ignorar prompts de confirmação (ex.: o prompt de instalação do Docker). |
| `DZ_GHCR_TOKEN` | — | **Apenas Devnet** — um token GHCR com `read:packages` (a imagem devnet é privada). |
| `DZ_GHCR_USER` | `malbeclabs` | **Apenas Devnet** — nome de utilizador GHCR para o login. |

### Variáveis da ponte

O instalador encaminha **qualquer** variável da ponte **não vazia** diretamente para o container. As mais comuns:

| Variável | Padrão | Finalidade |
|----------|--------|------------|
| `DZ_IFACE` | `doublezero1` | Interface de rede para escutar. |
| `DZ_RECV_BUF` | `8388608` | Substituição do buffer de receção UDP (bytes; padrão 8 MiB). |
| `METRICS_BIND` | *(vazio / desligado)* | Ativar o endpoint Prometheus `/metrics` (ex.: `127.0.0.1:9090`). |
| `RUST_LOG` | `warn,doublezero_edge_connect=info` | Nível de log (`debug`, `warn`, etc.). |
| `DZ_SHRED_FORWARD` | — | Destino(s) UDP local(is) para shreds encaminhados — ver [Encaminhamento de Shreds Solana](#encaminhamento-de-shreds-solana). |
| `WS_BIND` | `0.0.0.0:8081` | Endereço de bind do WebSocket de dados de mercado — ver [WebSocket de Dados de Mercado](#websocket-de-dados-de-mercado). |
| `WS_MAX_CLIENTS` | `64` | Máximo de clientes WebSocket simultâneos. |
| `WS_INPUT_COINS` | *(vazio / desligado)* | Ativar o backstop do WebSocket público Hyperliquid para símbolos listados (ex.: `BTC,ETH`) — ver [Fontes de entrada](#fontes-de-entrada-e-o-backstop-websocket). |
| `WS_INPUT_URL` | `wss://api.hyperliquid.xyz/ws` | URL do WebSocket público Hyperliquid para o backstop. |
| `PHOENIX_WS_INPUT_MARKETS` | *(vazio / desligado)* | Ativar o backstop do WebSocket público Phoenix (apenas trades) para tickers listados (ex.: `SOL,BTC`). |
| `PHOENIX_WS_INPUT_URL` | `wss://perp-api.phoenix.trade/v1/ws` | URL do WebSocket público Phoenix para o backstop. |

**Exemplos:**

```bash
# Encaminhar shreds para um validador/RPC local:
DZ_SECRET=DZ_… DZ_SHRED_FORWARD=127.0.0.1:20000 \
  curl -fsSL https://get.doublezero.xyz/connect | bash

# Não-interativo, testnet:
DZ_SECRET=DZ_… curl -fsSL https://get.doublezero.xyz/connect-testnet | bash

# Restringir dados de mercado a venues específicas, logging verboso, porta WS não-padrão:
DZ_SECRET=DZ_… DZ_FEEDS=VenueA,VenueB RUST_LOG=debug WS_BIND=0.0.0.0:9000 \
  curl -fsSL https://get.doublezero.xyz/connect | bash

# Ativar métricas e um backstop WS público:
DZ_SECRET=DZ_… METRICS_BIND=127.0.0.1:9090 WS_INPUT_COINS=BTC,ETH \
  curl -fsSL https://get.doublezero.xyz/connect | bash
```

!!! note
    O instalador encaminha apenas valores **não vazios**, com uma exceção: `WS_BIND` é encaminhado mesmo quando definido como vazio, portanto `WS_BIND=""` **desativa** efetivamente o sink WebSocket através do comando de uma linha. Para qualquer outra variável, uma substituição vazia não pode ser passada pelo pipe — use um `docker run` escrito manualmente para isso (ver [Self-hosting](#avancado-self-hosting)).

---

## Encaminhamento de Shreds Solana

A ponte junta-se aos grupos multicast de shreds `edge-solana-*` e distribui cada datagrama para um ou mais destinos UDP locais — alimentando o seu validador ou RPC diretamente a partir da rede Edge. Ativa-se automaticamente na descoberta quando esses grupos estão presentes na sua autorização.

```bash
# Padrão (apenas dedup, encaminhar para porta local 20000):
DZ_SHRED_FORWARD=127.0.0.1:20000 DZ_SECRET=DZ_… curl -fsSL https://get.doublezero.xyz/connect | bash

# Com verificação de assinatura:
DZ_SHRED_DEDUP_MODE=sigverify \
  DZ_SHRED_RPC_URL=https://api.mainnet-beta.solana.com \
  DZ_SHRED_FORWARD=127.0.0.1:20000 \
  DZ_SECRET=DZ_… curl -fsSL https://get.doublezero.xyz/connect | bash
```

| Variável | Padrão | Finalidade |
|----------|--------|------------|
| `DZ_SHRED_FORWARD` | `127.0.0.1:20000` | Destino(s) para shreds encaminhados (repetível). |
| `DZ_SHRED_DISABLE` | `0` | Desativação principal (`--shred-forward-disable`). Mantém o encaminhador desligado independentemente do que a sua autorização concede — defina-o quando nenhum consumidor local está a escutar, para evitar gastar CPU a encaminhar o fluxo de shreds para lugar nenhum. |
| `DZ_SHRED_DEDUP_MODE` | `dedup` | `dedup` (uma cópia por shred), `sigverify` (+ verificação ed25519), `none` (todos os datagramas). |
| `DZ_SHRED_RPC_URL` | — | Endpoint RPC Solana; necessário pelo modo `sigverify`. |
| `DZ_SHRED_DEDUP_WINDOW_SLOTS` | `512` | Tamanho da janela de dedup. |

Ver [Encaminhamento de shreds](https://github.com/malbeclabs/doublezero-edge-connect/blob/main/docs/shred-forwarding.md) para o pipeline completo e ressalvas.

---

## WebSocket de Dados de Mercado

Abra um WebSocket para `ws://<host>:8081` e leia frames JSON. Recebe todas as venues para as quais está autorizado. Uma mensagem `subscribe` opcional restringe o stream a venues e símbolos específicos.

Qualquer engine que fale WebSocket + JSON pode consumi-lo com um adaptador fino (~50–100 linhas). O multicast binário, a divisão de duas portas por venue, e o handshake de manifesto/precisão ficam todos dentro da ponte; o único contrato contra o qual um consumidor programa é o WebSocket JSON.

!!! note
    O sink WebSocket inicia apenas quando pelo menos um feed de dados de mercado está ativo para a sua autorização — um host apenas de shreds não serve WebSocket. A ativação é conduzida por um reconciliador de subscrições onchain que atualiza a cada 30s (`--subscription-refresh-secs`); `--subscription-gating-disable` desativa o gating.

### Ciclo de vida da conexão

Em cada nova conexão, a ponte:

1. **Reproduz as definições de instrumentos atuais** — uma mensagem `instrument` por símbolo conhecido — para que o consumidor tenha a precisão antes da primeira cotação.
2. **Reproduz o último snapshot de profundidade** por símbolo (se o feed Market-by-Order estiver ativo).
3. **Transmite** mensagens `quote` / `trade` / `midpoint` / `depth` à medida que chegam, distribuídas para todos os consumidores conectados.

```
connect → instrument (×N) → depth (×M, latest books) → quote → trade → depth → …
```

### Tipos de mensagem

Cada mensagem é um objeto JSON identificado por um campo `type`:

| `type` | Significado |
|--------|-------------|
| `instrument` | Definição de instrumento/precisão. |
| `quote` | Atualização do topo do livro (estado completo). |
| `trade` | Impressão de trade (última venda). |
| `midpoint` | Preço médio derivado. |
| `depth` | Snapshot completo da profundidade do livro de ordens. |
| `status` | Transição de saúde do feed ao nível da venue. |

Os consumidores **devem ignorar valores `type` desconhecidos e campos desconhecidos** (compatibilidade futura).

#### `instrument`

```json
{"type":"instrument","venue":"ExampleVenue","symbol":"SOL","price_exponent":-2,"qty_exponent":-2}
```

Enviado na conexão e sempre que as definições mudam. `price_exponent` e `qty_exponent` fornecem o tick size e o size step da venue como potências de dez.

#### `quote`

```json
{
  "type": "quote",
  "venue": "ExampleVenue",
  "symbol": "SOL",
  "bid": 184.20, "ask": 184.21,
  "bid_size": 12.5, "ask_size": 8.0,
  "bid_n": 3, "ask_n": 2,
  "source_ts_ns": 1781019263715344015,
  "recv_ts_ns":   1781019263715501230,
  "kernel_rx_ts_ns": 1781019263715300010,
  "ws_send_ts_ns":   1781019263715600440
}
```

Cada `quote` é **estado completo** — uma mensagem perdida auto-recupera na próxima cotação, sem necessidade de resincronização. Os quatro timestamps decompõem a latência ponta-a-ponta:

```
source_ts_ns → kernel_rx_ts_ns → recv_ts_ns → ws_send_ts_ns → (consumer recv)
  venue book      wire arrival      post-decode    WS hand-off
```

`0` é o sentinela para "não disponível" — trate-o como ausente, não como 1970.

#### `trade`

```json
{
  "type": "trade",
  "venue": "ExampleVenue", "symbol": "SOL",
  "price": 184.20, "size": 3.5,
  "aggressor_side": "buy",
  "trade_id": 987654, "cumulative_volume": 12500.0,
  "source_ts_ns": ..., "recv_ts_ns": ...,
  "kernel_rx_ts_ns": ..., "ws_send_ts_ns": ...
}
```

`aggressor_side` é `"buy"`, `"sell"`, ou `"unknown"`. Trades são eventos pontuais e não são reproduzidos na reconexão.

#### `depth`

```json
{
  "type": "depth",
  "venue": "MboVenue", "symbol": "SOL",
  "bids": [[184.20, 12.5], [184.19, 4.0]],
  "asks": [[184.21, 8.0], [184.22, 6.5]],
  "source_ts_ns": ..., "recv_ts_ns": ...,
  "kernel_rx_ts_ns": ..., "ws_send_ts_ns": ...
}
```

`bids` são ordenados pelo preço mais alto primeiro; `asks` são ordenados pelo preço mais baixo primeiro. Cada `depth` é um **snapshot completo** — substitua, não faça merge.

#### `status`

```json
{"type":"status","venue":"ExampleVenue","state":"down","stale_ms":30000,"ts_ns":...}
```

Emitido no edge quando o multicast de cotações de uma venue fica silencioso (`state:"down"`) ou recupera (`state:"ok"`). Use-o para desativar visualmente uma venue na sua UI. A entrega de cotações não é condicionada pelo status — o feed auto-recupera na próxima cotação.

### Subscrições

Por defeito recebe tudo. Envie uma mensagem de controlo para restringir o stream:

```json
{"method":"subscribe","subscription":{"venue":"ExampleVenue","symbol":"SOL"}}
{"method":"unsubscribe","subscription":{"venue":"ExampleVenue","symbol":"SOL"}}
```

Omitir um campo corresponde a qualquer valor (`{"symbol":"SOL"}` = SOL em todas as venues). `venue` é comparado sem distinção de maiúsculas/minúsculas.

**Confirmação do servidor:**

```json
{"channel":"subscription_response","method":"subscribe","subscription":{"venue":"ExampleVenue","symbol":"SOL"}}
```

Erros retornam `{"channel":"error","error":"<reason>"}`.

### Heartbeat e liveness

- O servidor envia um **WebSocket Ping** a cada 20 segundos; clientes conformes respondem automaticamente com Pong.
- Clientes silenciosos durante 60 segundos são fechados e descartados.
- Keepalive ao nível da aplicação: `{"method":"ping"}` → `{"channel":"pong"}`.

### Esqueleto de consumidor

```python
import json, websocket

def on_message(ws, frame):
    msg = json.loads(frame)
    t = msg.get("type")
    if t == "instrument":
        register_instrument(msg["venue"], msg["symbol"],
                            msg["price_exponent"], msg["qty_exponent"])
    elif t == "quote":
        on_top_of_book(msg["venue"], msg["symbol"],
                       msg["bid"], msg["ask"],
                       msg["bid_size"], msg["ask_size"])
    elif t == "trade":
        on_trade(msg["venue"], msg["symbol"],
                 msg["price"], msg["size"], msg["aggressor_side"])
    elif t == "depth":
        replace_book(msg["venue"], msg["symbol"],
                     msg["bids"], msg["asks"])
    # tipos desconhecidos: ignorar silenciosamente (compatibilidade futura)

ws = websocket.WebSocketApp("ws://localhost:8081", on_message=on_message)
ws.run_forever()
```

### Fontes de entrada e o backstop WebSocket

O feed multicast Edge está sempre ativo. **Backstops de WebSocket público** opcionais podem preencher lacunas quando o feed Edge fica parado. Dois estão disponíveis, cada um desligado por defeito e ativado independentemente por venue:

| Backstop | Ativar com | Cobre | URL padrão |
|----------|------------|-------|------------|
| **Hyperliquid** | `WS_INPUT_COINS` (ex.: `BTC,ETH`) | cotações + trades | `wss://api.hyperliquid.xyz/ws` (`WS_INPUT_URL`) |
| **Phoenix** | `PHOENIX_WS_INPUT_MARKETS` (tickers, ex.: `SOL,BTC`) | **apenas trades** | `wss://perp-api.phoenix.trade/v1/ws` (`PHOENIX_WS_INPUT_URL`) |

```bash
# Ativar o backstop Hyperliquid para BTC e ETH:
WS_INPUT_COINS=BTC,ETH DZ_SECRET=DZ_… curl -fsSL https://get.doublezero.xyz/connect | bash

# Ativar o backstop de trades Phoenix para SOL:
PHOENIX_WS_INPUT_MARKETS=SOL DZ_SECRET=DZ_… curl -fsSL https://get.doublezero.xyz/connect | bash
```

Para cada tick `(venue, symbol, source_ts)`, as fontes Edge e pública competem dentro de um árbitro partilhado. Em estado estável, a fonte Edge ganha (sub-ms vs. dezenas de ms pela internet); quando o Edge falha, a cópia pública preenche. A saída WebSocket é idêntica independentemente de qual fonte entregou uma dada atualização. (Os backstops Phoenix cobrem apenas trades — o Edge permanece a única fonte de cotações Phoenix.)

---

## Gerir o Container

```bash
# Transmitir logs
sudo docker logs -f doublezero-edge-connect

# Verificar estado do túnel
sudo docker exec -it doublezero-edge-connect doublezero status

# Verificar latências do dispositivo
sudo docker exec -it doublezero-edge-connect doublezero latency

# Parar e remover
sudo docker stop doublezero-edge-connect && sudo docker rm doublezero-edge-connect
```

!!! note "Sem TLS"
    A ponte destina-se a uma rede de confiança/local. Termine TLS num reverse proxy se expuser o endpoint WebSocket externamente.

---

## Monitorização (Métricas Prometheus)

O endpoint de métricas está **desligado por defeito**. Ative-o com `METRICS_BIND`:

```bash
METRICS_BIND=127.0.0.1:9090 DZ_SECRET=DZ_… curl -fsSL https://get.doublezero.xyz/connect | bash
```

Depois faça scrape:

```bash
curl -s localhost:9090/metrics | grep '^dz_'
```

Métricas principais:

| Métrica | O que rastreia |
|---------|---------------|
| `dz_feed_up{venue}` | `1` enquanto o multicast dessa venue está ativo, `0` enquanto silencioso. |
| `dz_datagrams_received_total{venue}` | Volume de ingestão por venue. |
| `dz_emit_total{venue,kind}` | Mensagens emitidas após dedup, por tipo. |
| `dz_quotes_admitted_total{venue,publisher}` | Cotações admitidas pelo árbitro, atribuídas à fonte vencedora. Um aumento em `publisher="public"` significa que um backstop está a preencher uma lacuna do Edge (vs. `publisher="edge"` em estado estável). |
| `dz_quotes_dropped_total{venue}` | Cotações obsoletas/duplicadas suprimidas. |
| `dz_ws_clients` | Clientes WebSocket atualmente conectados. |
| `dz_ws_messages_sent_total{kind}` | Mensagens encaminhadas para clientes. |
| `dz_ws_client_lagged_total` | Vezes que um cliente lento foi descartado para proteger o feed. |

Uma sonda de liveness `GET /healthz` também é servida no mesmo endereço de bind.

---

## Avançado: Self-hosting

O container está disponível no GHCR:

| Ambiente | Imagem | Tag |
|----------|--------|-----|
| Mainnet-beta | `ghcr.io/malbeclabs/doublezero-edge-connect` | `:mainnet-beta` |
| Testnet | `ghcr.io/malbeclabs/doublezero-edge-connect` | `:testnet` |
| Devnet (privada) | `ghcr.io/malbeclabs/doublezero-edge-connect-devnet` | `:latest` |

Execute manualmente (necessário para opções que o instalador não consegue encaminhar, como `WS_BIND=""`):

```bash
docker run --rm --network host --cap-add NET_ADMIN --device /dev/net/tun \
  -e DZ_SECRET=DZ_… \
  -e DZ_SHRED_FORWARD=127.0.0.1:20000 \
  -e WS_BIND=0.0.0.0:8081 \
  -e METRICS_BIND=127.0.0.1:9090 \
  ghcr.io/malbeclabs/doublezero-edge-connect:mainnet-beta
```

**Compilar a partir do código-fonte:**

```bash
git clone https://github.com/malbeclabs/doublezero-edge-connect
cd doublezero-edge-connect
cargo build --release
cargo test

./target/release/doublezero-edge-connect \
  --iface doublezero1 \
  --ws-bind 0.0.0.0:8081
```

Um buffer de receção do kernel maior é recomendado para feeds com picos:

```bash
sudo sysctl -w net.core.rmem_max=268435456
```

---

## Limites e Contrapressão

| Limite | Padrão | Comportamento quando excedido |
|--------|--------|-------------------------------|
| Clientes simultâneos (`WS_MAX_CLIENTS`) | 64 | Nova conexão é rejeitada. |
| Subscrições por cliente (`WS_MAX_SUBS`) | 256 | `subscribe` é recusado com um erro. |
| Msgs de controlo de entrada / cliente / min (`WS_MAX_INBOUND_PER_MIN`) | 600 | Cliente é desconectado. |
| Buffer de broadcast (`WS_BROADCAST_CAPACITY`) | 4096 | Um cliente lento **descarta as mensagens mais antigas** (nunca bloqueia o feed). |

Como cada `quote` e `depth` é estado completo, um consumidor que perca mensagens sob contrapressão auto-recupera na próxima mensagem — sem necessidade de handshake de resincronização.

---

## Resolução de Problemas

### Nenhum shred a chegar à porta local

- Confirme que o seu acesso está autorizado para os grupos de shreds `edge-solana-*` onchain.
- Verifique se o túnel está ativo: `sudo docker exec -it doublezero-edge-connect doublezero status`
- Verifique os logs para erros de join: `sudo docker logs -f doublezero-edge-connect`
- Confirme que `DZ_SHRED_FORWARD` aponta para um destino UDP local acessível.

### Sem mensagens de uma venue

- Verifique se o túnel está ativo: `sudo docker exec -it doublezero-edge-connect doublezero status`
- Verifique os logs para erros de join: `sudo docker logs -f doublezero-edge-connect`
- Confirme que o seu acesso está autorizado para essa venue onchain.
- Restrinja a ingestão a essa venue com `DZ_FEEDS=<VenueName>` para isolar o problema.

### WebSocket conecta mas não chegam cotações

- As mensagens `instrument` chegam sempre primeiro; as cotações seguem quando o handshake de dados de referência completa. Aguarde 10–20 segundos após a conexão antes de concluir que os dados estão em falta.
- Verifique `dz_feed_up{venue}` nas métricas — `0` significa que o multicast está silencioso no seu host.
- Verifique se as regras de firewall permitem UDP multicast na interface `doublezero1`.

### `dz_ws_client_lagged_total` elevado

O seu consumidor está a ler mais devagar do que a ponte está a publicar. Aumente o buffer de broadcast com `WS_BROADCAST_CAPACITY`, reduza o tempo de processamento por mensagem, ou adicione uma thread de leitura dedicada.

### Container encerra imediatamente

- A ponte requer `--network host` e o dispositivo `/dev/net/tun`; um `docker run` simples sem essas flags falhará.
- Use o comando de uma linha do instalador ou o comando `docker run` exato mostrado em [Self-hosting](#avancado-self-hosting).

### Túnel GRE não estabelece

Consulte [Resolução de Problemas](troubleshooting.md) e assegure que o protocolo IP 47 é permitido no seu fornecedor de cloud. Na AWS, desative a verificação source/dest do ENI para o host.