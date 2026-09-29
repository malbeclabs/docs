---
description: Obtenha dados de mercado da Kalshi no DoubleZero Edge — Edge Connect ou multicast nativo.
---

# Conexão de Assinante Kalshi Edge

!!! warning "Ao conectar-me ao DoubleZero, concordo com os [Termos de Uso do DoubleZero](https://doublezero.xyz/terms-protocol). Observe que os dados são apenas para seus fins internos e não podem ser retransmitidos (veja a Seção 2(e))."

Os feeds da Kalshi entregam dados de mercado de perps e esportes pela rede DoubleZero Edge como multicast UDP. Existem quatro feeds:

- perps Top of Book (TOB)
- perps Market by Price (MBP)
- sports Top of Book (TOB)
- sports Market by Price (MBP)

## Qual caminho devo seguir?

| # | Caminho | Ideal para | Esforço |
|---|---------|------------|---------|
| **1** | [Edge Connect](#1-edge-connect-recommended) | Agentes e aplicações que desejam um CLI simples e JSON decodificado via WebSocket | Mais baixo |
| **2** | [Multicast nativo](#2-native-multicast-advanced) | Construir seu próprio decodificador contra o formato bruto do fio | Mais alto |

Antes de qualquer caminho: adquira os feeds que você precisa em [doublezero.xyz/edge/subscribe](https://doublezero.xyz/edge/subscribe). Ao adquirir, você concorda com os [Termos de Uso do DoubleZero](https://doublezero.xyz/terms-protocol) e os [Termos de Serviço da Kalshi](https://doublezero.xyz/dz-edge-kalshi-terms).

Quer que uma IA faça a instalação com você? Conecte o [DoubleZero MCP](mcp.md) e peça para ele guiá-lo pelo Kalshi / Edge Connect.

---

## 1. Edge Connect (recomendado) {#1-edge-connect-recommended}

**Comece aqui.** [doublezero-edge-connect](https://github.com/malbeclabs/doublezero-edge-connect) é o caminho amigável para agentes: um comando de instalação, o host se junta ao DoubleZero, e sua aplicação consome **JSON decodificado via WebSocket** (`ws://<host>:8081`) em vez de decodificar multicast binário.

O Edge Connect atende às necessidades de sua base de usuários em expansão. Este é o método mais fácil de conexão e deve ser usado a menos que você tenha uma necessidade técnica específica.

Versão resumida:

```bash
curl -fsSL https://get.doublezero.xyz/connect | \
  DZ_SECRET=/path/to/keypair.json DZ_FEEDS=KALSHI DZ_ASSUME_YES=1 bash
```

As variáveis vão após o pipe para que o instalador (`bash`) as receba. `DZ_SECRET` é um token de acesso `DZ_…` **ou** o caminho para o JSON do keypair Solana que possui seu passe de acesso / compra de feed.

Se um `doublezerod` do host já estiver em execução, ele e o daemon do próprio container fazem bind na porta UDP `44880`, então o daemon do container encerra logo após iniciar. O instalador oferece parar e desabilitar o daemon do host, e faz isso sem perguntar quando `DZ_ASSUME_YES=1` está definido. Para fazer isso manualmente:

```bash
sudo systemctl stop doublezerod
sudo systemctl disable doublezerod
```

Em seguida, verifique o status **dentro do container** (espere `BGP Session Up` e seu grupo Kalshi) e conecte um cliente WebSocket na porta `:8081`:

```bash
docker exec doublezero-edge-connect doublezero status
```

**Passos completos, verificação e armadilhas:** conecte o [DoubleZero MCP](mcp.md) e peça para ele guiá-lo pelo Edge Connect para Kalshi.  
**Contrato do WebSocket:** [PROTOCOL.md](https://github.com/malbeclabs/doublezero-edge-connect/blob/main/PROTOCOL.md).

---

## 2. Multicast nativo (avançado) {#2-native-multicast-advanced}

!!! warning "Conhecimento técnico mais aprofundado necessário"
    Multicast nativo significa que você se junta ao grupo por conta própria e decodifica o formato **bruto** do fio Edge no seu host. Apenas os usuários mais tecnicamente capacitados devem seguir este caminho. Você precisará ler e entender as especificações, começando por [market-by-price/spec.md](https://github.com/malbeclabs/edge-feed-spec/blob/main/market-by-price/spec.md) e o restante de [edge-feed-spec](https://github.com/malbeclabs/edge-feed-spec). Prefira o [Edge Connect](#1-edge-connect-recommended) a menos que você tenha um requisito rígido de possuir o decodificador.

### Configuração do cliente DoubleZero

Siga as instruções de [configuração](setup.md) para instalar e configurar o cliente DoubleZero. Mantenha o cliente atualizado:

```bash
sudo apt update && sudo apt install doublezero
```

### Compre um feed

Com o `doublezerod` em execução, identifique o dispositivo de menor latência antes de comprar:

```bash
doublezero latency
```

Compre em [https://doublezero.xyz/edge/subscribe](https://doublezero.xyz/edge/subscribe).

### Configure o firewall

Permita GRE, BGP, PIM e o tráfego do feed Kalshi. As portas UDP da Kalshi ficam no intervalo `30000`–`59999`: o primeiro dígito é a classe de tráfego (`3` dados de mercado, `4` dados de referência, `5` snapshot) e o segundo dígito é o feed, então referência é sempre mercado + `10000` e snapshot é sempre mercado + `20000`. Abra a faixa completa em `doublezero1` para que novos canais e feeds não exijam outra alteração de firewall — veja [Endereços dos Feeds](#feed-addresses).

**iptables:**

```bash
sudo iptables -A OUTPUT -p gre -j ACCEPT
sudo iptables -A INPUT -i doublezero1 -s 169.254.0.0/16 -d 169.254.0.0/16 -p tcp --dport 179 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero1 -s 169.254.0.0/16 -d 169.254.0.0/16 -p tcp --dport 179 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero1 -p pim -j ACCEPT
# Kalshi market / reference / snapshot (todos os feeds)
sudo iptables -A INPUT -i doublezero1 -p udp --dport 30000:59999 -j ACCEPT
```


**UFW:**

```bash
sudo ufw allow proto gre from any to any
sudo ufw allow in on doublezero1 from 169.254.0.0/16 to 169.254.0.0/16 port 179 proto tcp
sudo ufw allow out on doublezero1 from 169.254.0.0/16 to 169.254.0.0/16 port 179 proto tcp
# Kalshi market / reference / snapshot (todos os feeds)
sudo ufw allow in on doublezero1 to any port 30000:59999 proto udp
```

O UFW não tem protocolo `pim`. O PIM de saída é permitido pela política padrão de saída do UFW; se você negar tráfego de saída, adicione uma regra raw para PIM em `/etc/ufw/before.rules`.


### Assine

Junte-se a cada feed que você comprou (cliente v0.35.0 ou posterior):

```bash
doublezero connect multicast
```

Ou nomeie os feeds pelo **código do feed**, separados por espaço:

```bash
doublezero connect multicast --subscribe-feed kalshi-perps-tob kalshi-perps-mbp kalshi-sports-tob kalshi-sports-mbp
```

Use os códigos de feed (`kalshi-…`), não os nomes de feed por metro e não os códigos de grupo (`edge-kalshi-…`). Assinar por código de grupo com `--subscribe` falha em um passe comprado.

Espere `✅  User Provisioned`. Aguarde cerca de 60 segundos, então:

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


### Decodifique o fio você mesmo

A versão do schema é **`3`** — descarte datagramas cuja versão seu decodificador não implementa. Layouts oficiais: [edge-feed-spec](https://github.com/malbeclabs/edge-feed-spec), incluindo [market-by-price/spec.md](https://github.com/malbeclabs/edge-feed-spec/blob/main/market-by-price/spec.md).

Cada datagrama abre com um cabeçalho de datagrama de 24 bytes, seguido por uma ou mais mensagens de aplicação empacotadas até o MTU. Os datagramas são little-endian e de layout fixo.

| Campo | Notas |
|-------|-------|
| Magic | `u16` no offset 0: `0x445A` em TOB, `0x4442` em MBP. Valide-o. |
| Versão do schema | `3` |
| Channel ID | Demultiplexa canais compartilhando uma porta |
| Sequence | Monotônico por endereço IP de origem, Channel ID e porta de destino — cada porta tem sua própria série. Use para detecção de lacunas. |
| Timestamp de envio | Nanossegundos desde a época Unix |
| Contagem de mensagens | Mensagens empacotadas neste datagrama |
| Contagem de reset | Qualquer alteração (incluindo o wrap `255` → `0`) é um reset; descarte o estado do canal daquele publicador. MBP também pode incrementá-lo no meio da sessão em uma re-semeadura geral do venue. |
| Comprimento do datagrama | Total de bytes |

#### Mensagens de aplicação (TOB)

| Tipo | ID | Tamanho | Porta | Conteúdo |
|------|----|---------|-------|----------|
| Heartbeat | `0x01` | 16 B | market | Sinal de vida enquanto o mercado está parado |
| InstrumentDefinition | `0x02` | 130 B | reference | Símbolo, expoentes, tick e lote, expiração |
| Quote | `0x03` | 60 B | market | Melhor bid e ask, preço e tamanho, flags de atualização |
| Trade | `0x04` | 52 B | market | Preço, tamanho, lado agressor, trade ID |
| EndOfSession | `0x06` | 12 B | market | Encerramento limpo |
| ManifestSummary | `0x07` | 24 B | reference | Flag válida, contador de alteração do Manifest Seq, contagem de instrumentos, timestamp |
| PerpStats | `0x30` | 124 B | sibling | Funding, preços mark e oracle, interesse aberto, volume diário |

O Source ID da Kalshi no registro edge-feed-spec é `3`. Leia `price_exponent` e `qty_exponent` de cada `InstrumentDefinition` — não os codifique fixamente.

Os feeds MBP usam o conjunto de mensagens market-by-price. Consulte as especificações market-by-price e reference-data em edge-feed-spec.

A entrega é UDP fire-and-forget sem retransmissão, e a porta de reference-data não repara dados de mercado: ela apenas repete `InstrumentDefinition` (pelo menos uma vez a cada 30 s) e `ManifestSummary` (pelo menos uma vez a cada 1 s). Um Quote TOB perdido permanece perdido até que o melhor bid ou ask daquele mercado mude. Apenas os feeds MBP têm um caminho de reparo — o ciclo de snapshot — e uma inicialização a frio de MBP deve fazer bind na porta de snapshot. Deduplique trades por **(instrument ID, trade ID)**, nunca apenas por trade ID.

---

## Endereços dos Feeds {#feed-addresses}

| Código do feed | Código do grupo | Descrição | Grupo multicast | Dados de mercado | Dados de referência | Snapshot |
|----------------|-----------------|-----------|-----------------|------------------|---------------------|----------|
| `kalshi-perps-tob` | `edge-kalshi-perps-tob` | Perps top-of-book | `233.84.178.3` | `31000` | `41000` | — |
| `kalshi-perps-mbp` | `edge-kalshi-perps-mbp` | Perps market-by-price | `233.84.178.4` | `32000` | `42000` | `52000` |
| `kalshi-sports-tob` | `edge-kalshi-sports-tob` | Sports top-of-book | `233.84.178.17` | `33000` + id | `43000` + id | — |
| `kalshi-sports-mbp` | `edge-kalshi-sports-mbp` | Sports market-by-price | `233.84.178.20` | `34000` + id | `44000` + id | `54000` + id |

Assine com o código do feed; `doublezero status` e `multicast group list` mostram o código do grupo.

Esquema de portas: o primeiro dígito é a classe de tráfego (`3` mercado, `4` referência, `5` snapshot); o segundo dígito é o feed. Referência é mercado + `10000`; snapshot é mercado + `20000`. As portas de perps são fixas. As portas de sports são `base + channel id` (por exemplo, id `10` em `edge-kalshi-sports-mbp` usa `34010` / `44010` / `54010`).

O grupo seleciona o feed; a porta seleciona dados de mercado, dados de referência ou snapshot dentro dele. A replicação multicast acontece por endereço IP de origem e grupo, e a malha nunca inspeciona a porta UDP, então juntar-se a um grupo entrega tudo naquele grupo através do seu túnel DoubleZero. A porta é um filtro de socket aplicado no seu próprio host depois que os bytes chegam.

---

## Solução de Problemas

Se você encontrar um problema não coberto aqui, entre em contato pelo seu canal existente antes de tentar contorná-lo. Se você não tem um canal, consulte [Suporte](support.md).

### Certifique-se de que seu cliente está atualizado

Execute: `sudo apt update && sudo apt install doublezero`

### Nenhum datagrama chegando

1. Confirme que o feed foi adquirido em [https://doublezero.xyz/edge/subscribe](https://doublezero.xyz/edge/subscribe). Um feed não adquirido não entrega tráfego.
2. Confirme que o BGP está ativo: `doublezero status` deve mostrar `BGP Session Up` na rede DoubleZero correta.
3. Confirme que a assinatura está ativa: `doublezero user list --client-ip <your ip>` deve listar o feed em `groups`.
4. Confirme que o grupo está associado na interface correta. O multicast chega em `doublezero1`, não em `doublezero0`.
5. Confirme que o firewall permite as portas UDP do feed como entrada em `doublezero1`.

### Lacunas de sequência

Rastreie a sequência por endereço IP de origem, Channel ID e porta de destino; um decodificador indexado apenas por Channel ID verá lacunas falsas. Uma lacuna real significa datagramas descartados. Em feeds MBP, os mercados afetados se recuperam no próximo ciclo de snapshot. Em feeds TOB não há reparo: a cotação de um mercado fica atualizada novamente quando seu melhor bid ou ask mudar.

### Alterações na contagem de reset

Qualquer alteração na contagem de reset significa que aquele publicador reiniciou ou re-semeou o canal. Descarte o estado para aquele endereço IP de origem e canal, colete as definições da porta de reference-data novamente, e em feeds MBP reconstrua os livros a partir da porta de snapshot.

### Túnel não subindo

1. **Edge Connect:** execute o status no container — `docker exec doublezero-edge-connect doublezero status`. O `doublezero status` do host frequentemente falha enquanto o feed está funcionando (o container possui o daemon). Confirme que o `doublezerod` do host está parado.
2. **Nativo:** verifique se o daemon do host está em execução: `sudo systemctl status doublezerod`
3. Verifique se as regras de firewall estão aplicadas (GRE, BGP, PIM e as portas do feed em `doublezero1`)
4. Verifique o status da conexão do mesmo lugar de onde você conectou (container ou host) — espere `BGP Session Up` na rede DoubleZero correta

O IP do cliente é auto-descoberto a partir do IP público do seu host. Verifique se ele corresponde ao IP que você usou ao adquirir o feed.

---

## Design de referência para pesquisa

Opcional. Se você já tem um túnel DoubleZero e assinatura no host e deseja **gravar e visualizar** dados do feed, o design de referência para pesquisa executa multicast → parser → topofbook-bot → ClickHouse → Grafana com Docker Compose:

[github.com/malbeclabs/edge-multicast-ref/tree/main/demo](https://github.com/malbeclabs/edge-multicast-ref/tree/main/demo)

Isso aponta o demo para Kalshi perps TOB. Para outro feed, use seu grupo e portas de [Endereços dos Feeds](#feed-addresses):

```bash
cd demo
cp .env.example .env
sed -i -e 's/^DZ_MULTICAST_GROUP=.*/DZ_MULTICAST_GROUP=233.84.178.3/' \
       -e 's/^DZ_MARKETDATA_PORT=.*/DZ_MARKETDATA_PORT=31000/' \
       -e 's/^DZ_REFDATA_PORT=.*/DZ_REFDATA_PORT=41000/' \
       -e 's/^DZ_INTERFACE=.*/DZ_INTERFACE=doublezero1/' .env
docker compose up -d --build
```

O Grafana normalmente está em `http://localhost:3000` no host. Detalhes e dashboards: o [README do demo](https://github.com/malbeclabs/edge-multicast-ref/blob/main/demo/README.md).

Isso visualiza os dados que você já está recebendo. Não substitui a compra do feed, a assinatura ou qualquer um dos caminhos de conexão acima.