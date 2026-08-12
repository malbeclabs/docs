---
description: Runbook orientado a LLM — conectar um validador Solana Mainnet-Beta ao DoubleZero em modo IBRL. Servido ao MCP via GitHub raw; não publicado no site de documentação.
---

# Conectar validador (IBRL Mainnet) — runbook

Esta página é para o MCP do DoubleZero (`get_onboarding_runbook`) via GitHub raw. Ela
não é publicada no site de documentação.

1. Conecte o [MCP do DoubleZero](mcp.md) (`https://data.doublezero.xyz/api/mcp`).
2. Informe que se trata de um **validador Solana Mainnet-Beta**, o host Linux (ou SSH), e onde está o keypair de identidade do validador.
3. Siga os passos abaixo em ordem. Prefere fazer manualmente? Use o [guia para humanos](DZ Mainnet-beta Connection.md).

**Como é o sucesso:** `doublezero status` mostra o túnel como **up**, User Type **IBRL**, Network **mainnet-beta**. `Tunnel src` e `Doublezero IP` correspondem ao IPv4 público do host.

IBRL não requer reiniciar os clientes do validador; ele usa o IP público existente.

---

## Pré-requisitos

| Necessário | Observações |
|------|--------|
| Host Linux/amd64 | Instale o DoubleZero **no host do validador**, não em um container. |
| IPv4 público, sem NAT | O IP de gossip deve corresponder a este host. |
| Solana CLI no `$PATH` | Para `solana sign-offchain-message`. |
| Keypair de identidade do validador | Legível pelo usuário que executa os comandos (geralmente sob o usuário `sol`). |
| ≥1 SOL na identidade | Passport / solicitação onchain. |
| GRE (protocolo IP 47) + BGP | BGP em `169.254.0.0/16` tcp/179. |
| `doublezero-solana` | `sudo apt update && sudo apt install doublezero-solana` (ou equivalente da distribuição). |

O Validator ID é verificado contra o gossip da Solana para determinar o IP de destino. Um ID inválido no mesmo IP é ignorado; apenas o ID primário no gossip é utilizado.

---

## Passos

### 1. Instalar o cliente

Siga o [setup](setup.md) se o `doublezero` não estiver instalado. Pacotes para mainnet:

```bash
curl -1sLf https://dl.cloudsmith.io/public/malbeclabs/doublezero/setup.deb.sh | sudo -E bash
sudo apt-get install doublezero
```

Rocky / RHEL: use `setup.rpm.sh` e `sudo yum install doublezero`.

**Verificação:** `sudo systemctl status doublezerod` está ativo. Faça backup de `~/.config/doublezero/id.json`.

### 2. Apontar o daemon para mainnet-beta

```bash
DESIRED_DOUBLEZERO_ENV=mainnet-beta \
	&& sudo mkdir -p /etc/systemd/system/doublezerod.service.d \
	&& echo -e "[Service]\nExecStart=\nExecStart=/usr/bin/doublezerod -sock-file /run/doublezerod/doublezerod.sock -env $DESIRED_DOUBLEZERO_ENV" | sudo tee /etc/systemd/system/doublezerod.service.d/override.conf > /dev/null \
	&& sudo systemctl daemon-reload \
	&& sudo systemctl restart doublezerod \
	&& doublezero config set --env $DESIRED_DOUBLEZERO_ENV  > /dev/null \
	&& echo "✅ doublezerod configured for environment $DESIRED_DOUBLEZERO_ENV"
```

Aguarde ~30s, então `doublezero latency` deve listar os dispositivos da mainnet.

### 3. Abrir UDP 44880 em `doublezero0`

```bash
sudo iptables -A INPUT -i doublezero0 -p udp --dport 44880 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero0 -p udp --dport 44880 -j ACCEPT
```

UFW: `sudo ufw allow in on doublezero0 to any port 44880 proto udp` e a regra `out` correspondente. Também permita GRE e BGP conforme o [setup](setup.md).

### 4. Confirmar o ID do DoubleZero e o validador primário

O ID do DoubleZero obtido no setup do **primário** deve estar em cada backup (`~/.config/doublezero/id.json`).

```bash
doublezero address
doublezero-solana passport find-validator -u mainnet-beta
```

Espere o primário: no gossip, no leader schedule, "can connect as a primary". Nos backups, execute o mesmo `find-validator`; eles **não** devem estar no leader schedule.

Apenas uma máquina: omita `--backup-validator-ids` / `backup_ids=` dos comandos seguintes.

### 5. Preparar a mensagem de acesso (primário)

No primário (com stake ativo, identidade no gossip):

```bash
doublezero-solana passport prepare-validator-access -u mainnet-beta \
  --doublezero-address <DOUBLEZERO_ADDRESS> \
  --primary-validator-id <NODE_ID> \
  --backup-validator-ids <ID2>,<ID3>,<ID4>
```

Omita `--backup-validator-ids` se não houver backups (máximo 3). Copie a linha `solana sign-offchain-message …` da saída.

### 6. Assinar com a chave de identidade do validador

No primário, execute o comando exibido (keypair de identidade, **não** apenas a chave do DoubleZero):

```bash
solana sign-offchain-message \
   service_key=<DOUBLEZERO_ADDRESS>,backup_ids=<ID2>,<ID3>,<ID4> \
   -k <identity-keypair-file.json>
```

**Produz:** uma string de assinatura. Leve-a para o próximo passo.

### 7. Solicitar acesso de validador

```bash
doublezero-solana passport request-validator-access -k <path-to-keypair> -u mainnet-beta \
  --primary-validator-id <NODE_ID> \
  --backup-validator-ids <ID2>,<ID3>,<ID4> \
  --signature <SIGNATURE> \
  --doublezero-address <DOUBLEZERO_ADDRESS>
```

Aguarde o Sentinel validar e criar o passe de acesso. Opcional: o agente pode chamar **`check_edge_access`** com `pubkey` (`doublezero address`) e o IP público do host até que o passe esteja presente.

### 8. Conectar IBRL

```bash
doublezero connect ibrl
```

Aguarde ~1 minuto para o GRE. Até lá, o status pode ser `down` / `Unknown`.

```bash
doublezero status
```

**Sucesso:** `up`, User Type `IBRL`, Network `mainnet-beta`, túnel tipicamente `doublezero0`.

```bash
ip route
```

Espere rotas aprendidas via BGP através de `doublezero0`.

---

## Armadilhas

1. **Ambiente errado.** Pacotes de testnet / `DESIRED_DOUBLEZERO_ENV=testnet` não funcionarão na mainnet-beta.
2. **Identidade não está no gossip.** IDs inválidos no mesmo IP não conseguem registrar a máquina.
3. **Backups devem compartilhar o ID do DoubleZero do primário.** Copie `id.json`; não gere uma segunda identidade com keygen.
4. **Assine com a identidade do validador**, não com a chave do DoubleZero.
5. **Status down por ~1 minuto** após `connect ibrl` é normal enquanto o GRE está sendo estabelecido.

---

## Veja também

- [Conexão de Validador Mainnet-Beta](DZ Mainnet-beta Connection.md)
- [Setup](setup.md)
- Próximo: [Publicar shreds (Edge)](solana-shreds-publisher-runbook.md)