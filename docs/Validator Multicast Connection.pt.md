---
description: Configure um validador conectado para publicar leader shreds no feed multicast edge do DoubleZero.
---

# Conexão Multicast do Validador
!!! warning "Ao conectar-se ao DoubleZero, eu concordo com os [Termos de Serviço do DoubleZero](https://doublezero.xyz/terms-protocol)"

!!! note inline end "Empresas de trading e negócios"
    Se você opera uma empresa de trading ou negócio e deseja assinar o feed, registre seu interesse para obter mais informações [aqui](https://doublezero.xyz/edge-form).

Se você ainda não está conectado ao DoubleZero, por favor complete a documentação de [Configuração](<setup.md>) e de conexão do validador à [Mainnet-Beta](<DZ Mainnet-beta Connection.md>).

Se você é um validador que já está conectado ao DoubleZero, pode continuar este guia.

## 1. Configuração do Cliente

### Jito-Agave (v3.1.9+) e Harmonic (3.1.11+)

1. No seu script de inicialização do validador, adicione: `--shred-receiver-address 233.84.178.1:7733`

    Você pode enviar para o Jito e para o grupo `edge-solana-shreds` ao mesmo tempo.

    exemplo:

    ```json
    #!/bin/bash
    export PATH="/home/sol/.local/share/solana/install/releases/v3.1.9-jito/bin:$PATH"
    BLOCK_ENGINE_URL=https://ny.mainnet.block-engine.jito.wtf
    RELAYER_URL=http://ny.mainnet.relayer.jito.wtf:8100
    SHRED_RECEIVER_ADDR=<JitoBlockEngineAddress>
    <...The rest of your config...>
    --shred-receiver-address 233.84.178.1:7733
    ```

2. Reinicie seu validador.
3. Conecte-se ao grupo multicast do DoubleZero `edge-solana-shreds` como publicador: `doublezero connect ibrl && doublezero connect multicast --publish edge-solana-shreds`

### Frankendancer

1. No `config.toml`, adicione:

    ```toml
    [tiles.shred]
    additional_shred_destinations_leader = [ "233.84.178.1:7733", ]
    ```

2. Reinicie seu validador.
3. Conecte-se ao grupo multicast do DoubleZero `edge-solana-shreds` como publicador: `doublezero connect ibrl && doublezero connect multicast --publish edge-solana-shreds`

## 2. Confirme que você está publicando leader shreds

Depois de conectado, você pode verificar [este painel](https://data.doublezero.xyz/dz/publisher-check) para confirmar que está publicando shreds. Você não verá confirmação até que tenha publicado leader shreds por pelo menos um slot.

## Endpoints Multicast (IP vs Porta)

Para o tráfego de shreds, o **endereço IP** seleciona o feed multicast e a **porta** seleciona o serviço UDP.  
Todos os feeds abaixo utilizam a porta UDP `7733`.

Você pode descobrir os IPs de grupo atuais com:

```bash
doublezero multicast group list
```

- `edge-solana-shreds` (leader): `233.84.178.1:7733`
- `edge-solana-retrans-eu`: `233.84.178.12:7733`
- `edge-solana-retrans-apac`: `233.84.178.13:7733`
- `edge-solana-retrans-amer`: `233.84.178.14:7733`

Para referências de API e endpoints de dados legíveis por máquina, consulte [https://data.doublezero.xyz/api/v1/docs](https://data.doublezero.xyz/api/v1/docs).

## 3. Recompensas do Validador

Para cada epoch em que os validadores publicam leader shreds, eles serão recompensados proporcionalmente por sua contribuição com base nas assinaturas. Os detalhes deste sistema serão anunciados e detalhados em uma data posterior.

## Solução de Problemas

### Não Publicando Leader Shreds:

A causa mais comum para não transmitir shreds é a versão do cliente:

Você deve estar executando Jito-Agave 3.1.9+, JitoBam 3.1.9+, Frankendancer ou Harmonic 3.1.11+. Outras versões de cliente não funcionarão.

### Retransmitindo:

1. Uma causa comum de retransmissão de shreds é uma configuração simples. Você pode ter a flag habilitada para enviar shreds de retransmissão no seu script de inicialização; será necessário desabilitá-la.

    A flag a ser removida no Jito-Agave é: `--shred-retransmit-receiver-address`.

1. Verifique o [painel do publicador](https://data.doublezero.xyz/dz/publisher-check) e veja se você tem algum shred retransmitido. Na tabela, observe a coluna **No Retransmit Shreds** — um X vermelho significa que você está retransmitindo.

    !!! note "visualização por epoch"
        Note que existem diferentes janelas de tempo para visualizar o painel do publicador. Se você vir retransmissão na **visualização de 2 epochs**, mas fez uma alteração recente, tente mudar para a visualização de **slot recente**.


    ![Painel de verificação do publicador](images/publisher-check-dashboard.png)

2. Encontre o IP do seu cliente e procure seu usuário em [DoubleZero Data](https://data.doublezero.xyz/dz/users).

    ![Usuários do DoubleZero Data](images/doublezero-data-users.png)

3. Clique em **Multicast** para abrir sua visualização multicast.

    A captura de tela abaixo mostra: **Retransmitindo** (indesejável) tráfego de saída constante sem padrão de leader-slot.

    ![Visualização multicast do usuário - exemplo de retransmissão](images/user-multicast-view-retransmit.png)

    A captura de tela abaixo mostra: **Saudável** (publicando apenas leader shreds) tráfego de saída em picos, conhecido como padrão dente de serra, que se alinha com seus leader slots.

    ![Visualização multicast do usuário - exemplo de publicador saudável](images/user-multicast-view-healthy.png)

O gráfico mostra se você está enviando apenas leader shreds. Os picos de tráfego devem se alinhar com quando você tem um leader slot. Quando você não tem leader slot, não deve haver tráfego. Se você está retransmitindo, verá um fluxo constante de tráfego em vez de picos alinhados aos slots.