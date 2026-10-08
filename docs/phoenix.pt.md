---
description: Obtenha dados de mercado de perpétuos Phoenix no DoubleZero Edge — Edge Connect ou multicast nativo.
---

# Conexão de Assinante Phoenix Edge

!!! warning "Ao conectar-me ao DoubleZero, concordo com os [Termos de Uso do DoubleZero](https://doublezero.xyz/terms-protocol). Por favor, note que os dados são apenas para seus fins internos e não podem ser retransmitidos (ver Seção 2(e))."

Os feeds Phoenix entregam dados de mercado de perpétuos Phoenix pela rede DoubleZero Edge como multicast UDP. Existem dois feeds:

- Top of Book (TOB): melhor oferta de compra e venda, além de impressões de negociação
- Market by Price (MBP): profundidade por nível de preço, além de impressões de negociação

## Preços {#pricing}

Os feeds são cobrados **por mês**:

| Feed | Preço |
|------|-------|
| `phoenix-tob` | $50 / mês |
| `phoenix-mbp` | $100 / mês |

## Qual caminho devo seguir? {#which-path-should-i-take}

| # | Caminho | Melhor para | Esforço |
|---|---------|-------------|---------|
| **1** | [Edge Connect](#1-edge-connect-recommended) | Agentes e aplicações que desejam uma CLI simples e JSON decodificado via WebSocket | Mais baixo |
| **2** | [Multicast nativo](#2-native-multicast-advanced) | Construir seu próprio decodificador contra o formato bruto | Mais alto |

Antes de qualquer caminho: adquira os feeds que você precisa em [doublezero.xyz/edge/subscribe](https://doublezero.xyz/edge/subscribe). Ao adquirir, você concorda com os [Termos de Uso do DoubleZero](https://doublezero.xyz/terms-protocol).

---

## 1. Edge Connect (recomendado) {#1-edge-connect-recommended}

**Comece aqui.** [doublezero-edge-connect](https://github.com/malbeclabs/doublezero-edge-connect) é o caminho amigável para agentes: um comando de instalação, o host se conecta ao DoubleZero, e sua aplicação consome **JSON decodificado via WebSocket** (`ws://<host>:8081`) em vez de decodificar multicast binário.

O Edge Connect atende às necessidades de sua base de usuários em expansão. Este é o método mais fácil de conexão e deve ser usado a menos que você tenha uma necessidade técnica específica.

Versão resumida:

```bash
curl -fsSL https://get.doublezero.xyz/connect | bash
```

O instalador solicita seu segredo: um token de acesso `DZ_…` **ou** o caminho para o JSON do keypair Solana que possui seu passe de acesso / compra de feed.

Se um `doublezerod` do host já estiver em execução, ele e o daemon do próprio container ambos vinculam a porta UDP `44880`, então o daemon do container encerra logo após iniciar. O instalador oferece parar e desabilitar o daemon do host, e o faz sem perguntar quando `DZ_ASSUME_YES=1` está definido. Para fazer você mesmo:

```bash
sudo systemctl stop doublezerod
sudo systemctl disable doublezerod
```

Em seguida, verifique o status **dentro do container** (espere `BGP Session Up` e seu grupo Phoenix) e conecte um cliente WebSocket à porta `:8081`:

```bash
docker exec doublezero-edge-connect doublezero status
```

O Edge Connect arbitra entre os publicadores Phoenix, então os clientes WebSocket veem uma cópia de cada atualização.

**Contrato WebSocket:** [PROTOCOL.md](https://github.com/malbeclabs/doublezero-edge-connect/blob/main/PROTOCOL.md).

---

## 2. Multicast nativo (avançado) {#2-native-multicast-advanced}

!!! warning "Conhecimento técnico mais profundo necessário"
    Multicast nativo significa que você se junta ao grupo por conta própria e decodifica o formato **bruto** do Edge wire no seu host. Apenas os usuários mais tecnicamente capacitados devem seguir este caminho. Você precisará ler e entender as especificações, começando por [market-by-price/spec.md](https://github.com/malbeclabs/edge-feed-spec/blob/main/market-by-price/spec.md) e o restante do [edge-feed-spec](https://github.com/malbeclabs/edge-feed-spec). Prefira o [Edge Connect](#1-edge-connect-recommended) a menos que você tenha um requisito rígido de possuir o decodificador.

### Configuração do cliente DoubleZero {#doublezero-client-setup}

Siga as instruções de [configuração](setup.md) para instalar e configurar o cliente DoubleZero. Mantenha o cliente atualizado:

```bash
sudo apt update && sudo apt install doublezero
```

### Compre um feed {#buy-a-feed}

Com o `doublezerod` em execução, identifique o dispositivo de menor latência antes de comprar:

```bash
doublezero latency
```

Compre em [https://doublezero.xyz/edge/subscribe](https://doublezero.xyz/edge/subscribe).

### Configure o firewall {#configure-the-firewall}

Permita GRE, BGP, PIM e o tráfego do feed Phoenix. As portas UDP do Phoenix estão no intervalo `9201`–`9213`: `9201`/`9202` carregam dados de mercado e referência do Top of Book, e `9211`/`9212`/`9213` carregam dados de mercado, referência e snapshot do Market by Price. Veja [Endereços dos Feeds](#feed-addresses).

**iptables:**

```bash
sudo iptables -A OUTPUT -p gre -j ACCEPT
sudo iptables -A INPUT -i doublezero1 -s 169.254.0.0/16 -d 169.254.0.0/16 -p tcp --dport 179 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero1 -s 169.254.0.0/16 -d 169.254.0.0/16 -p tcp --dport 179 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero1 -p pim -j ACCEPT
# Phoenix market / reference / snapshot (ambos os feeds)
sudo iptables -A INPUT -i doublezero1 -p udp --dport 9201:9213 -j ACCEPT
```


**UFW:**

```bash
sudo ufw allow proto gre from any to any
sudo ufw allow in on doublezero1 from 169.254.0.0/16 to 169.254.0.0/16 port 179 proto tcp
sudo ufw allow out on doublezero1 from 169.254.0.0/16 to 169.254.0.0/16 port 179 proto tcp
# Phoenix market / reference / snapshot (ambos os feeds)
sudo ufw allow in on doublezero1 to any port 9201:9213 proto udp
```

O UFW não possui protocolo `pim`. O PIM de saída é permitido pela política de saída padrão do UFW; se você negar tráfego de saída, adicione uma regra raw para PIM em `/etc/ufw/before.rules`.


### Inscreva-se {#subscribe}

Junte-se a cada feed que você comprou (cliente v0.35.0 ou posterior):

```bash
doublezero connect multicast
```

Ou nomeie os feeds por **código do feed**:

```bash
doublezero connect multicast --subscribe-feed phoenix-tob phoenix-mbp
```

Use os códigos de feed `phoenix-tob` / `phoenix-mbp`, não os nomes de feed por metro (como `phoenix-tob-cmh`) e não os códigos de grupo (`edge-phoenix-…`). Inscrever-se por código de grupo com `--subscribe` falha em um passe comprado.

Espere `✅  User Provisioned`. Aguarde cerca de 60 segundos, depois:

```bash
doublezero status
```

Espere `BGP Session Up` na rede DoubleZero correta.

```bash
doublezero user list --client-ip <your ip>
```

Seus feeds aparecem na coluna `groups`. Inspecione os IPs dos grupos com:

```bash
doublezero multicast group list
```


### Decodifique o wire você mesmo {#decode-the-wire-yourself}

A versão do schema é **`3`** — descarte datagramas cuja versão seu decodificador não implementa. Layouts autoritativos: [edge-feed-spec](https://github.com/malbeclabs/edge-feed-spec), incluindo [top-of-book/spec.md](https://github.com/malbeclabs/edge-feed-spec/blob/main/top-of-book/spec.md), [market-by-price/spec.md](https://github.com/malbeclabs/edge-feed-spec/blob/main/market-by-price/spec.md), e o [GLOSSARY](https://github.com/malbeclabs/edge-feed-spec/blob/main/GLOSSARY.md).

Cada datagrama começa com um cabeçalho de 24 bytes, seguido por uma ou mais mensagens de aplicação empacotadas até o MTU. Os datagramas são little-endian e de layout fixo.

| Campo | Notas |
|-------|-------|
| Magic | `u16` no offset 0: `0x445A` no TOB, `0x4442` no MBP. Valide-o. |
| Versão do schema | `3` |
| Channel ID | Ambos os feeds Phoenix usam o canal `1` |
| Sequence | Monotônico por endereço IP de origem, Channel ID e porta de destino — cada porta tem sua própria série. Use para detecção de gaps. |
| Send timestamp | Nanossegundos desde a época Unix |
| Message count | Mensagens empacotadas neste datagrama |
| Reset count | Qualquer mudança (incluindo o wrap de `255` → `0`) é um reset; descarte o estado do canal desse publicador. O MBP também pode incrementá-lo no meio da sessão em um re-seed do venue inteiro. |
| Datagram length | Total de bytes |

**Mais de um publicador envia cada feed Phoenix**, nos mesmos grupos, canal e portas. Indexe todo o estado de canal e instrumento pelo endereço IP de origem além do Channel ID, ou as séries de sequência de dois publicadores se intercalarão em uma só. Um assinante nativo recebe uma cópia de cada negociação por publicador.

#### Mensagens de aplicação (TOB) {#application-messages-tob}

| Tipo | ID | Tamanho | Porta | Conteúdo |
|------|----|---------|-------|----------|
| Heartbeat | `0x01` | 16 B | market | Sinal de vida enquanto o mercado está quieto |
| InstrumentDefinition | `0x02` | 130 B | reference | Símbolo, expoentes, tick e lote, vencimento |
| Quote | `0x03` | 60 B | market | Melhor oferta de compra e venda, preço e tamanho, flags de atualização |
| Trade | `0x04` | 52 B | market | Preço, tamanho, lado agressor, ID da negociação |
| EndOfSession | `0x06` | 12 B | market | Encerramento limpo |
| ManifestSummary | `0x07` | 24 B | reference | Flag de validade, contador de mudança de Manifest Seq, contagem de instrumentos, timestamp |

O Phoenix não envia `0x08` (Liquidation). O Source ID do Phoenix no registro edge-feed-spec é `2`. Leia `price_exponent` e `qty_exponent` de cada `InstrumentDefinition` — não os codifique fixamente. O expoente é a precisão do preço, não o tick: BTC no Phoenix usa expoente `-2` com tamanho de tick de `100`, então se move em dólares inteiros.

O feed MBP usa o conjunto de mensagens market-by-price. Veja as especificações market-by-price e reference-data no edge-feed-spec. Ambos os feeds vêm do mesmo processo publicador, então compartilham IDs de instrumentos, e a porta de dados de mercado do MBP carrega as mesmas impressões de negociação que o TOB. Os IDs de negociação do Phoenix são números sequenciais por mercado, então deduplicar negociações por **(instrument ID, trade ID)**, nunca por trade ID sozinho.

A entrega é UDP fire-and-forget sem retransmissão, e a porta de dados de referência não repara dados de mercado: ela apenas repete `InstrumentDefinition` (pelo menos uma vez a cada 30 s) e `ManifestSummary` (pelo menos uma vez a cada 1 s). Um Quote TOB perdido permanece perdido até que a melhor oferta de compra ou venda desse mercado mude. Apenas o MBP tem um caminho de reparo — seu ciclo de snapshot — e um cold start do MBP deve vincular a porta de snapshot.

---

## Endereços dos Feeds {#feed-addresses}

| Código do feed | Código do grupo | Descrição | Grupo multicast | Dados de mercado | Dados de referência | Snapshot |
|----------------|-----------------|-----------|-----------------|------------------|---------------------|----------|
| `phoenix-tob` | `edge-phoenix-tob` | Top-of-book e negociações de perpétuos | `233.84.178.24` | `9201` | `9202` | — |
| `phoenix-mbp` | `edge-phoenix-mbp` | Market-by-price de perpétuos | `233.84.178.25` | `9211` | `9212` | `9213` |

Inscreva-se com o código do feed; `doublezero status` e `multicast group list` mostram o código do grupo.

O grupo seleciona o feed; a porta seleciona dados de mercado, dados de referência ou snapshot dentro dele. A replicação multicast acontece por endereço IP de origem e grupo, e o fabric nunca inspeciona a porta UDP, então juntar-se a um grupo entrega tudo naquele grupo através do seu túnel DoubleZero. A porta é um filtro de socket aplicado no seu próprio host após os bytes chegarem.

---

## Solução de Problemas {#troubleshooting}

Se você encontrar um problema não coberto aqui, por favor entre em contato pelo seu canal existente antes de tentar contorná-lo. Se você não tem um canal, veja [Suporte](support/index.md).

### Certifique-se de que seu cliente está atualizado {#ensure-your-client-is-up-to-date}

Execute: `sudo apt update && sudo apt install doublezero`

### Nenhum datagrama chegando {#no-datagrams-arriving}

1. Confirme que o feed foi comprado em [https://doublezero.xyz/edge/subscribe](https://doublezero.xyz/edge/subscribe). Um feed não comprado não entrega tráfego.
2. Confirme que o BGP está ativo: `doublezero status` deve mostrar `BGP Session Up` na rede DoubleZero correta.
3. Confirme que a inscrição está ativa: `doublezero user list --client-ip <your ip>` deve listar o feed em `groups`.
4. Confirme que o grupo está ingressado na interface correta. O multicast chega em `doublezero1`, não em `doublezero0`.
5. Confirme que o firewall permite as portas UDP do feed como entrada em `doublezero1`.

### Gaps de sequência {#sequence-gaps}

Rastreie a sequência por endereço IP de origem, Channel ID e porta de destino; um decodificador indexado apenas por Channel ID vê gaps falsos. Um gap real significa datagramas descartados. No MBP, os mercados afetados se recuperam no próximo ciclo de snapshot. No TOB não há reparo: a cotação de um mercado está atual novamente quando sua melhor oferta de compra ou venda mudar.

### Mudanças no reset count {#reset-count-changes}

Qualquer mudança no reset count significa que o publicador reiniciou ou re-semeou o canal. Descarte o estado para aquele endereço IP de origem e canal, colete definições da porta de dados de referência novamente, e no MBP reconstrua os livros a partir da porta de snapshot.

### Túnel não estabelecendo {#tunnel-not-coming-up}

1. **Edge Connect:** execute o status no container — `docker exec doublezero-edge-connect doublezero status`. O `doublezero status` do host frequentemente falha enquanto o feed está funcionando (o container possui o daemon). Confirme que o `doublezerod` do host está parado.
2. **Nativo:** verifique se o daemon do host está em execução: `sudo systemctl status doublezerod`
3. Verifique se as regras de firewall estão implementadas (GRE, BGP, PIM e as portas do feed em `doublezero1`)
4. Verifique o status da conexão do mesmo lugar onde você conectou (container ou host) — espere `BGP Session Up` na rede DoubleZero correta

O IP do cliente é descoberto automaticamente a partir do IP público do seu host. Verifique se ele corresponde ao IP que você usou ao comprar o feed.

---

## Design de referência para pesquisa {#research-reference-design}

Opcional. Se você já tem um túnel DoubleZero e inscrição no host e quer **gravar e visualizar** dados do feed, o design de referência para pesquisa executa multicast → parser → topofbook-bot → ClickHouse → Grafana com Docker Compose:

[github.com/malbeclabs/edge-multicast-ref/tree/main/demo](https://github.com/malbeclabs/edge-multicast-ref/tree/main/demo)

Isto aponta a demo para o Phoenix TOB (veja [Endereços dos Feeds](#feed-addresses)):

```bash
cd demo
cp .env.example .env
sed -i -e 's/^DZ_MULTICAST_GROUP=.*/DZ_MULTICAST_GROUP=233.84.178.24/' \
       -e 's/^DZ_MARKETDATA_PORT=.*/DZ_MARKETDATA_PORT=9201/' \
       -e 's/^DZ_REFDATA_PORT=.*/DZ_REFDATA_PORT=9202/' \
       -e 's/^DZ_INTERFACE=.*/DZ_INTERFACE=doublezero1/' .env
docker compose up -d --build
```

O Grafana normalmente está em `http://localhost:3000` no host. Detalhes e dashboards: o [README da demo](https://github.com/malbeclabs/edge-multicast-ref/blob/main/demo/README.md).

Isto visualiza dados que você já está recebendo. Não substitui a compra do feed, inscrição ou qualquer um dos caminhos de conexão acima.