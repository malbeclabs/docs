**Revise o Aviso Legal antes de acessar ou usar o código ou quaisquer materiais relacionados.**

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

Os validadores podem pagar suas taxas em 2Z via um [programa de swap](https://github.com/doublezerofoundation/doublezero-offchain/tree/main/crates/solana-interface/sol-conversion) onchain. O swap é realizado trocando 2Z por SOL. O saldo de SOL em sua conta de depósito será atualizado de acordo com o swap.


Este processo **sempre** usará incrementos de 1 SOL. O resultado deste swap **sempre** será depositado diretamente em sua conta de depósito. Esta é uma via de mão única — você não pode recuperar o 2Z ou SOL desta transação. Ele será enviado para um módulo de distribuição onchain.


#### Passo 1
Primeiro determine qual é a taxa de conversão atual


```
doublezero-solana revenue-distribution fetch sol-conversion
```


saída:
```
| field           | description                  | value         | note                          |
|-----------------|------------------------------|---------------|-------------------------------|
| Swap Rate       | 2Z amount for 1 SOL          | 800.86265341  |                               |
| Swap Rate       | 2Z amount for 1 SOL          | 797.75530631  | Includes 0.38800000% discount |
| Journal Balance | SOL available for conversion | 438.670881289 |                               |
```


#### Passo 2
Faça uma ordem limitada. Você executará este swap por sua própria conta e risco. Não fazemos recomendações sobre perfil de risco, e os exemplos fornecidos aqui são apenas para fins educacionais.


##### Como estruturar uma ordem limitada
Com base no exemplo acima, vamos agora fazer uma ordem limitada 5% acima do preço cotado.
797.76 * 1.05 = 837.65


Neste exemplo, vamos assumir que a conta de depósito tem 0 SOL nela.


```
doublezero-solana revenue-distribution --convert-2z-limit-price 837.65 --node-id ValidatorIdentity11111111111111111111111111111111111111111111111111111111111111 --fund 1
```
Observe no comando acima `--fund 1` — isso está explicitamente financiando 1 SOL na conta de depósito.


Se você escolher qualquer número diferente de 1, acionará um erro informando o valor incorreto:
```
Error: SOL amount must be 1.000000000 for 2Z -> SOL conversion. Got 1.500000000
```


Você será solicitado a confirmar a transação:


```
⚠️  By specifying --convert-2z-limit-price, you are funding 1.000000000 SOL to your deposit account. Proceed? [y/N]
```


saída:
```
2Z token balance: 987241.76579348
Converted 2Z to SOL: 2iaBzd4vgEeDnpfSCD9aYFMWZ3UoVzrJfUjSMhsDhfSQ6isPZKkKe3ZWQ6b5aWvV3h8Vsk8Mmde6wmCiidD4Qc6s
Converted 837.65 2Z tokens to 1.000000000 SOL
```
Observe que, em um swap bem-sucedido, o `Balance:` foi atualizado para 1 SOL.


Se um preço estiver fora do seu intervalo especificado, você encontrará um erro como:
```
Error: RPC response error -32002: Transaction simulation failed: Error processing Instruction 0: custom program error: 0x177f; 10 log messages:
 Program 9DRcqsJUCo8CL2xDCXpogwzLEVKRDzSyNtVgXqsXHfDs invoke [1]
 Program log: Instruction: BuySol
 Program log: Signature verified successfully
 Program log: Timestamp verified successfully
 Program log: Bid price 79500000000
 Program log: Ask price 79862251144
 Program data: 1fxoRNOEulcAypo7AAAAAAC7kYISAAAAiD4pmBIAAAAsk/ZoAAAAAA4PxjWjgr+ERO7jDdvoOmT/WpgDFLfY+FGKKDdOw4PMAAAAAAAAAAA=
 Program log: AnchorError thrown in on-chain/programs/converter-program/src/buy_sol.rs:142. Error Code: BidTooLow. Error Number: 6015. Error Message: Provided bid is too low.
 Program 9DRcqsJUCo8CL2xDCXpogwzLEVKRDzSyNtVgXqsXHfDs consumed 50754 of 90000 compute units
 Program 9DRcqsJUCo8CL2xDCXpogwzLEVKRDzSyNtVgXqsXHfDs failed: custom program error: 0x177f
```
