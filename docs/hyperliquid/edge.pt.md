---
description: "Assine dados de mercado da Hyperliquid no DoubleZero Edge — configuração, metro, solicitação de feed e conexão após aprovação."
---

# Assinar Hyperliquid (Edge)

!!! warning "Ao conectar-se ao DoubleZero, eu concordo com os [Termos de Uso do DoubleZero](https://doublezero.xyz/terms-protocol). Por favor, note que os dados são apenas para seus fins internos e não podem ser retransmitidos (veja Seção 2(e))."

Os feeds da Hyperliquid entregam dados de mercado pelo DoubleZero Edge como multicast UDP. Quatro feeds principais cobrem perps nativos da Hyperliquid (`hl`) e perps da [trade.xyz](https://trade.xyz) (`xyz`):

| Feed | Descrição |
|------|-----------|
| `hyper-hl-tob` | Melhor oferta de compra/venda e registros de negociação para perps Hyperliquid |
| `hyper-hl-mbo` | Livro completo ordem por ordem para perps Hyperliquid (adições, cancelamentos, execuções) |
| `hyper-xyz-tob` | Melhor oferta de compra/venda e registros de negociação para perps trade.xyz |
| `hyper-xyz-mbo` | Livro completo ordem por ordem para perps trade.xyz (adições, cancelamentos, execuções) |

Visão geral do serviço: [Hyperliquid](index.md).

## Qual caminho devo seguir?

| Modo | O que você obtém | Quando usar |
|------|------------------|-------------|
| **Edge Connect** | [`doublezero-edge-connect`](https://github.com/malbeclabs/doublezero-edge-connect) — JSON decodificado via WebSocket | Caminho mais rápido para um fluxo de cotações utilizável |
| **Multicast nativo** | Assine no `doublezero1`, decodifique UDP binário você mesmo (ou com parsers de referência) | Controle total do protocolo |

Etapas compartilhadas primeiro: firewall, metro, candidatura e pagamento (Etapas 1–3). Após a aprovação, a [Etapa 4](#step-4-connect-after-approval) se divide — **Edge Connect** ou **nativo**. Não misture os dois no mesmo host.

Quer que uma IA faça a instalação com você? Conecte o [DoubleZero MCP](../mcp.md) e peça para ele guiá-lo pelo Hyperliquid Edge.

---

## Etapa 1: Configuração do DoubleZero

**Configuração Completa**


Siga as instruções de [configuração](../setup.md) para instalar e configurar o cliente DoubleZero no host.

Se você já configurou o DoubleZero anteriormente no host para uso nativo, certifique-se de que o cliente está atualizado:

```bash
sudo apt update && sudo apt install doublezero
```

**Configurar o Firewall**


Permita tráfego GRE, BGP, PIM e feed da Hyperliquid no `doublezero1`. As portas UDP da Hyperliquid estão no intervalo `20000`–`20999` (Top-of-Book e Market-by-Order de mercado, referência e snapshot). Também permita UDP `5765` para heartbeats do DoubleZero no túnel. Abra a faixa de feeds para que novos feeds não exijam outra alteração de firewall. Veja [Endereços de feed](#feed-addresses).

**iptables:**

```bash
sudo iptables -A OUTPUT -p gre -j ACCEPT
sudo iptables -A INPUT -i doublezero1 -s 169.254.0.0/16 -d 169.254.0.0/16 -p tcp --dport 179 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero1 -s 169.254.0.0/16 -d 169.254.0.0/16 -p tcp --dport 179 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero1 -p pim -j ACCEPT
# Hyperliquid market / reference / snapshot (all feeds)
sudo iptables -A INPUT -i doublezero1 -p udp --dport 20000:20999 -j ACCEPT
# DoubleZero heartbeats
sudo iptables -A INPUT -i doublezero1 -p udp --dport 5765 -j ACCEPT
```

**UFW:**

```bash
sudo ufw allow proto gre from any to any
sudo ufw allow in on doublezero1 from 169.254.0.0/16 to 169.254.0.0/16 port 179 proto tcp
sudo ufw allow out on doublezero1 from 169.254.0.0/16 to 169.254.0.0/16 port 179 proto tcp
# Hyperliquid market / reference / snapshot (all feeds)
sudo ufw allow in on doublezero1 to any port 20000:20999 proto udp
# DoubleZero heartbeats
sudo ufw allow in on doublezero1 to any port 5765 proto udp
```

O UFW não possui o protocolo `pim`. PIM de saída é permitido pela política padrão de saída do UFW; se você negar tráfego de saída, adicione uma regra raw para PIM em `/etc/ufw/before.rules`.

Você pode restringir essas regras apenas às portas dos feeds que assinar (veja [Endereços de feed](#feed-addresses)).

---

## Etapa 2: Escolha um metro

Identifique a localização de menor latência a partir da máquina que receberá o feed:

```bash
doublezero latency
```

Anote o metro / cidade do resultado de menor latência. Você selecionará essa cidade no formulário de candidatura. Veja o [mapa de topologia](https://data.malbeclabs.com/topology/map?overlays=metroClustering%2Cbandwidth) para ver como os metros são agrupados.

**Preços**


Os feeds são precificados por região de entrega. O preço segue onde os dados são entregues, não onde o comprador está. Um pacote Tokyo entrega para receptores em Tokyo; entrega em outro lugar requer o pacote Global. Dois hosts receptores (IPs) são incluídos por feed, por metro.

| Feed | Tokyo /mês | Global /mês |
| --- | --- | --- |
| Hyperliquid perps Top-of-Book (L1) | $900 | $1.500 |
| Hyperliquid perps Market-by-Order (L4) | $3.000 | $5.000 |
| trade.xyz perps Top-of-Book (L1) | $900 | $1.500 |
| trade.xyz perps Market-by-Order (L4) | $3.000 | $5.000 |
| **Todos os feeds (pacote ~30% desconto)** | **$5.500** | **$9.000** |

---

## Etapa 3: Enviar Solicitação

1. Acesse [https://doublezero.xyz/edge/subscribe](https://doublezero.xyz/edge/subscribe).
2. Selecione **Hyperliquid** e os feeds que você precisa.
3. Selecione a **cidade** (metro) que você precisa. Use a tabela acima e `doublezero latency` para escolher.
4. Preencha o formulário de candidatura.

Você atribuirá um DoubleZero ID (chave existente ou gere uma nova) a cada solicitação de feed na página de [contas](https://doublezero.xyz/shreds/account). A **chave privada correspondente deve estar presente na máquina que receberá o feed** — não atribua uma pubkey cuja chave privada você não possa mover para esse host.

Você escolhe um **metro** e uma **pubkey**. Você **não** vincula um IP público no momento da candidatura. Durante a assinatura, você pode mover o acesso entre IPs **dentro dos metros escolhidos**.

Você será contatado com mais instruções em tempo hábil (espere **1-3 dias úteis**).

---

## Etapa 4: Conectar após aprovação {#step-4-connect-after-approval}

Após enviar a candidatura, você receberá uma fatura; uma vez paga, conecte-se em cada máquina aprovada. O acesso é habilitado na data de início escolhida. Escolha **um** caminho abaixo.

### 4a. Edge Connect {#4a-edge-connect}

Se o `doublezerod` do host já estiver em execução (da [configuração](../setup.md)), ele e o daemon do próprio container ambos tentam vincular a porta UDP `44880`, então o daemon do container encerra logo após iniciar. O instalador oferece parar e desabilitar o daemon do host, e faz isso sem perguntar quando `DZ_ASSUME_YES=1` está definido. Para fazer você mesmo:

```bash
sudo systemctl stop doublezerod
sudo systemctl disable doublezerod
```

Instale o [doublezero-edge-connect](https://github.com/malbeclabs/doublezero-edge-connect) **após** a aprovação e pagamento. A bridge se junta ao DoubleZero dentro de um container `--network host` e serve JSON decodificado em `ws://<host>:8081`.

```bash
curl -fsSL https://get.doublezero.xyz/connect | bash
```

**Todos os comandos `doublezero` passam pelo container**, não pelo CLI do host:

```bash
docker exec doublezero-edge-connect doublezero status
```

!!! tip
    Você pode criar um alias para facilitar os comandos ao container. Este exemplo permite que `dz status` funcione da mesma forma que `doublezero status` dentro do container:

    ```bash
    echo "alias dz='sudo docker exec -it doublezero-edge-connect doublezero'" >> ~/.bashrc && source ~/.bashrc
    ```

Espere `BGP Session Up` e seu(s) grupo(s) `edge-hyper-…` assinado(s).

Em seguida, abra o WebSocket (`ws://127.0.0.1:8081`). Contrato: [PROTOCOL.md](https://github.com/malbeclabs/doublezero-edge-connect/blob/main/PROTOCOL.md). Guia completo: runbook [MCP](../mcp.md) `hyperliquid-edge`.

### 4b. Multicast nativo {#4b-native-multicast}

No host que possui a chave privada atribuída (com o `doublezerod` do host em execução), assine os feeds que você comprou:

```bash
doublezero connect multicast --subscribe-feed <feed-code>
```

Múltiplos feeds, separados por espaço:

```bash
doublezero connect multicast --subscribe-feed hyper-hl-tob hyper-hl-mbo hyper-xyz-tob hyper-xyz-mbo
```

Verifique o túnel:

```bash
doublezero status
```

Espere `BGP Session Up` na rede DoubleZero correta. Em seguida, decodifique o protocolo você mesmo — veja [Decodificar o feed](#decode-the-feed).

---

## Cobrança

Os assentos são cobrados **mensalmente**. Fique atento à data de expiração do assento.

Você precisa pagar a fatura antes que o assento expire. **Não pagar leva à remoção do assento.**

---

## Endereços de feed {#feed-addresses}

O IP seleciona o grupo multicast. A porta seleciona o fluxo naquele grupo. Verifique os valores de IP ao vivo com:

```bash
doublezero multicast group list
```

| Feed | Descrição | Grupo multicast | Market | Reference | Snapshot | Especificação |
|------|-----------|-----------------|--------|-----------|----------|---------------|
| `hyper-hl-tob` | Melhor oferta de compra/venda e registros de negociação para perps Hyperliquid | `233.84.178.27` | `20000` | `20001` | — | [top-of-book](https://github.com/malbeclabs/edge-feed-spec/blob/main/top-of-book/spec.md) |
| `hyper-hl-mbo` | Livro completo ordem por ordem para perps Hyperliquid | `233.84.178.28` | `20010` | `20011` | `20012` | [market-by-order](https://github.com/malbeclabs/edge-feed-spec/blob/main/market-by-order/spec.md) |
| `hyper-xyz-tob` | Melhor oferta de compra/venda e registros de negociação para perps trade.xyz | `233.84.178.29` | `20100` | `20101` | — | [top-of-book](https://github.com/malbeclabs/edge-feed-spec/blob/main/top-of-book/spec.md) |
| `hyper-xyz-mbo` | Livro completo ordem por ordem para perps trade.xyz | `233.84.178.30` | `20110` | `20111` | `20112` | [market-by-order](https://github.com/malbeclabs/edge-feed-spec/blob/main/market-by-order/spec.md) |

Cada feed tem seu próprio endereço de grupo multicast. Portas: reference = market + `1`; snapshot (apenas MBO) = market + `2`. Sugerimos vincular market e reference juntos; para MBO, também vincule snapshot.

Você também pode ver pequenos pacotes UDP na porta `5765` no `doublezero1` — heartbeats do DoubleZero, não dados de mercado.

Os frames são binários de tamanho fixo em little-endian. Perps nativos da Hyperliquid usam `source_id=1`; perps da trade.xyz usam `source_id=7`.

---

## Decodificar o feed {#decode-the-feed}

!!! note "Edge Connect"
    Se você está usando `doublezero-edge-connect`, o feed já está decodificado como JSON via WebSocket — pule a decodificação manual.

**Use um parser de referência**


[`edge-multicast-ref`](https://github.com/malbeclabs/edge-multicast-ref) fornece assinantes multicast que decodificam o formato do protocolo e o republicam como JSON em um socket Unix:

- [`go/topofbook-parser`](https://github.com/malbeclabs/edge-multicast-ref/tree/main/go/topofbook-parser) para Top-of-Book & Trades
- [`go/marketbyorder-parser`](https://github.com/malbeclabs/edge-multicast-ref/tree/main/go/marketbyorder-parser) para Market-by-Order

Veja o [README principal](https://github.com/malbeclabs/edge-multicast-ref/blob/main/README.md#market-data-pipelines) para o pipeline completo.

**Escreva seu próprio decodificador**

Decodifique usando o [edge-feed-spec](https://github.com/malbeclabs/edge-feed-spec). Comece com o cabeçalho do frame e depois os layouts de mensagem para o feed que você está recebendo.

**Cabeçalho do Túnel GRE — XDP**

O tráfego de dados de mercado entregue pela rede é encapsulado em GRE na última milha. No `doublezero1`, o cliente apresenta multicast UDP simples. Se você termina o GRE por conta própria (por exemplo, um pipeline XDP), remova o cabeçalho GRE antes de alimentar os dados no seu decodificador. Veja [`gre-decap`](https://github.com/malbeclabs/edge-multicast-ref/tree/main/gre-decap).

---

## Solução de problemas

Se você encontrar um problema não coberto aqui, por favor entre em contato pelo seu canal existente antes de tentar contorná-lo. Se você não tem um canal, veja [Suporte](../support.md).

**Certifique-se de que seu cliente está atualizado**


```bash
sudo apt update && sudo apt install doublezero
```

**Túnel não está subindo**


1. **Edge Connect:** execute status no container — `docker exec doublezero-edge-connect doublezero status`. O `doublezero status` do host frequentemente falha enquanto o feed está funcionando (o container é dono do daemon). Confirme que o `doublezerod` do host está parado.
2. **Nativo:** verifique se o daemon do host está em execução: `sudo systemctl status doublezerod`
3. Verifique se as regras de firewall estão configuradas (GRE, BGP, PIM, portas UDP da Hyperliquid e `5765` no `doublezero1`)
4. Confirme que a fatura deste assento está paga e que a data de início já passou
5. Execute connect no caminho que você escolheu ([4a](#4a-edge-connect) ou [4b](#4b-native-multicast)) com a chave que corresponde à página de contas
6. Espere `BGP Session Up` do mesmo lugar onde você executou connect (container ou host)

**Sem pacotes após assinar**


1. Confirme que você está assinado: `doublezero user list`
2. Confirme que o feed aparece nos seus grupos: `doublezero multicast group list`
3. Capture no túnel, por exemplo Hyperliquid TOB: `sudo tcpdump -ni doublezero1 host 233.84.178.27`
4. Prefira vincular market e reference juntos (e snapshot para MBO) para o feed que você deseja

**Feed comprado ausente (Edge Connect)**

Se um feed comprado está ausente do `doublezero status`, assine dentro do container:

```bash
docker exec doublezero-edge-connect \
  doublezero connect multicast --subscribe-feed <feed-code>
```

Múltiplos feeds, separados por espaço:

```bash
docker exec doublezero-edge-connect \
  doublezero connect multicast --subscribe-feed \
    hyper-hl-tob hyper-hl-mbo hyper-xyz-tob hyper-xyz-mbo
```

**Assento expirado ou removido**


Os assentos são mensais. Se a fatura não for paga antes da expiração, o assento é removido e o túnel não se manterá ativo.

**"Multicast user already exists"**


Você já tem uma assinatura ativa por um caminho diferente. Desconecte primeiro e depois tente conectar novamente:

- **Edge Connect:** `docker exec doublezero-edge-connect doublezero disconnect`
- **Nativo:** `doublezero disconnect`

Em seguida, tente novamente `doublezero connect multicast --subscribe-feed <feed-code>` no mesmo caminho (container ou host).

**Específico para AWS**


Desabilite a verificação de origem/destino na ENI da instância. Sem isso, o multicast encapsulado em GRE pode ser descartado.