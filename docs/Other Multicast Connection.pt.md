# Outra Conexão Multicast
!!! warning "Ao conectar ao DoubleZero, concordo com os [Termos de Serviço do DoubleZero](https://doublezero.xyz/terms-protocol)"


|Caso de Uso | Primeiro Passo | Quando Aprovado, conecte via:|
|---------|------------|---------------------------|
|Assinar o Jito Shredstream | Entre em contato com o Jito para aprovação. | ```doublezero connect multicast --subscribe jito-shredstream``` |

Informações detalhadas de conexão:

### 1. Instalação do Cliente DoubleZero
Siga as instruções de [configuração](setup.md) para instalar e configurar o cliente DoubleZero.

### 2. Instruções de Conexão

Conecte-se ao DoubleZero no Modo Multicast
Como publicador:

```doublezero connect multicast --publish <nome do feed>```

ou como assinante:

```doublezero connect multicast --subscribe <nome do feed>```

ou para publicar e assinar:

```doublezero connect multicast --publish <nome do feed> --subscribe <nome do feed>```

Para publicar ou assinar em múltiplos feeds, você pode incluir múltiplos nomes de feeds separados por espaço.
Isso também pode ser usado para publicar e assinar feeds de publicação.
Por exemplo:
```doublezero connect multicast --subscribe feed1 feed2 feed3```

Você deve ver uma saída similar à seguinte:
```
DoubleZero Service Provisioning
🔗  Start Provisioning User to devnet...
Public IP detected: 137.174.145.145 - If you want to use a different IP, you can specify it with `--client-ip x.x.x.x`
    DoubleZero ID: <seu dz_id>
🔍  Provisioning User for IP: <seu ip público>
    Creating an account for the IP: <seu ip público>
    The Device has been selected: <o dispositivo doublezero ao qual você está se conectando>
    Service provisioned with status: ok
✅  User Provisioned
```
### 3. Verifique sua conexão multicast ativa.
Aguarde 60 segundos e então execute

```
doublezero status
```
Resultado esperado:
- Sessão BGP ativa na Rede DoubleZero correta
- Se você é um publicador, seu IP DoubleZero será diferente do seu IP de Origem do Túnel. Isso é esperado.
- Se você é apenas um assinante, seu IP DoubleZero será o mesmo que seu IP de Origem do Túnel.

```
~$ doublezero status
 Tunnel Status  | Last Session Update     | Tunnel Name | Tunnel Src      | Tunnel Dst | Doublezero IP | User Type | Current Device | Lowest Latency Device | Metro   | Network
 BGP Session Up | 2026-02-11 20:46:20 UTC | doublezero1 | 137.174.145.145 | 100.0.0.1  | 198.18.0.1    | Multicast | ams-dz001      | ✅ ams-dz001         | Amsterdam | Testnet
```

Verifique os grupos aos quais você está conectado:
```
doublezero user list --client-ip <seu ip>
```

|account                                      | user_type | groups | device    | location    | cyoa_type  | client_ip       | dz_ip       | accesspass     | tunnel_id | tunnel_net       | status    | owner |
|----|----|----|----|----|----|----|----|----|----|----|----|----|
|wQWmt7L6mTyszhyLywJeTk85KJhe8BGW4oCcmxbhaxJ  | Multicast | P:mg02 | ams-dz001 | Amsterdam   | GREOverDIA | 137.174.145.145 | 198.18.0.1  | Prepaid: (MAX) | 515       | 169.254.3.58/31  | activated | DZfHfcCXTLwgZeCRKQ1FL1UuwAwFAZM93g86NMYpfYan|
