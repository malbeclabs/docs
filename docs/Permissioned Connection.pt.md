---
description: Integração com permissão para não-validadores e RPCs conectando ao DoubleZero Mainnet-Beta e Testnet no modo IBRL.
---

# Conexão com Permissão de Não-Validador ao DoubleZero no Modo IBRL
!!! warning "Ao conectar ao DoubleZero, eu concordo com os [Termos de Serviço do DoubleZero](https://doublezero.xyz/terms-protocol)"

<div data-wizard-step="rpc-onboarding" markdown>

### Visão Geral da Integração de Usuário com Permissão

A integração de usuários é atualmente com permissão para não-validadores e RPCs. Para iniciar o fluxo com permissão, por favor preencha [este formulário](https://forms.fillout.com/t/s77k7wandMus?id=rec08iF4Z8kVFGm1z). Aqui está o que esperar durante este processo:

- Poderão existir taxas associadas ao uso de Usuário com Permissão no futuro.
- Após o envio do formulário, monitore seu contato principal no Telegram.

</div>

### Conectando ao Mainnet-Beta e Testnet no Modo IBRL

!!! Note inline end
    O modo IBRL não requer reiniciar os clientes validadores, porque utiliza o seu endereço IP público existente.

Usuários com Permissão completarão a conexão ao DoubleZero Mainnet-beta, que está detalhada nesta página.

## 1. Confirmar a rede do cliente

Por favor, siga as instruções de [configuração](setup.md) antes de prosseguir. Instale os pacotes de Mainnet-Beta ou Testnet para a rede desejada — eles utilizam repositórios de pacotes diferentes.

O último passo na configuração foi desconectar da rede. Isso é para garantir que apenas um túnel esteja aberto na sua máquina para o DoubleZero, e que esse túnel esteja na rede correta.

Confirme com:

```bash
doublezero status
```

A coluna `Network` deve corresponder à rede à qual você pretende se conectar. Se não corresponder, use a opção de troca por copiar e colar na seção de [solução de problemas](troubleshooting.md#issue-wrong-doublezero-environment).

Após cerca de 30 segundos, você verá os dispositivos DoubleZero disponíveis:

```bash
doublezero latency
```
Exemplo de saída (Testnet)
```bash
 pubkey                                       | code          | ip              | min      | max      | avg      | reachable 
 2hPMFJHh5BPX42ygBvuYYJfCv9q7g3rRR3ZRsUgtaqUi | dz-ny7-sw01   | 137.239.213.162 | 1.74ms   | 1.92ms   | 1.84ms   | true      
 ETdwWpdQ7fXDHH5ea8feMmWxnZZvSKi4xDvuEGcpEvq3 | dz-ny5-sw01   | 137.239.213.170 | 1.88ms   | 4.39ms   | 2.72ms   | true      
 8J691gPwzy9FzUZQ4SmC6jJcY7By8kZXfbJwRfQ8ns31 | nyc002-dz002  | 38.122.35.137   | 2.45ms   | 3.30ms   | 2.74ms   | true      
 8gisbwJnNhMNEWz587cAJMtSSFuWeNFtiufPuBTVqF2Z | dz-ny7-sw02   | 142.215.184.122 | 1.88ms   | 5.13ms   | 3.02ms   | true      
 uzyg9iYw2FEbtdTHaDb5HoeEWYAPRPQgvsgyd873qPS  | nyc001-dz002  | 4.42.212.122    | 3.17ms   | 3.63ms   | 3.33ms   | true      
 FEML4XsDPN3WfmyFAXzE2xzyYqSB9kFCRrMik8JqN6kT | nyc001-dz001  | 38.104.167.29   | 2.33ms   | 5.46ms   | 3.39ms   | true      
 9oKLaL6Hwno5TyAFutTbbkNrzxm1fw9fhzkiUHgsxgGx | dz-dc10-sw01  | 137.239.200.186 | 6.84ms   | 7.01ms   | 6.91ms   | true      
 DESzDP8GkSTpQLkrUegLkt4S2ynGfZX5bTDzZf3sEE58 | was001-dz002  | 38.88.214.133   | 7.39ms   | 7.44ms   | 7.41ms   | true      
 HHNCpqB7CwHVLxAiB1S86ko6gJRzLCtw78K1tc7ZpT5P | was001-dz001  | 66.198.11.74    | 7.67ms   | 7.85ms   | 7.76ms   | true      
 9LFtjDzohKvCBzSquQD4YtL3HwuvkKBDE7KSzb8ztV2b | dz-mtl11-sw01 | 134.195.161.10  | 9.88ms   | 10.01ms  | 9.95ms   | true      
 9M7FfYYyjM4wGinKPofZRNmQFcCjCKRbXscGBUiXvXnG | dz-tor1-sw01  | 209.42.165.10   | 14.52ms  | 14.53ms  | 14.52ms  | true           
```
A saída do Testnet será idêntica em estrutura, mas com muito mais dispositivos disponíveis.

## 2. Contatar a Fundação DoubleZero

A fundação DoubleZero. Você precisará fornecer seu `DoubleZeroID`, seu `Validator ID` (ID do nó) e o `endereço ipv4 público` a partir do qual você estará se conectando.


<div data-wizard-step="rpc-connect-ibrl" markdown>

## 3. Conectar no Modo IBRL

No servidor, com o usuário que irá se conectar ao DoubleZero, execute o comando `connect` para estabelecer a conexão ao DoubleZero.

```bash
doublezero connect ibrl
```

Você deverá ver uma saída indicando o provisionamento, como:

```
DoubleZero Service Provisioning
🔗  Start Provisioning User...
Public IP detected: 137.184.101.183 - If you want to use a different IP, you can specify it with `--client-ip x.x.x.x`
🔍  Provisioning User for IP: 137.184.101.183
    User account created
    Connected to device: nyc-dz001
    The user has been successfully activated
    Service provisioned with status: ok
✅  User Provisioned
```
Aguarde um minuto para que o túnel seja concluído. Até que o túnel seja concluído, a saída do seu status pode retornar "down" ou "Unknown"

Verifique sua conexão:

```bash
doublezero status
```

**Saída:**
```bash
Tunnel status | Last Session Update     | Tunnel Name | Tunnel src      | Tunnel dst   | DoubleZero IP   | User Type
up            | 2025-09-10 12:16:03 UTC | doublezero0 | 137.184.101.183 | 64.86.249.22 | 137.184.101.183 | IBRL
```
Um status de `up` significa que você está conectado com sucesso.

Você poderá visualizar as rotas propagadas por outros usuários no DoubleZero executando:

```
ip route
```
Saída:

```
default via 149.28.38.1 dev enp1s0 proto dhcp src 149.28.38.64 metric 100 
5.39.216.186 via 169.254.0.68 dev doublezero0 proto bgp src 149.28.38.64 
5.39.251.201 via 169.254.0.68 dev doublezero0 proto bgp src 149.28.38.64 
5.39.251.202 via 169.254.0.68 dev doublezero0 proto bgp src 149.28.38.64 
...
```

</div>

### Próximo Passo: Multicast

Se você concluiu esta configuração e planeja usar Multicast, prossiga para a [próxima página](Other%20Multicast%20Connection.md).