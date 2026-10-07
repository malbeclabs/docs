---
description: Conecte-se ao DoubleZero no modo multicast para publicar ou assinar um ou mais feeds.
---

# Outra Conexão Multicast
!!! warning "Ao conectar-me ao DoubleZero, concordo com os [Termos de Serviço do DoubleZero](https://doublezero.xyz/terms-protocol)"
 
Informações detalhadas de conexão: 

### 1. Instalação do Cliente DoubleZero
Siga as instruções de [configuração](../setup.md) para instalar e configurar o cliente DoubleZero.

### 2. Instruções de Conexão 

Conecte-se ao DoubleZero no Modo Multicast
Como publicador: 

```doublezero connect multicast --publish <feed name>```

ou como assinante: 

```doublezero connect multicast --subscribe <feed name>```

ou para publicar e assinar: 

```doublezero connect multicast --publish <feed name> --subscribe <feed name>```

Para publicar ou assinar múltiplos feeds, você pode incluir vários nomes de feed separados por espaço.
Isso também pode ser usado para publicar e assinar feeds de publicação.
Por exemplo 
```doublezero connect multicast --subscribe feed1 feed2 feed3```

Você deverá ver uma saída semelhante à seguinte:
```
⚡  Connecting to devnet...
    DoubleZero ID: <your DoubleZero ID>
⚡  Provisioning for IP: <your public ip>
    Creating account for IP: <your public ip>
    Device selected: <the doublezero device you are connecting to>
✅  User Provisioned
```
### 3. Verifique sua conexão multicast ativa. 
Aguarde 60 segundos e então execute

```
doublezero status
```
Resultado esperado:
- Sessão BGP ativa na rede DoubleZero correta 
- Se você é um publicador, seu IP DoubleZero será diferente do seu IP Tunnel Src. Isso é esperado.
- Se você é apenas um assinante, `doublezero status` deixa o IP DoubleZero em branco. `doublezero user list` o exibe.

```
~$ doublezero status
 Tunnel Status  | Last Session Update     | Tunnel Name | Tunnel Src      | Tunnel Dst | Doublezero IP | User Type | Current Device | Lowest Latency Device | Metro   | Network
 BGP Session Up | 2026-02-11 20:46:20 UTC | doublezero1 | 137.174.145.145 | 100.0.0.1  | 198.18.0.1    | Multicast | ams-dz001      | ✅ ams-dz001         | Amsterdam | Testnet
```

Verifique os grupos aos quais você está conectado: 
```
doublezero user list --client-ip <your ip>
```

|account                                      | user_type | groups | device    | location    | cyoa_type  | client_ip       | dz_ip       | accesspass     | tunnel_id | tunnel_net       | status    | owner |
|----|----|----|----|----|----|----|----|----|----|----|----|----|
|wQWmt7L6mTyszhyLywJeTk85KJhe8BGW4oCcmxbhaxJ  | Multicast | P:mg02 | ams-dz001 | Amsterdam   | GREOverDIA | 137.174.145.145 | 198.18.0.1  | Prepaid: (MAX) | 515       | 169.254.3.58/31  | activated | DZfHfcCXTLwgZeCRKQ1FL1UuwAwFAZM93g86NMYpfYan|