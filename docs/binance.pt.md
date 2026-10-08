---
description: Obtenha dados de mercado de Binance Spot e futuros USD-M no DoubleZero Edge — Edge Connect ou multicast nativo.
---

# Conexão de Assinante Binance Edge

!!! warning "Ao conectar-me ao DoubleZero, concordo com os [Termos de Uso do DoubleZero](https://doublezero.xyz/terms-protocol). Note que os dados são apenas para seus fins internos e não podem ser retransmitidos (veja a Seção 2(e))."

Os feeds da Binance entregam dados de mercado top-of-book da Binance através da rede DoubleZero Edge como multicast UDP. Os dados são ingeridos da Binance em Tóquio e transportados pela fibra dedicada do DoubleZero, de modo que chegam a outras metros antes do que a internet pública os entrega. A Binance é onde ocorre a formação de preços de muitos pares spot, então seus dados são um indicador antecedente para outros mercados.

Existem dois feeds, um por motor de matching da Binance:

| Feed | Instrumentos | Timestamp da quote |
|------|-------------|-----------------|
| Binance Spot | Todos os pares spot em negociação, incluindo pares cotados em moeda fiduciária | Horário de envio do gateway, precisão de µs |
| Binance USD-M | Perpétuos cotados em USDT e USDC. Futuros com vencimento e perpétuos TradFi não estão incluídos | Horário do motor de matching, precisão de ms |

O conjunto de instrumentos acompanha as listagens da Binance: pares e contratos são adicionados e removidos à medida que entram e saem de negociação.

## Preços {#pricing}

Os feeds são cobrados **por mês**:

| Feed | Preço |
|------|-------|
| Binance Spot | $100 / mês |
| Binance USD-M | $100 / mês |

## Qual caminho devo seguir? {#which-path-should-i-take}

