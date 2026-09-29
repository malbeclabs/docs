---
description: Registre e configure as recompensas de publicação de validadores para que os validadores que publicam shreds no DoubleZero Edge sejam pagos a cada epoch.
---

# Recompensas de Validadores
!!! warning "Ao conectar-se ao DoubleZero, eu concordo com os [Termos de Uso do DoubleZero](https://doublezero.xyz/terms-protocol)"

## Como Funciona

Validadores que publicam leader shreds no DoubleZero Edge ganham recompensas a cada epoch. Antes que as recompensas possam ser pagas, cada validador deve registrar **para onde** as recompensas vão, configurando uma conta `ValidatorPublisherRewards` na Solana. Essa conta armazena:

- o **mint de recompensas** — o token no qual as recompensas são pagas 2z (a menos que seja alterado manualmente)
- o **proprietário das recompensas** — a carteira que possui a Associated Token Account (ATA) que recebe as recompensas

O comando `configure` definirá esses campos, e os pagamentos automáticos ocorrerão epoch por epoch a partir de então. Você pode executar `configure` novamente posteriormente para alterar qualquer um dos campos.

!!! info "Se você ainda não concluiu o [Setup](setup.md), a [Conexão Validator Mainnet-Beta](DZ%20Mainnet-beta%20Connection.md) e a [Conexão Validator Multicast](Validator%20Multicast%20Connection.md), faça isso primeiro."

## Pré-requisitos

- Validadores publicando leader shreds - veja [Conexão Validator Multicast](Validator%20Multicast%20Connection.md).
- A versão mais recente do CLI `doublezero-solana`: `sudo apt update && sudo apt install doublezero-solana`, no mínimo `0.5.6`.
- Acesso ao **keypair de identidade do validador**, seja na mesma máquina ou mantido offline com a capacidade de assinar uma mensagem.
- Uma pubkey de carteira de destino que será proprietária da ATA de recompensas.


---

## 1. Configurar para Reivindicar Recompensas

Execute `configure` com o keypair de identidade do validador como `-k`.

```bash
doublezero-solana shreds publisher-rewards configure \
    --node-id <ValidatorIdentity111111111111111111111111111> \
    --rewards-token-owner <Wallet567Identity111111111111111111111111111> \
    -k <path-to-validator-identity-keypair.json>
```
Exemplo de Saída
```bash
Shred subscription - Configure Validator Publisher Rewards
Node ID:           ValidatorIdentity111111111111111111111111111
Rewards owner:     ValidatorIdentity111111111111111111111111111
Rewards mint:      J6pQQ3FAcJQeWPPGppWRb4nM8jU3wLyYbRrLh7feMfvd
Rewards ATA:       11111111111Pt3PatTj59dG5BhYuqPb9QJDUr1111111
Auth path:         direct
Configured validator publisher rewards: 41111111ntmoBTnvcKcP1g2a1111111HPoN3z5uf11111112jjzBJsr1B2JrTRff4dSGe1pdM1111111TMADi3Nz
```
`Configured validator publisher rewards: ` exibe o txt que você pode visualizar em um explorador de blocos.

| Flag | Descrição |
|---|---|
| `--node-id` | Pubkey de identidade do nó validador. |
| `--rewards-token-owner` | Carteira que será proprietária da ATA receptora. |
| `--rewards-token-mint` | O token no qual as recompensas da carteira serão recebidas em `2z`. Tokens suportados também incluem `usdc` e `wsol`. |
| `-k` | Caminho para o keypair de identidade do validador. No caminho direto, a pubkey do keypair deve ser igual a `--node-id` ou o comando retornará erro e indicará para mudar para o caminho offchain. |

A ATA é auto-inicializada na mesma transação se ainda não existir.


