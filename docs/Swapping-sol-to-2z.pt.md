**Revise o Aviso Legal antes de acessar ou usar o código ou quaisquer materiais relacionados.**
!!! warning "This translation was generated using artificial intelligence and has not been reviewed by a human translator. It may contain inaccuracies or errors and should not be relied upon."


<!-- https://github.com/doublezerofoundation/doublezero-offchain/pull/159 -->

??? warning "Aviso Legal"

    Este documento e o código associado são fornecidos apenas para fins informativos e técnicos. A funcionalidade de conversão de tokens descrita aqui é não custodial — os usuários interagem diretamente com os contratos inteligentes subjacentes e mantêm controle total de seus ativos em todos os momentos.

    O sistema pode depender de ou interagir com código de terceiros, fontes de dados ou mecanismos de precificação e taxas (por exemplo, contratos inteligentes, APIs ou exchanges descentralizadas) que não são desenvolvidos, controlados ou revisados pelo(s) desenvolvedor(es) ou publicador(es). Nenhuma representação ou garantia é feita quanto à precisão, funcionalidade ou segurança de qualquer componente de terceiros.
    O(s) desenvolvedor(es) e publicador(es) deste código não garantem sua precisão, integridade ou disponibilidade contínua. O código e os materiais relacionados são fornecidos "no estado em que se encontram" e podem conter bugs, erros ou vulnerabilidades. O uso é inteiramente por sua própria conta e risco.
    O(s) desenvolvedor(es) e publicador(es) não recebem quaisquer taxas em conexão com o uso desses contratos. Eles não têm obrigação de manter, atualizar ou suportar o código ou a documentação relacionada.

    Este documento não constitui uma oferta de venda, uma solicitação de compra ou uma recomendação para participar de qualquer conversão de token, swap ou outra transação. Nenhum conselho jurídico, financeiro ou de investimento é fornecido.
    Os usuários são os únicos responsáveis por determinar a legalidade de suas atividades. Eles devem revisar as leis e regulamentos aplicáveis em sua jurisdição e consultar assessores independentes antes de usar o código ou participar de qualquer conversão. O uso é proibido onde for ilegal, incluindo por pessoas ou entidades sujeitas a sanções ou em jurisdições restritas.

    Na extensão máxima permitida por lei, o(s) desenvolvedor(es) e publicador(es) se isentam de toda responsabilidade por qualquer perda, dano ou reclamação decorrente ou em conexão com o uso do código ou participação na conversão.

    A revisão e o uso deste documento e do código associado estão sujeitos aos [Termos e Condições do Website](https://doublezero.xyz/terms) e [Termos e Condições do Protocolo](https://doublezero.xyz/terms-protocol).

O protocolo DoubleZero coleta receita denominada em SOL de seus usuários validadores, mas distribui recompensas denominadas em 2Z para os contribuidores. Portanto, ele deve converter SOL em 2Z.

**Para isso, participantes elegíveis podem negociar contra um contrato de swap DoubleZero, comprando SOL do contrato e vendendo 2Z. O preço é baseado em feeds de preço Pyth com um mecanismo de desconto programático.**

Este guia curto explica como usar o programa.

***Revise o Aviso Legal no final deste documento antes de acessar ou usar o código ou quaisquer materiais relacionados.***

---

## Design do Programa

O programa de swap é efetivamente um pool de liquidez unilateral que vende SOL em um tamanho de lote fixo de 1 SOL por negociação. Qualquer participante elegível pode retirar SOL do programa depositando 2Z, a um preço determinado por um preço oracle do Pyth e um desconto dinâmico. Com o tempo, isso executa o objetivo do programa de transformar tokens nativos em 2Z.

Para utilizar, um trader deve fornecer dois preços Pyth recentes (SOL/USD e 2Z/USD) e uma quantidade de 2Z. O programa então calcula o 2Z necessário para comprar aquele 1 SOL com base no preço implícito SOL/2Z. Em seguida, executa algumas etapas adicionais:

- Verifica que os preços Pyth são suficientemente recentes, ou seja, não estão mais do que 5 segundos desatualizados.
- Verifica que os intervalos de confiança dos dois preços são suficientemente pequenos. Ou seja, a soma de dois desvios padrão de Laplace (ou seja, parâmetro `conf` no preço Pyth) para os dois preços, normalizada por seus níveis, deve ser menor ou igual a 30 pontos base.
- Ajusta o preço SOL/2Z por um desconto dinâmico, expresso como percentual do preço Pyth. Este desconto é uma função do tempo desde o último trade. A fórmula abaixo especifica o desconto, assumindo que o último trade foi feito no slot $s_{\text{last}}$ e o slot atual é $s_{\text{now}}$. (Por exemplo, se 200 slots se passaram desde o último trade, o desconto é de 40 pontos base.)

$$
\text{discount} = \min\{0.00002 \times \left(s_{\text{now}} - s_{\text{last}}\right), 0.01\}
$$

Neste ponto, se o trader forneceu 2Z suficiente para executar a transação a esse preço calculado (inclusive o desconto), ela é executada a esse preço calculado. Retorna ao trader a quantidade comprada de SOL e qualquer excesso de 2Z.

O contrato então não permite mais negociações para aquele slot. Isso é para evitar que o contrato pague slippage excessivamente alto caso o preço Pyth esteja longe do preço verdadeiro em qualquer momento de maneiras que os filtros existentes não capturam.

---

## Execução Atômica Sem Gas

Esta seção detalha como usar o comando `harvest-dz`. Este comando executará atomicamente 2 ações.
1. O comando solicita uma cotação do Jupiter versus o programa de conversão nativo SOL <> 2Z.
2. Quando a rota do Jupiter gera mais 2Z por SOL do que o programa de conversão nativo requer, `harvest-2z` executa um swap, retornando à sua carteira 1 SOL mais a diferença em 2Z.

### Harvest 2Z

Para executar, execute o seguinte:
```
doublezero-solana revenue-distribution harvest-2z
```
A saída se parecerá com:
```
Harvested 5.98151278 2Z tokens with 1.000000000 SOL
```
O comando também pode ser simulado com o argumento `--dry-run`. O dry-run produzirá logs do programa e uma saída semelhante a:

```
Simulated harvesting 5.98151278 2Z tokens with 1.000000000 SOL
```

---

## Conversão do Protocolo

Esta seção discute como verificar as taxas de conversão e executar a conversão usando o CLI `doublezero-solana`. E no final, discutimos a interface para integrações personalizadas com o contrato de swap DoubleZero.

### Como verificar o preço de conversão SOL/2Z via `doublezero-solana`

Para encontrar as taxas de conversão SOL/2Z no mainnet-beta, execute o seguinte comando:

```bash
doublezero-solana revenue-distribution fetch sol-conversion
```

E a saída que você veria se parecerá com:

```bash
| field           | description                  | value         | note                          |
|-----------------|------------------------------|---------------|-------------------------------|
| Swap Rate       | 2Z amount for 1 SOL          | 805.72612992  |                               |
| Swap Rate       | 2Z amount for 1 SOL          | 805.38772494  | Includes 0.04200000% discount |
| Journal Balance | SOL available for conversion | 438.670881289 |                               |
```

O Journal Balance informa ao usuário quanta liquidez SOL existe no contrato inteligente de Distribuição de Receita. Um usuário pode negociar enquanto o Journal Balance exceder o tamanho fixo de negociação de 1 SOL.

A primeira linha exibe o preço "verdadeiro" de conversão SOL/2Z via oracle offchain. A segunda linha é o preço de conversão usado onchain para o swap, que simplesmente ajusta o preço verdadeiro para o desconto algorítmico.

### Como converter seu 2Z para SOL via `doublezero-solana`

Para converter seus tokens 2Z para SOL, execute o seguinte comando:

```bash
doublezero-solana revenue-distribution convert-2z
```

Por padrão, se houver liquidez SOL suficiente e sua ATA tiver 2Z suficiente para realizar o swap, esta transação terá sucesso. Você pode ajustar o swap mais precisamente especificando os seguintes argumentos:

```bash
      --limit-price <DECIMAL>                    O preço limite padrão é o preço oracle atual SOL/2Z
      --source-2z-account <PUBKEY>               A conta de token deve ser de propriedade do signatário. Padrão para ATA do signatário se não especificado
      --checked-sol-amount <SOL>                 Verificar explicitamente o valor SOL. Quando especificado, este valor será verificado contra a quantidade fixa de preenchimento
```

O preço limite especificado determina o pior caso de preço que você está disposto a aceitar ao realizar a conversão SOL/2Z. Por exemplo, digamos que o preço 2Z com desconto para SOL seja 800, o que significa 800 tokens 2Z por 1 SOL. Se você especificar um preço limite de 790, não estará disposto a realizar o swap porque está exigindo trocar no máximo 790 tokens 2Z por 1 SOL. Mas se você especificar 810, o trade passará porque você estava disposto a trocar no máximo 810 tokens 2Z (e neste caso, você terá trocado apenas 800 tokens 2Z nesta transação).

A conta de token 2Z de origem substitui a ATA padrão usando o signatário como proprietário desta ATA 2Z. Mas se você tiver outra conta de token que deseja usar para realizar o swap, forneça a pubkey para ela com este argumento.

Opcionalmente, você pode especificar o valor SOL verificado para o tamanho de preenchimento padrão (definido como 1 SOL no lançamento). Se não estiver alinhado com o tamanho de preenchimento do programa, o swap falhará. Isso mitiga o risco de que o tamanho de preenchimento do programa mude e você não perceba.

### Interface para Comprar SOL

A interface e o CLI `doublezero-solana` residem em [este repositório](https://github.com/doublezerofoundation/doublezero-offchain). O código-fonte para a interface do contrato de swap DoubleZero pode ser encontrado [aqui](https://github.com/doublezerofoundation/doublezero-offchain/tree/b3f606a91326baf64b475a37d612981b63243b09). O ID do programa é `9DRcqsJUCo8CL2xDCXpogwzLEVKRDzSyNtVgXqsXHfDs`.

Uma maneira conveniente de gerar as contas necessárias para a instrução de compra de SOL é usar o método `new` (encontrado em *instruction/account.rs*).

```rust
pub fn new(
    fill_registry_key: &Pubkey,
    user_token_account_key: &Pubkey,
    dz_mint_key: &Pubkey,
    user_key: &Pubkey,
) -> Self;
```

O `fill_registry_key` pode ser buscado do `ProgramState`

```rust
pub struct ProgramState {
    pub admin_key: Pubkey,
    pub fills_registry_key: Pubkey, // esta chave
    pub is_paused: bool,
    pub configuration_registry_bump: u8,
    pub program_state_bump: u8,
    pub deny_list_registry_bump: u8,
    pub withdraw_authority_bump: u8,
    pub last_trade_slot: u64,
    pub deny_list_authority: Pubkey,
}
```

Alternativamente, você pode chamar `getProgramAccounts` via Solana RPC com seu discriminador. Mas recomendamos armazenar em cache esta pubkey, pois ela nunca mudará.

O `user_key` é um signatário para a instrução de compra de SOL e deve ser o proprietário do `user_token_account_key`. Conforme descrito acima, isso NÃO precisa ser uma ATA. Desde que sua conta de token 2Z seja de propriedade do `user_key`, esta instrução terá sucesso.

A struct `BuySolAccounts` implementa `Into<Vec<AccountMeta>>` para que você possa gerar todos os metadados de conta necessários para construir a instrução.

Os dados de instrução são

```rust
    SolConversionInstructionData::BuySol {
        limit_price: u64,
        oracle_price_data: OraclePriceData,
    },
```

Esses dados de instrução são serializados em Borsh e têm um seletor Anchor de 8 bytes, que todos serializarão ao usar `BorshSerialize::serialize`.

Os dados de preço oracle podem ser obtidos deste endpoint público: [https://sol-2z-oracle-api-v1.mainnet-beta.doublezero.xyz/swap-rate](https://sol-2z-oracle-api-v1.mainnet-beta.doublezero.xyz/swap-rate). Os dados são desserializáveis em serde usando a struct OraclePriceData encontrada em *oracle.rs*.

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

Exemplo de como buscar usando o [reqwest crate](https://docs.rs/reqwest/latest/reqwest/):

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

Com o ID do programa, contas e dados de instrução, você deve ser capaz de construir a instrução para comprar SOL do contrato de swap DoubleZero.
