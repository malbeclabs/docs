**Revise o Aviso Legal antes de acessar ou usar o código ou quaisquer materiais relacionados.**

<!-- https://github.com/malbeclabs/doublezero-offchain/pull/159 -->

??? warning "Aviso Legal"
    
    Este documento e o código associado são fornecidos apenas para fins informativos e técnicos. A funcionalidade de conversão de tokens descrita aqui é não-custodial — os usuários interagem diretamente com os contratos inteligentes subjacentes e mantêm total controle de seus ativos em todos os momentos.

    O sistema pode depender de ou interagir com código de terceiros, fontes de dados ou mecanismos de precificação e taxas (por exemplo, contratos inteligentes, APIs ou exchanges descentralizadas) que não são desenvolvidos, controlados ou revisados pelo(s) desenvolvedor(es) ou publicador(es). Nenhuma representação ou garantia é feita quanto à precisão, funcionalidade ou segurança de qualquer componente de terceiros.
    O(s) desenvolvedor(es) e publicador(es) deste código não garantem sua precisão, completude ou disponibilidade contínua. O código e os materiais relacionados são fornecidos "como estão" e podem conter bugs, erros ou vulnerabilidades. O uso é inteiramente por sua conta e risco.
    O(s) desenvolvedor(es) e publicador(es) não recebem quaisquer taxas em conexão com o uso destes contratos. Eles não têm obrigação de manter, atualizar ou dar suporte ao código ou à documentação relacionada.

    Este documento não constitui uma oferta de venda, uma solicitação de compra ou uma recomendação para participar de qualquer conversão de tokens, swap ou outra transação. Nenhum aconselhamento jurídico, financeiro ou de investimento é fornecido.
    Os usuários são os únicos responsáveis por determinar a legalidade de suas atividades. Eles devem revisar as leis e regulamentos aplicáveis em sua jurisdição e consultar consultores independentes antes de usar o código ou participar de qualquer conversão. O uso é proibido onde seria ilegal, incluindo por pessoas ou entidades sujeitas a sanções ou em jurisdições restritas.

    Na extensão máxima permitida por lei, o(s) desenvolvedor(es) e publicador(es) isentam-se de toda responsabilidade por qualquer perda, dano ou reclamação decorrente de ou em conexão com o uso do código ou participação na conversão.

    A revisão e o uso deste documento e do código associado estão sujeitos aos [Termos e Condições do Website](https://doublezero.xyz/terms) e [Termos e Condições do Protocolo](https://doublezero.xyz/terms-protocol).

O protocolo DoubleZero coleta receita denominada em SOL de seus usuários validadores, mas distribui recompensas denominadas em 2Z aos contribuidores. Assim, ele precisa converter SOL em 2Z.

**Para isso, participantes elegíveis podem negociar contra um contrato de swap do DoubleZero, comprando SOL do contrato e vendendo 2Z. A precificação é baseada em feeds de preço da Pyth com um mecanismo de desconto programático.**

Este breve guia explica como usar o programa.

***Revise o Aviso Legal no final deste documento antes de acessar ou usar o código ou quaisquer materiais relacionados.***

---

## Design do Programa

O programa de swap é efetivamente um pool de liquidez unilateral que vende SOL em um tamanho de lote fixo de 1 SOL por negociação. Qualquer participante elegível pode retirar SOL do programa depositando 2Z, a um preço determinado por um preço oráculo da Pyth e um desconto dinâmico. Ao longo do tempo, isso executa o objetivo do programa de converter tokens nativos em 2Z.

Para utilizar, um trader deve fornecer dois preços recentes da Pyth (SOL/USD e 2Z/USD) e uma quantidade de 2Z. O programa então calcula o 2Z necessário para comprar aquele 1 SOL com base no preço implícito SOL/2Z. Em seguida, ele executa algumas etapas adicionais:

- Verifica se os preços da Pyth são suficientemente recentes, ou seja, não estão desatualizados por mais de 5 segundos.
- Verifica se os intervalos de confiança dos dois preços são suficientemente pequenos. Isto é, a soma de dois desvios padrão laplacianos (ou seja, o parâmetro `conf` no preço da Pyth) para os dois preços, normalizados por seus níveis, deve ser menor ou igual a 30 pontos base.
- Ajusta o preço SOL/2Z por um desconto dinâmico, expresso como uma porcentagem do preço da Pyth. Este desconto é uma função do tempo desde a última negociação. A fórmula abaixo especifica o desconto, assumindo que a última negociação foi feita no slot $s_{\text{last}}$ e o slot atual é $s_{\text{now}}$. (Por exemplo, se 200 slots se passaram desde a última negociação, o desconto é de 40 pontos base.)

$$
\text{discount} = \min\{0.00002 \times \left(s_{\text{now}} - s_{\text{last}}\right), 0.01\}
$$

Neste ponto, se o trader forneceu 2Z suficiente para executar a transação neste preço calculado (incluindo o desconto), ela é executada neste preço calculado. O programa retorna ao trader a quantidade comprada de SOL e qualquer excesso de 2Z.

O contrato então não permite mais negociações para aquele slot. Isso é para evitar que o contrato pague slippage excessivamente alto caso o preço da Pyth esteja longe do preço real em qualquer momento, de maneiras que os filtros existentes não detectem problemas.

---

## Execução Atômica sem Gas

Esta seção detalha como usar o comando `harvest-dz`. Este comando executará atomicamente 2 ações.
1. O comando solicita uma cotação do Jupiter versus o programa nativo de conversão SOL <> 2Z.
2. Quando a rota do Jupiter rende mais 2Z por SOL do que o programa de conversão nativo requer, `harvest-2z` executa um swap, retornando para sua carteira 1 SOL mais a diferença em 2Z.

### Harvest 2Z

Para executar, rode o seguinte:
```
doublezero-solana revenue-distribution harvest-2z
```
A saída será semelhante a:
```
Harvested 5.98151278 2Z tokens with 1.000000000 SOL
```
O comando também pode ser simulado com o argumento `--dry-run`. O dry-run produzirá logs do programa e uma saída semelhante a:

```
Simulated harvesting 5.98151278 2Z tokens with 1.000000000 SOL
```

---

## Conversão do Protocolo

Esta seção discute a verificação de taxas de conversão e a execução da conversão usando a CLI `doublezero-solana`. E ao final, discutimos a interface para integrações personalizadas com o contrato de swap do DoubleZero.

### Como verificar o preço de conversão SOL/2Z via `doublezero-solana`

Para encontrar as taxas de conversão SOL/2Z na mainnet-beta, execute o seguinte comando:

```bash
doublezero-solana revenue-distribution fetch sol-conversion
```

E a saída que você verá será semelhante a:

```bash
| field           | description                  | value         | note                          |
|-----------------|------------------------------|---------------|-------------------------------|
| Swap Rate       | 2Z amount for 1 SOL          | 805.72612992  |                               |
| Swap Rate       | 2Z amount for 1 SOL          | 805.38772494  | Includes 0.04200000% discount |
| Journal Balance | SOL available for conversion | 438.670881289 |                               |
```

O Journal Balance informa ao usuário quanta liquidez de SOL existe no contrato inteligente de Distribuição de Receita. Um usuário pode negociar desde que o Journal Balance exceda o tamanho fixo de negociação de 1 SOL.

A primeira linha exibe o preço de conversão SOL/2Z "real" via um oráculo offchain. A segunda linha é o preço de conversão usado on-chain para o swap, que simplesmente ajusta o preço real pelo desconto algorítmico.

### Como converter seu 2Z para SOL via `doublezero-solana`

Para converter seus tokens 2Z para SOL, execute o seguinte comando:

```bash
doublezero-solana revenue-distribution convert-2z
```

Por padrão, se houver liquidez de SOL suficiente e sua ATA tiver 2Z suficiente para realizar o swap, esta transação será bem-sucedida. Você pode ajustar mais detalhadamente o swap especificando os seguintes argumentos:

```bash
      --limit-price <DECIMAL>                    Limit price defaults to the current SOL/2Z oracle price
      --source-2z-account <PUBKEY>               Token account must be owned by the signer. Defaults to signer ATA if not specified
      --checked-sol-amount <SOL>                 Explicitly check SOL amount. When specified, this amount will be checked against the fixed fill quantity
```

O preço limite especificado determina o pior preço que você está disposto a aceitar ao realizar a conversão SOL/2Z. Por exemplo, digamos que o preço com desconto de 2Z para SOL é 800, o que significa 800 tokens 2Z para 1 SOL. Se você especificar um preço limite de 790, você não está disposto a realizar o swap porque está exigindo que troque no máximo 790 tokens 2Z por 1 SOL. Mas se você especificar 810, a negociação será executada porque você estava disposto a trocar no máximo 810 tokens 2Z (e neste caso, você terá trocado apenas 800 tokens 2Z nesta transação).

A conta de token 2Z de origem substitui a ATA padrão usando o signatário como proprietário desta ATA de 2Z. Mas se você tiver outra conta de token que deseja usar para realizar o swap, forneça a pubkey dela com este argumento.

Opcionalmente, você pode especificar o valor verificado de SOL para o tamanho de preenchimento padrão (definido como 1 SOL no lançamento). Se não estiver alinhado com o tamanho de preenchimento do programa, o swap falhará. Isso mitiga o risco de que o tamanho de preenchimento do programa mude e você não perceba.

### Interface para Comprar SOL

A interface e a CLI `doublezero-solana` estão [neste repositório](https://github.com/malbeclabs/doublezero-offchain). O código-fonte da interface do contrato de swap do DoubleZero pode ser encontrado [aqui](https://github.com/malbeclabs/doublezero-offchain/tree/b3f606a91326baf64b475a37d612981b63243b09). O Program ID é `9DRcqsJUCo8CL2xDCXpogwzLEVKRDzSyNtVgXqsXHfDs`.

Uma maneira conveniente de gerar as contas necessárias para a instrução de compra de SOL é usando o método `new` (encontrado em *instruction/account.rs*).

```rust
pub fn new(
    fill_registry_key: &Pubkey,
    user_token_account_key: &Pubkey,
    dz_mint_key: &Pubkey,
    user_key: &Pubkey,
) -> Self;
```

O `fill_registry_key` pode ser obtido a partir do `ProgramState`

```rust
pub struct ProgramState {
    pub admin_key: Pubkey,
    pub fills_registry_key: Pubkey, // this key
    pub is_paused: bool,
    pub configuration_registry_bump: u8,
    pub program_state_bump: u8,
    pub deny_list_registry_bump: u8,
    pub withdraw_authority_bump: u8,
    pub last_trade_slot: u64,
    pub deny_list_authority: Pubkey,
}
```

Alternativamente, você pode chamar `getProgramAccounts` via Solana RPC com seu discriminador. Mas recomendamos fazer cache desta pubkey, pois ela nunca mudará.

O `user_key` é um signatário para a instrução de compra de SOL e deve ser o proprietário do `user_token_account_key`. Como descrito acima, isso NÃO precisa ser uma ATA. Desde que sua conta de token 2Z seja de propriedade do `user_key`, esta instrução será bem-sucedida.

A struct `BuySolAccounts` implementa `Into<Vec<AccountMeta>>` para que você possa gerar todos os account metas necessários para construir a instrução.

Os dados da instrução são

```rust
    SolConversionInstructionData::BuySol {
        limit_price: u64,
        oracle_price_data: OraclePriceData,
    },
```

Estes dados de instrução são serializados em Borsh e possuem um seletor Anchor de 8 bytes, que será totalmente serializado ao usar `BorshSerialize::serialize`.

Os dados de preço do oráculo podem ser obtidos a partir deste endpoint público: [https://sol-2z-oracle-api-v1.mainnet-beta.doublezero.xyz/swap-rate](https://sol-2z-oracle-api-v1.mainnet-beta.doublezero.xyz/swap-rate). Os dados são desserializáveis via serde usando a struct OraclePriceData encontrada em *oracle.rs*.

```rust
#[derive(Debug, BorshDeserialize, BorshSerialize, Clone, Default, PartialEq, Eq)]
#[cfg_attr(
    feature = "serde",
    derive(serde::Deserialize),
    serde(rename_all = "camelCase")
)]
pub struct OraclePriceData {
    pub swap_rate: u64,
    pub timestamp: i64,
    pub signature: String,
}
```

Exemplo de como buscar usando a [crate reqwest](https://docs.rs/reqwest/latest/reqwest/):

```rust
use anyhow::{Context, Result};

pub async fn try_request_oracle_conversion_price(oracle_endpoint: &str) -> Result<OraclePriceData> {
    reqwest::Client::new()
        .get(oracle_endpoint)
        .header("User-Agent", "SOL buyoooooooor")
        .send()
        .await?
        .json()
        .await
        .with_context(|| format!("Failed to request SOL/2Z price from {oracle_endpoint}"))
}
```

Com o Program ID, as contas e os dados da instrução, você deverá ser capaz de construir a instrução para comprar SOL do contrato de swap do DoubleZero.