!!! note "Se um Erro for Retornado"
    Se a pubkey de `-k` não corresponder a `--node-id`

    O keypair do pagador de taxas que você passou não é a identidade do validador. Passe o keypair de identidade do validador como `-k`, ou mude para o [caminho offchain](#apendix-offchain-path-alternative).
---

## 2. Verificar a Configuração

```bash
doublezero-solana shreds publisher-rewards show --node-id <NODE_ID>
```

O comando exibe o `Node ID`, `Rewards owner`, `Rewards mint`, o endereço ATA resolvido e o status da ATA. A **ATA Resolvida** é o endereço determinístico derivado do proprietário das recompensas + mint das recompensas — é onde as recompensas serão depositadas a cada epoch.

---

## Apêndice: Alternativa de Caminho Offchain {#apendix-offchain-path-alternative}

Três sub-etapas: preparar, assinar, configurar.

### 1. Preparar a mensagem offchain

Execute isso em qualquer lugar — é somente leitura e não precisa do keypair de identidade do validador. Ele imprime o blob hex para assinar e o slot absoluto em que a assinatura expira.

```bash
doublezero-solana shreds publisher-rewards prepare-offchain-message \
    --node-id <ValidatorIdentity111111111111111111111111111> \
    --rewards-token-owner <Wallet567Identity111111111111111111111111111> \
    --valid-for 1h
```
Exemplo de Saída

```bash
Hex message:    123457fc138f556a2578bdb079dc923342cc4e4a376683dc4c6cb923051e0be3
Deadline slot:  422954444

Sign with:
  solana sign-offchain-message 123457fc138f556a2578bdb079dc923342cc4e4a376683dc4c6cb923051e0be3 --keypair <validator-identity>

Then submit:
  doublezero-solana shreds publisher-rewards configure \
    --node-id ValidatorIdentity111111111111111111111111111 --rewards-token-mint J6pQQ3FAcJQeWPPGppWRb4nM8jU3wLyYbRrLh7feMfvd --rewards-token-owner Wallet567Identity111111111111111111111111111 \
    --deadline-slot 422954444 --signature <BASE58>
```


| Flag | Descrição |
|---|---|
| `--node-id` | Pubkey de identidade do nó validador. |
| `--rewards-token-owner` | Carteira que será proprietária da ATA receptora. |
| `--rewards-token-mint` | O token no qual as recompensas da carteira serão recebidas em `2z`. Tokens suportados também incluem `usdc` e `wsol`. |
| `--valid-for` | Tempo de vida da assinatura relativo ao slot atual. Aceita `<n>s`, `<n>m` ou `<n>h`. Padrão: `1h`. |
| `--deadline-slot` | Alternativa a `--valid-for`: slot absoluto em que a autorização expira. Mutuamente exclusivo com `--valid-for`. |
| `--json` | Emite JSON (`{ hex, deadline_slot }`) em vez do resumo legível. |

O comando imprime a mensagem de autenticação codificada em hex, o slot de deadline resolvido e trechos de shell prontos para execução para as próximas duas etapas.

### 2. Assinar a mensagem

Na máquina que possui o keypair de identidade do validador:

```bash
solana sign-offchain-message <123457fc138f556a2578bdb079dc923342cc4e4a376683dc4c6cb923051e0be3> \
--keypair <path-to-validator-identity-keypair.json>
```

Isso imprime uma assinatura em base58.

Exemplo de Saída

```bash
SignatureTBUwGq511mPLMCEE4f5fNsmX1PQrozXBBJeCdSrcbhqSX1MwFp8NsNZbhCNMZ1kPWakjsLL9e3GUxxp
```

### 3. Enviar `configure`

De volta à máquina com sua carteira pagadora de taxas:

```bash
doublezero-solana shreds publisher-rewards configure \
    --node-id <ValidatorIdentity111111111111111111111111111> \
    --rewards-token-owner <Wallet567Identity111111111111111111111111111> \
    --signature <SignatureTBUwGq511mPLMCEE4f5fNsmX1PQrozXBBJeCdSrcbhqSX1MwFp8NsNZbhCNMZ1kPWakjsLL9e3GUxxp> \
    --deadline-slot <DEADLINE_SLOT>
```

`--signature` e `--deadline-slot` devem ser passados juntos. Os valores devem corresponder aos produzidos nas etapas 2b.i e 2b.ii.

A ATA é auto-inicializada na mesma transação se ainda não existir.

Exemplo de Saída

```bash
Shred subscription - Configure Validator Publisher Rewards
Node ID:           ValidatorIdentity111111111111111111111111111
Rewards owner:     ValidatorIdentity111111111111111111111111111
Rewards mint:      J6pQQ3FAcJQeWPPGppWRb4nM8jU3wLyYbRrLh7feMfvd
Rewards ATA:       11111111111Pt3PatTj59dG5BhYuqPb9QJDUr1111111
Auth path:         offchain
Configured validator publisher rewards: 41111111ntmoBTnvcKcP1g2a1111111HPoN3z5uf11111112jjzBJsr1B2JrTRff4dSGe1pdM1111111TMADi3Nz
```

---

!!! note "Nota: Se a Assinatura Estiver Expirada"
    Cada assinatura offchain tem um slot de deadline. Se passar muito tempo entre `prepare-offchain-message` e `configure`, execute novamente `prepare-offchain-message`, reassine e reenvie. A validade padrão é 1 hora — estenda com `--valid-for 4h` ou similar se precisar de mais tempo para um fluxo de assinatura offline.