| # | Caminho | Melhor para | Esforço |
|---|------|----------|--------|
| **1** | [Edge Connect](#1-edge-connect-recommended) | Agentes e aplicações que desejam uma CLI simples e JSON decodificado via WebSocket | Mais baixo |
| **2** | [Multicast nativo](#2-native-multicast-advanced) | Construir seu próprio decodificador contra o formato bruto do wire | Mais alto |

Antes de qualquer caminho: adquira os feeds que você precisa em [doublezero.xyz/edge/subscribe](https://doublezero.xyz/edge/subscribe). Ao adquirir, você concorda com os [Termos de Uso do DoubleZero](https://doublezero.xyz/terms-protocol).

---

## 1. Edge Connect (recomendado) {#1-edge-connect-recommended}

**Comece aqui.** [doublezero-edge-connect](https://github.com/malbeclabs/doublezero-edge-connect) é o caminho amigável para agentes: um comando de instalação, o host se junta ao DoubleZero, e sua aplicação consome **JSON decodificado via WebSocket** (`ws://<host>:8081`) em vez de decodificar multicast binário.

O Edge Connect atende às necessidades de sua base de usuários em expansão. Este é o método de conexão mais fácil e deve ser usado a menos que você tenha uma necessidade técnica específica.

Versão resumida:

```bash
curl -fsSL https://get.doublezero.xyz/connect | bash
```

O instalador solicita seu segredo: um token de acesso `DZ_…` **ou** o caminho para o JSON do keypair Solana que possui seu passe de acesso / compra de feed.

Se um `doublezerod` do host já estiver em execução, ele e o daemon do próprio contêiner ambos vinculam a porta UDP `44880`, então o daemon do contêiner encerra logo após iniciar. O instalador oferece parar e desabilitar o daemon do host, e faz isso sem perguntar quando `DZ_ASSUME_YES=1` está definido. Para fazer manualmente:

```bash
sudo systemctl stop doublezerod
sudo systemctl disable doublezerod
```

Em seguida, verifique o status **dentro do contêiner** (espere `BGP Session Up` e seu grupo Binance) e conecte um cliente WebSocket à porta `:8081`:

```bash
docker exec doublezero-edge-connect doublezero status
```

Toda mensagem da Binance no WebSocket carrega `"source_name":"BINANCE"`. Os motores compartilham esse nome, então diferencie-os pelo `source_id`: `8` é Spot e `6` é USD-M. O mesmo símbolo pode existir em ambos — `BTCUSDT` é um par spot em um e um perpétuo no outro — e os instrument IDs são atribuídos por motor, então indexe por `source_id` além do símbolo ou instrument ID.

**Contrato WebSocket:** [PROTOCOL.md](https://github.com/malbeclabs/doublezero-edge-connect/blob/main/PROTOCOL.md).

---

## 2. Multicast nativo (avançado) {#2-native-multicast-advanced}

!!! warning "Conhecimento técnico mais aprofundado necessário"
    Multicast nativo significa que você mesmo se junta ao grupo e decodifica o formato **bruto** do wire Edge no seu host. Apenas os usuários tecnicamente mais capazes devem seguir este caminho. Você precisará ler e entender as especificações, começando por [top-of-book/spec.md](https://github.com/malbeclabs/edge-feed-spec/blob/main/top-of-book/spec.md) e o restante do [edge-feed-spec](https://github.com/malbeclabs/edge-feed-spec). Prefira o [Edge Connect](#1-edge-connect-recommended) a menos que você tenha um requisito rígido de possuir o decodificador.

### Configuração do cliente DoubleZero {#doublezero-client-setup}

Siga as instruções de [configuração](setup.md) para instalar e configurar o cliente DoubleZero. Mantenha o cliente atualizado:

```bash
sudo apt update && sudo apt install doublezero
```

### Comprar um feed {#buy-a-feed}

Com o `doublezerod` em execução, identifique o dispositivo de menor latência antes de comprar:

```bash
doublezero latency
```

Compre em [https://doublezero.xyz/edge/subscribe](https://doublezero.xyz/edge/subscribe).

### Configurar o firewall {#configure-the-firewall}

Permita GRE, BGP, PIM e o tráfego do feed Binance. Ambos os feeds publicam dados de mercado na porta UDP `30001` e dados de referência na `30002`; eles são diferenciados pelo grupo multicast, não pela porta. Veja [Endereços dos Feeds](#feed-addresses).

**iptables:**

```bash
sudo iptables -A OUTPUT -p gre -j ACCEPT
sudo iptables -A INPUT -i doublezero1 -s 169.254.0.0/16 -d 169.254.0.0/16 -p tcp --dport 179 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero1 -s 169.254.0.0/16 -d 169.254.0.0/16 -p tcp --dport 179 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero1 -p pim -j ACCEPT
# Binance market / reference (both feeds)
sudo iptables -A INPUT -i doublezero1 -p udp --dport 30001:30002 -j ACCEPT
```

**UFW:**

```bash
sudo ufw allow proto gre from any to any
sudo ufw allow in on doublezero1 from 169.254.0.0/16 to 169.254.0.0/16 port 179 proto tcp
sudo ufw allow out on doublezero1 from 169.254.0.0/16 to 169.254.0.0/16 port 179 proto tcp
# Binance market / reference (both feeds)
sudo ufw allow in on doublezero1 to any port 30001:30002 proto udp
```

O UFW não possui protocolo `pim`. O PIM de saída é permitido pela política de saída padrão do UFW; se você negar tráfego de saída, adicione uma regra raw para PIM em `/etc/ufw/before.rules`.

### Inscrever-se {#subscribe}

Junte-se a cada feed que você comprou (cliente v0.35.0 ou posterior):

```bash
doublezero connect multicast
```

Inscrever-se por código de grupo com `--subscribe` falha em um passe comprado.

Espere `✅  User Provisioned`. Aguarde cerca de 60 segundos, depois:

```bash
doublezero status
```

Espere `BGP Session Up` na rede DoubleZero correta.

```bash
doublezero user list --client-ip <your ip>
```

Seus feeds aparecem na coluna `groups`. Inspecione os IPs do grupo com:

```bash
doublezero multicast group list
```

### Decodificar o wire por conta própria {#decode-the-wire-yourself}

A versão do schema é **`3`** — descarte datagramas cuja versão seu decodificador não implementa. Layouts autoritativos: [edge-feed-spec](https://github.com/malbeclabs/edge-feed-spec), incluindo [top-of-book/spec.md](https://github.com/malbeclabs/edge-feed-spec/blob/main/top-of-book/spec.md), o [Registro de Source IDs](https://github.com/malbeclabs/edge-feed-spec/blob/main/sources/spec.md) e o [GLOSSÁRIO](https://github.com/malbeclabs/edge-feed-spec/blob/main/GLOSSARY.md).

Cada datagrama começa com um cabeçalho de datagrama de 24 bytes, seguido por uma ou mais mensagens de aplicação empacotadas até o MTU. Os datagramas são little-endian e de layout fixo.

| Campo | Notas |
|-------|-------|
| Magic | `u16` no offset 0: `0x445A`. Valide-o. |
| Versão do schema | `3` |
| Channel ID | Spot usa o canal `1`, USD-M o canal `0` |
| Sequence | Monotônico por endereço IP de origem, Channel ID e porta de destino — cada porta tem sua própria série. Use para detecção de lacunas. |
| Send timestamp | Nanossegundos desde a época Unix |
| Message count | Mensagens empacotadas neste datagrama |
| Reset count | Qualquer alteração (incluindo o wrap `255` → `0`) é um reset; descarte o estado do canal daquele publicador. |
| Datagram length | Total de bytes |

#### Mensagens de aplicação {#application-messages}

| Tipo | ID | Tamanho | Porta | Contém |
|------|----|------|------|---------|
| Heartbeat | `0x01` | 16 B | market | Liveness enquanto o mercado está quieto |
| InstrumentDefinition | `0x02` | 130 B | reference | Símbolo, expoentes, tick e lote, expiração |
| Quote | `0x03` | 60 B | market | Melhor bid e ask, preço e tamanho, flags de atualização |
| Trade | `0x04` | 52 B | market | Preço, tamanho, lado agressor, trade ID |
| EndOfSession | `0x06` | 12 B | market | Encerramento limpo |
| ManifestSummary | `0x07` | 24 B | reference | Flag de validade, contador de alteração de Manifest Seq, contagem de instrumentos, timestamp |

**O Source ID é a chave do motor.** Ambos os feeds usam o código de venue `BINANCE`, mas cada motor tem seu próprio Source ID no registro edge-feed-spec: `8` Binance Spot, `6` Binance USD-Margined Futures. Os motores listam símbolos sobrepostos (`BTCUSDT` é tanto um par spot quanto um perpétuo USD-M), e cada motor atribui instrument IDs de forma independente, então o mesmo instrument ID pode aparecer em ambos os feeds para instrumentos diferentes. Indexe instrumentos e livros por **(Source ID, instrument ID)**, nunca apenas pelo símbolo ou instrument ID. Leia `price_exponent` e `qty_exponent` de cada `InstrumentDefinition` — não os codifique fixamente. O expoente é a precisão do preço, não o tick: o incremento negociável é `tick_size × 10^price_exponent`.

A entrega é UDP fire-and-forget sem retransmissão, e a porta de dados de referência não repara dados de mercado: ela apenas repete `InstrumentDefinition` (pelo menos uma vez a cada 30 s em ambos os feeds) e `ManifestSummary` (pelo menos uma vez a cada 1 s no USD-M, a cada 5 s no Spot). Uma Quote perdida permanece perdida até que o melhor bid ou ask daquele instrumento mude. Deduplique trades por **(Source ID, instrument ID, trade ID)**, nunca por trade ID sozinho.

A Binance consolida as atualizações de melhor bid e ask antes que cheguem ao feed: sob carga, uma atualização superada de um símbolo é descartada em favor da mais recente. Menos quotes do que alterações no livro é comportamento normal do venue, não perda — use o número de sequência do datagrama para detectar perdas.

Detalhes dos dados de referência que diferem do que um decodificador poderia supor:

- **Timestamps.** `Quote` e `Trade` do USD-M carregam o horário do motor de matching, com precisão de milissegundos. `Quote` do Spot carrega o horário de envio do gateway e `Trade` do Spot o horário de execução, ambos com precisão de microssegundos. Todos são expressos em nanossegundos no wire.
- **`Leg1` tem 8 bytes.** Ativos base mais longos (por exemplo `1000FLOKI` ou `BROCCOLI714`) são truncados; o nome completo está sempre em `Symbol`.
- **Nem todo símbolo é ASCII.** Alguns perpétuos USD-M têm nomes em chinês, e seus `Symbol` e `Leg1` carregam bytes UTF-8. Não presuma ASCII ao decodificar esses campos.
- **`Expiry` é `0`** em todos os instrumentos USD-M, já que todos são perpétuos.
- **`Bid Source Count` e `Ask Source Count` são sempre `0`.** A Binance não publica contagens de ordens no topo do livro.
- **O USD-M exclui ordens Retail Price Improvement (RPI)** do melhor bid e ask, então pode diferir de um snapshot de profundidade que as inclua.

---

## Endereços dos Feeds {#feed-addresses}

| Código do grupo | Motor | Source ID | Channel ID | Grupo multicast | Dados de mercado | Dados de referência |
|------------|--------|-----------|------------|-----------------|-------------|----------------|
| `edge-binance-spot-tob` | Spot | `8` | `1` | `233.84.178.31` | `30001` | `30002` |
| `edge-binance-usdsm-tob` | Perpétuos USD-M | `6` | `0` | `233.84.178.23` | `30001` | `30002` |

`doublezero status` e `multicast group list` mostram o código do grupo.

O grupo seleciona o feed; a porta seleciona dados de mercado ou dados de referência dentro dele. A replicação multicast acontece por endereço IP de origem e grupo, e o fabric nunca inspeciona a porta UDP, então juntar-se a um grupo entrega tudo naquele grupo através do seu túnel DoubleZero. A porta é um filtro de socket aplicado no seu próprio host após os bytes chegarem. Como os feeds compartilham portas, um socket vinculado à `30001` em um host que se juntou aos dois grupos Binance recebe ambos; filtre pelo grupo de destino ou pelo Source ID.

---

## Solução de Problemas {#troubleshooting}

Se você encontrar um problema não coberto aqui, entre em contato pelo seu canal existente antes de contorná-lo. Se você não tem um canal, veja [Suporte](support/index.md).

### Certifique-se de que seu cliente está atualizado {#ensure-your-client-is-up-to-date}

Execute: `sudo apt update && sudo apt install doublezero`

### Nenhum datagrama chegando {#no-datagrams-arriving}

1. Confirme que o feed foi adquirido em [https://doublezero.xyz/edge/subscribe](https://doublezero.xyz/edge/subscribe). Um feed não adquirido não entrega tráfego.
2. Confirme que o BGP está ativo: `doublezero status` deve mostrar `BGP Session Up` na rede DoubleZero correta.
3. Confirme que a assinatura está ativa: `doublezero user list --client-ip <your ip>` deve listar o feed em `groups`.
4. Confirme que o grupo está vinculado na interface correta. O multicast chega em `doublezero1`, não em `doublezero0`.
5. Confirme que o firewall permite as portas UDP `30001`–`30002` de entrada em `doublezero1`.

### Dois motores misturados {#two-engines-mixed-together}

Spot e USD-M listam símbolos como `BTCUSDT`, atribuem instrument IDs de forma independente e compartilham portas. Um decodificador que indexa livros apenas pelo símbolo ou instrument ID, ou que vincula um único socket para todos os grupos sem verificar o grupo de destino, mescla dois instrumentos diferentes em um só livro. Indexe pelo Source ID (ou pelo grupo de destino) além do instrument ID.

### Lacunas de sequência {#sequence-gaps}

Rastreie a sequência por endereço IP de origem, Channel ID e porta de destino; um decodificador indexado apenas por Channel ID verá lacunas falsas. Uma lacuna real significa datagramas perdidos. Não há reparo: a quote de um instrumento volta a ser atual quando seu melhor bid ou ask mudar novamente.

### Alterações no reset count {#reset-count-changes}

Qualquer alteração no reset count significa que aquele publicador reiniciou ou fez re-seed do canal. Descarte o estado para aquele endereço IP de origem e canal, e colete as definições da porta de dados de referência novamente.

### Túnel não subindo {#tunnel-not-coming-up}

1. **Edge Connect:** execute o status no contêiner — `docker exec doublezero-edge-connect doublezero status`. O `doublezero status` do host frequentemente falha enquanto o feed está funcionando (o contêiner possui o daemon). Confirme que o `doublezerod` do host está parado.
2. **Nativo:** verifique se o daemon do host está em execução: `sudo systemctl status doublezerod`
3. Verifique se as regras de firewall estão configuradas (GRE, BGP, PIM e as portas do feed em `doublezero1`)
4. Verifique o status da conexão do mesmo local de onde você se conectou (contêiner ou host) — espere `BGP Session Up` na rede DoubleZero correta

O IP do cliente é descoberto automaticamente a partir do IP público do seu host. Verifique se ele corresponde ao IP que você usou ao adquirir o feed.

---

## Design de referência para pesquisa {#research-reference-design}

Opcional. Se você já tem um túnel DoubleZero e assinatura no host e quer **gravar e visualizar** dados do feed, o design de referência para pesquisa executa multicast → parser → topofbook-bot → ClickHouse → Grafana com Docker Compose:

[github.com/malbeclabs/edge-multicast-ref/tree/main/demo](https://github.com/malbeclabs/edge-multicast-ref/tree/main/demo)

Isso aponta o demo para Binance Spot. Para outro feed, use seu grupo de [Endereços dos Feeds](#feed-addresses):

```bash
cd demo
cp .env.example .env
sed -i -e 's/^DZ_MULTICAST_GROUP=.*/DZ_MULTICAST_GROUP=233.84.178.31/' \
       -e 's/^DZ_MARKETDATA_PORT=.*/DZ_MARKETDATA_PORT=30001/' \
       -e 's/^DZ_REFDATA_PORT=.*/DZ_REFDATA_PORT=30002/' \
       -e 's/^DZ_INTERFACE=.*/DZ_INTERFACE=doublezero1/' .env
docker compose up -d --build
```

O Grafana normalmente está em `http://localhost:3000` no host. Detalhes e dashboards: o [README do demo](https://github.com/malbeclabs/edge-multicast-ref/blob/main/demo/README.md).

Isso visualiza dados que você já está recebendo. Não substitui a compra do feed, a assinatura ou qualquer um dos caminhos de conexão acima.
