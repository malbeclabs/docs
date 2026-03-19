# Preços e Taxas para Validadores
!!! warning "This translation was generated using artificial intelligence and has not been reviewed by a human translator. It may contain inaccuracies or errors and should not be relied upon."


**Preços simples e alinhados para validadores Solana**

As taxas começarão na epoch 859, que começa no sábado, 4 de outubro, às 4h ET. Uma taxa plana de 5% é cobrada sobre as recompensas de assinatura de bloco e taxas de prioridade.

As taxas financiam diretamente a infraestrutura que torna o DoubleZero possível, incluindo linhas de fibra física e equipamentos em data centers.

Uma exploração aprofundada de por que as taxas existem e o modelo de preços para validadores pode ser encontrada [aqui](https://doublezero.xyz/fees).

***Este guia foca em como as taxas são pagas de uma perspectiva técnica.***

## **Modelo de Liquidação**

- As taxas são denominadas em SOL e liquidadas por epoch
- A dívida do validador é calculada on-chain pelo programa de Distribuição de Receita
- Cada validador tem uma conta de depósito (PDA) para pagamentos
- Janela de financiamento: As taxas são depositadas durante a epoch Solana seguinte ao seu acúmulo. Ou seja, as taxas acumuladas durante a epoch 860 precisam ser pagas na epoch 861.

- O pré-financiamento é suportado. Os saldos são reduzidos ao longo das epochs

---

# **Estimando Taxas**

Estimativas históricas e dados por pubkey estão disponíveis no [Repositório de Estimativas de Taxas](http://github.com/doublezerofoundation/fees). O repositório não substitui os dados on-chain. Você é responsável pelo saldo on-chain, não pelo saldo neste repositório.

Dúvidas? Entre em contato com Nihar Shah em nihar@doublezero.us

# Detalhes para Desenvolvedores

### Interface de Linha de Comando
O CLI do DoubleZero fornece comandos para gerenciar depósitos de validadores e monitorar saldos.
Você precisará de SOL na conta de onde executa esses comandos para pagar o gas.

<div data-wizard-step="fee-check" markdown>

### Passo 1: Entendendo a Dívida Devida

Para visualizar a dívida em um endereço específico você pode usar este formato:
```
doublezero-solana revenue-distribution fetch validator-debts --node-id ValidatorIdentity111111111111111111111111111
```
Examinaremos um exemplo de saída abaixo:

```
| node_id                                      |    total_amount | deposit_balance | note                   |
|----------------------------------------------|-----------------|-----------------|------------------------|
| ValidatorIdentity111111111111111111111111111 | 0.632736605 SOL | 0.000220966 SOL | 0.632515639 SOL needed |
| ValidatorIdentity111111111111111111111111111 | 24.520162479 SOL| 0.000000000 SOL | Not funded             |
```
Na saída de exemplo há duas saídas possíveis diferentes em `note`. `Not funded` significa que a conta não foi financiada. No exemplo, `0.632515639 SOL needed` é o valor pendente de SOL necessário para pagar todas as dívidas atualmente devidas associadas ao ID do Validador alvo.

</div>

<div data-wizard-step="fee-pay" markdown>

### Passo 2: Pagando a Dívida Devida

!!! note inline end
      Você pode agendar este comando para ser executado em intervalos regulares.

Para pagar a dívida devida você pode usar o seguinte comando. Isso usará automaticamente o keypair padrão em `$HOME/.config/solana/id.json`

Você pode especificar o keypair com o qual deseja pagar sua dívida adicionando o argumento `-k path/to/keypair.json` ao final do comando.

```
doublezero-solana revenue-distribution validator-deposit --fund-outstanding-debt --node-id ValidatorIdentity111111111111111111111111111
```
Um exemplo de saída é fornecido abaixo

```
Solana validator deposit: DZ_PDA_MvFTgPku3dUrw2W3dbeK5dhxmXYKKYETDUK1V
Funded: TransactionHashHVxSobvdY2r14CkEwsBDhwf2dBmFatyeftisrdfSocMM2tXPjFvXPRmVs1xagiqKSX4b92fgt
Node ID: ValidatorIdentity111111111111111111111111111
Balance: 0.309294915 SOL
```

`Solana validator deposit:` retorna a conta de depósito que foi financiada

`Funded:` retorna o hash da transação, que você pode consultar no seu explorador Solana favorito

`Node ID:` retorna o ID do Validador pelo qual foi pago

`Balance:` retorna a quantidade de SOL que está na conta de depósito, após a conclusão da transferência

</div>
