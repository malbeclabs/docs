---
description: Diagnostique problemas comuns de conexão DoubleZero com comandos de referência, saídas esperadas e onde obter suporte adicional.
---

# Solução de Problemas

Este guia cobrirá uma variedade de problemas, e está em constante atualização. Se você completar o guia, pode buscar suporte adicional no discord [DoubleZero Tech](https://discord.com/channels/1341597747932958802/1344323790464880701).


## Comandos Comuns e Saídas

Para começar, examine a saída dos seguintes comandos e suas saídas esperadas. Estes irão auxiliá-lo em uma solução de problemas mais detalhada.
Se você abrir um ticket, poderão solicitar suas saídas.

#### 1. Verificar Versão
Comando:

`doublezero --version`

Saída de Exemplo:
```
DoubleZero 0.6.3
```
[comment]: # (when repo is public add this link to check https://github.com/malbeclabs/doublezero)

#### 2. Verificar Endereço DoubleZero
Comando:

`doublezero address`

Saída de Exemplo:
```
MTAwoHgKyTwwDGJo2dye6EWqyTn27JRwXxaDEaeMqe2
```
[comment]: # ()

#### 3. Verificar seu Access Pass

Pubkey de exemplo: `MTAwoHgKyTwwDGJo2dye6EWqyTn27JRwXxaDEaeMqe2` substitua pela sua pubkey ao executar o comando.

Comando:

`doublezero access-pass list | grep MTAwoHgKyTwwDGJo2dye6EWqyTn27JRwXxaDEaeMqe2`

Saída: [note que usamos `doublezero access-pass list | awk 'NR==1 || /MTAwoHgKyTwwDGJo2dye6EWqyTn27JRwXxaDEaeMqe2/'` para mostrar o cabeçalho nesta saída]
```
account                                      | accesspass_type                                                | ip              | user_payer                                   | last_access_epoch | remaining_epoch | connections | status       | owner

2XHCWm8Sef1GirhAhAJVA8WTXToPT6gFYP7fA9mWMShR | prepaid                                                        | 141.14.14.14   | MTAwoHgKyTwwDGJo2dye6EWqyTn27JRwXxaDEaeMqe2 | MAX               | MAX             | 0           | requested    | DZfHh2vjXFqt8zfNbT1afm8PGuCm3BrQKegC5THtKFdn 
```
[comment]: # ()
#### 4. Verificar Créditos no Ledger DoubleZero
Comando:

`doublezero balance`

Saída de Exemplo:
```
0.78 Credits
```
[comment]: # (add section linked later for 0 balance mainnet/testnet)

#### 5. Verificar Status da Conexão
Comando:

`doublezero status`

Saída de Exemplo:

```bash
 Tunnel status | Last Session Update     | Tunnel Name | Tunnel src    | Tunnel dst     | Doublezero IP | User Type | Current Device | Lowest Latency Device | Metro     | Network 
 up            | 2025-10-20 12:12:55 UTC | doublezero0 | 11.11.11.111 | 12.34.56.789 | 11.11.11.111 | IBRL      | ams-dz001      | ✅ ams-dz001          | Amsterdam | testnet
```
[comment]: # (in next iteration add "up" "unknown" and "down" explainers, which then link to a sectino below for troubleshooting undesired states.)


#### 6. Verificar Latência
Comando:

`doublezero latency`

Saída de Exemplo:
```
 pubkey                                       | code         | ip             | min      | max      | avg      | reachable 
 6E1fuqbDBG5ejhYEGKHNkWG5mSTczjy4R77XCKEdUtpb | nyc-dz001    | 64.86.249.22   | 2.49ms   | 2.61ms   | 2.56ms   | true
 Cpt3doj17dCF6bEhvc7VeAuZbXLD88a1EboTyE8uj6ZL | lon-dz001    | 195.219.120.66 | 71.94ms  | 72.11ms  | 72.02ms  | true
 CT8mP6RUoRcAB67HjKV9am7SBTCpxaJEwfQrSjVLdZfD | lax-dz001    | 207.45.216.134 | 72.42ms  | 72.51ms  | 72.45ms  | true
 4Wr7PQr5kyqCNJo3RKa8675K7ZtQ6fBUeorcexgp49Zp | ams-dz001    | 195.219.138.50 | 76.50ms  | 76.71ms  | 76.60ms  | true
 29ghthsKeH2ZCUmN2sUvhJtpEXn2ZxqAuq4sZFBFZmEs | fra-dz001    | 195.219.220.58 | 83.00ms  | 83.14ms  | 83.08ms  | true
 hWffRFpLrsZoF5r9qJS6AL2D9TEmSvPUBEbDrLc111Y  | fra-dz-001-x | 195.12.227.250 | 84.81ms  | 84.89ms  | 84.85ms  | true
 8jyamHfu3rumSEJt9YhtYw3J4a7aKeiztdqux17irGSj | prg-dz-001-x | 195.12.228.250 | 104.81ms | 104.83ms | 104.82ms | true
 5tqXoiQtZmuL6CjhgAC6vA49JRUsgB9Gsqh4fNjEhftU | tyo-dz001    | 180.87.154.78  | 178.04ms | 178.23ms | 178.13ms | true
 D3ZjDiLzvrGi5NJGzmM7b3YZg6e2DrUcBCQznJr3KfC8 | sin-dz001    | 180.87.102.98  | 227.67ms | 227.85ms | 227.75ms | true
```
[comment]: # ()

# Exemplos de Solução de Problemas
Agora que examinamos as saídas básicas, e o que é esperado em uma implantação saudável, podemos examinar alguns exemplos comuns de solução de problemas.

### Problema: ❌ Error creating user

Este problema geralmente está relacionado a uma incompatibilidade entre o par pubkey/IP esperado e o par pubkey/IP que o usuário está tentando usar para acessar o DoubleZero.

**Sintomas:**
- Ao conectar com `doublezero connect ibrl` o usuário encontra `❌ Error creating user`


**Soluções:**
1. Verifique

    `doublezero address`

    Saída de Exemplo:
    ```
    MTAwoHgKyTwwDGJo2dye6EWqyTn27JRwXxaDEaeMqe2
    ```
2. verifique se este endereço está na lista de permitidos:

    `doublezero access-pass list | awk 'NR==1 || /MTAwoHgKyTwwDGJo2dye6EWqyTn27JRwXxaDEaeMqe2/'`

    Saída de Exemplo:
    ```
    account                                      | accesspass_type                                                | ip              | user_payer                                   | last_access_epoch | remaining_epoch | connections | status       | owner

    FHyoPs7U23MuSTtepEyXUtSAEffEpFpJGoYvug8X2sWY | prepaid                                                        | 141.14.14.14   | MTAwoHgKyTwwDGJo2dye6EWqyTn27JRwXxaDEaeMqe2 | MAX               | MAX             | 0           | requested    | DZfHh2vjXFqt8zfNbT1afm8PGuCm3BrQKegC5THtKFdn 
    ```
     A pubkey de `doublezero address` deve corresponder à pubkey user_payer e o Endereço IP de onde você está tentando conectar deve corresponder ao ip no Access-Pass.
    `doublezero address` é obtido do arquivo id.json em ~/.config/doublezero/ por padrão. Veja o [passo 6 aqui](<setup.md>)
    
3. Se o acima parecer correto e você estiver recebendo um erro ao conectar, ou se o mapeamento acima estiver incorreto, entre em contato com o suporte em [DoubleZero Tech](https://discord.com/channels/1341597747932958802/1344323790464880701)

### Problema: ❌ Error provisioning service: malformed stuff: cannot provision multiple tunnels at the same time
Este erro indica que um dispositivo já está conectado ao DoubleZero.

**Sintomas:**
- O usuário tenta conectar ao DoubleZero
- `❌ Error provisioning service: malformed stuff: cannot provision multiple tunnels at the same time` é encontrado.

**Soluções:**
1. Verifique
    `doublezero status`

    Saída:
    ```bash
    Tunnel status | Last Session Update     | Tunnel Name | Tunnel src    | Tunnel dst     | Doublezero IP | User Type | Current Device | Lowest Latency Device | Metro     | Network 
    up            | 2025-10-20 12:12:55 UTC | doublezero0 | 11.11.11.111 | 12.34.56.789 | 11.11.11.111 | IBRL      | ams-dz001      | ✅ ams-dz001          | Amsterdam | testnet
    ```
2. -`up`- indica uma conexão saudável.
3. O erro aparece porque um túnel para o DoubleZero com o IP DoubleZero específico já está ativo nesta máquina.

    Este erro é frequentemente encontrado após uma atualização do cliente DoubleZero. As atualizações do DoubleZero reiniciam automaticamente o serviço doublezerod e irão reconectá-lo se você estava conectado antes do reinício do serviço.


### Problema: Status do DoubleZero é unknown ou down
Este problema geralmente está relacionado ao túnel GRE sendo ativado com sucesso entre o servidor e o Dispositivo DoubleZero, mas um firewall impedindo o estabelecimento da sessão BGP. Por causa disso, você não está recebendo rotas da rede nem enviando tráfego pelo DoubleZero.

**Sintomas:**
- `doublezero connect ibrl` foi bem-sucedido. No entanto, `doublezero status` retorna `down` ou `unknown`
    ```
    doublezero connect ibrl                                                                                                                                                                                                                                                                                                                                  
    DoubleZero Service Provisioning
    🔗  Start Provisioning User...
    Public IP detected: 111.11.11.11 - If you want to use a different IP, you can specify it with `--client-ip x.x.x.x`
    🔍  Provisioning User for IP: 111.11.11.11
    User account created
    Connected to device: nyc-dz001
    The user has been successfully activated
    Service provisioned with status: ok
    ✅  User Provisioned
    ```

    ```bash
    Tunnel status | Last Session Update     | Tunnel Name | Tunnel src    | Tunnel dst     | Doublezero IP | User Type | Current Device | Lowest Latency Device | Metro     | Network 
    up            | 2025-10-20 12:12:55 UTC | doublezero0 | 11.11.11.111 | 12.34.56.789 | 11.11.11.111 | IBRL      | ams-dz001      | ✅ ams-dz001          | Amsterdam | testnet
    ```

**Soluções:**
1. Verifique suas regras de firewall!

   O DoubleZero usa espaço de endereço link local: 169.254.0.0/16 para as interfaces de túnel GRE entre sua máquina e o Dispositivo DoubleZero. 169.254.0.0/16 é tipicamente um espaço "não roteável" e, portanto, boas práticas de segurança recomendam bloquear comunicações de/para este espaço. Você precisará permitir uma regra no seu firewall que habilite src 169.254.0.0/16 a comunicar com dst 169.254.0.0/16 na porta tcp 179. Essa regra precisará ser colocada acima de quaisquer regras que neguem tráfego para 169.254.0.0/16.

    Em um firewall como ufw você pode executar `sudo ufw status` para visualizar as regras do firewall e

    Saída de Exemplo que pode ser algo similar ao que um validador Solana teria.
    ```
    To                         Action      From
    --                         ------      ----
    22/tcp                     ALLOW       Anywhere
    8899/tcp                   ALLOW       Anywhere
    8000:10000/tcp             ALLOW       Anywhere
    8000:10000/udp             ALLOW       Anywhere
    11200:11300/udp            ALLOW       Anywhere
    11200:11300/tcp            ALLOW       Anywhere

    To                         Action      From
    --                         ------      ----
    10.0.0.0/8                 DENY OUT    Anywhere
    169.254.0.0/16             DENY OUT    Anywhere
    172.16.0.0/12              DENY OUT    Anywhere
    192.168.0.0/16             DENY OUT    Anywhere
    ```

    Na saída acima, você vê que todo o tráfego para 169.254.0.0/16, exceto pelas portas especificadas, é negado.
    `sudo ufw insert <N> allow proto tcp from 169.254.0.0/16 to 169.254.0.0/16 port 179` para inserir a regra na posição <N>. Ou seja, se N = 1 então você inserirá esta regra como a primeira regra.
    `sudo ufw status numbered` mostrará a ordenação numérica das regras.
    
### Problema: O dispositivo DoubleZero mais próximo mudou

Isto não é um erro, mas pode ser uma otimização. Abaixo está uma melhor prática que pode ser executada de tempos em tempos, ou automatizada.

**Soluções:**

1. Verifique a latência para o dispositivo mais próximo
    - execute `doublezero latency`

        saída
        ```
         pubkey                                       | code          | ip              | min      | max      | avg      | reachable 
         2hPMFJHh5BPX42ygBvuYYJfCv9q7g3rRR3ZRsUgtaqUi | dz-ny7-sw01   | 137.239.213.162 | 1.80ms   | 1.90ms   | 1.84ms   | true      
         ETdwWpdQ7fXDHH5ea8feMmWxnZZvSKi4xDvuEGcpEvq3 | dz-ny5-sw01   | 137.239.213.170 | 1.83ms   | 2.10ms   | 1.92ms   | true      
         8gisbwJnNhMNEWz587cAJMtSSFuWeNFtiufPuBTVqF2Z | dz-ny7-sw02   | 142.215.184.122 | 1.87ms   | 2.66ms   | 2.15ms   | true      
         8J691gPwzy9FzUZQ4SmC6jJcY7By8kZXfbJwRfQ8ns31 | nyc002-dz002  | 38.122.35.137   | 2.33ms   | 2.39ms   | 2.37ms   | true      
         FEML4XsDPN3WfmyFAXzE2xzyYqSB9kFCRrMik8JqN6kT | nyc001-dz001  | 38.104.167.29   | 2.29ms   | 2.59ms   | 2.40ms   | true   
        ```
        note acima que o dispositivo mais próximo é `dz-ny7-sw01`

        Queremos conectar a este dispositivo:

2. Determine se você já está conectado ao dispositivo alvo
    - execute `doublezero user list --env testnet | grep 111.11.11.11` substitua `111.11.11.11` pelo endereço IPv4 público do seu dispositivo que está conectado ao DoubleZero. Você também pode usar seu ID de validador, ou ID do DoubleZero.

        saída
        ```
        account                                      | user_type           | groups                        | device       | location    | cyoa_type  | client_ip       | dz_ip           | accesspass                                                      | tunnel_id | tunnel_net       | status    | owner                                        
        6QRU1ivJnKGHpom2BdzH9PiTRkJ5WhunPNLtfYcqVisW | IBRL                |                               | dz-ny7-sw01     | New York    | GREOverDIA | 111.11.11.11    | 111.11.11.11    | Prepaid: (MAX)                                                  | 514       | 111.254.1.111/31 | activated | DZfHh2vjXFqt8zfNbT1afm8PGuCm3BrQKegC5THtKFdn 
        ```
        Neste exemplo, já estamos conectados ao dispositivo mais próximo. Nenhuma etapa adicional é necessária, podemos parar aqui.


        Vamos considerar, em vez disso, se a saída fosse
         ```
        account                                      | user_type           | groups                        | device       | location    | cyoa_type  | client_ip       | dz_ip           | accesspass                                                      | tunnel_id | tunnel_net       | status    | owner                                        
        6QRU1ivJnKGHpom2BdzH9PiTRkJ5WhunPNLtfYcqVisW | IBRL                |                               | fra-dz-001-x     | New York    | GREOverDIA | 111.11.11.11    | 111.11.11.11    | Prepaid: (MAX)                                                  | 514       | 111.254.1.111/31 | activated | DZfHh2vjXFqt8zfNbT1afm8PGuCm3BrQKegC5THtKFdn 
        ```
        Esta seria uma conexão sub-ótima. Vamos considerar se a reconexão é necessária.

        Antes da conexão, verificaremos se o dispositivo tem túneis de usuário disponíveis.

3. Opcional: examine a rede para dispositivos disponíveis

    Para fins educacionais, primeiro:
    - execute `doublezero device list` para uma lista completa de dispositivos. Extraímos 2 dispositivos como exemplo para explicar a saída.

        saída:
        ```
        account                                      | code          | contributor | location  | exchange | device_type | public_ip       | dz_prefixes                      | users | max_users | status    | mgmt_vrf | owner                                        
        GphgLkA7JDVtkDQZCiDrwrDvaUs8r8XczEae1KkV6CGQ | ams001-dz002  | jump_       | EQX-AM4   | ams      | switch      | 149.11.64.57    | 38.246.201.64/27                 | 69    | 128       | activated |          | H647kAwTcWsGXZUK3BTr1JyTBZmbNcYyCmRFFCEnXUVp 
        7FfrX8YbvbzM8A1ojNynP9BjiKpK9rrmhdEdchB2myhG | dz-fr5-sw01   | glxy        | EQX-FR5   | fra      | switch      | 89.222.118.225  | 89.222.118.228/30                | 0     | 0         | activated |          | 5YbNrJHJJoiRwVEvgAWRGdFRG9gRdZ47hLCKSym8bqbp 
        ```
        Note acima que `ams001-dz002` tem 69 usuários e 128 máximo de usuários. Este dispositivo pode adicionar 59 usuários.

        No entanto, `dz-fr5-sw01` tem 0 usuários e 0 máximo de usuários. Você não conseguirá conectar a este dispositivo. Com máximo de usuários em 0, o dispositivo não está aceitando nenhuma conexão.

        Agora vamos retornar à conexão com nosso dispositivo mais próximo.

4. Determine se o dispositivo alvo tem uma conexão disponível
    - execute `doublezero device list | grep dz-ny7-sw01` substitua `dz-ny7-sw01` pelo seu dispositivo alvo

        saída
        ```
        2hPMFJHh5BPX42ygBvuYYJfCv9q7g3rRR3ZRsUgtaqUi | dz-ny7-sw01   | glxy        | EQX-NY7   | nyc      | switch      | 137.239.213.162 | 137.239.216.164/31               | 29    | 128       | activated |          | 5YbNrJHJJoiRwVEvgAWRGdFRG9gRdZ47hLCKSym8bqbp 
        ```
        aqui podemos ver que `dz-ny7-sw01` tem espaço disponível para conexão.

5. Conecte ao Dispositivo DoubleZero mais próximo

    Vamos desconectar e depois reconectar ao DoubleZero.

    Primeiro execute
    - `doublezero disconnect`

      saída

        ```
        DoubleZero Service Provisioning
        🔍  Decommissioning User
        Public IP detected: 111.11.11.11 - If you want to use a different IP, you can specify it with `--client-ip x.x.x.x`
        \ [00:00:00] [##########>-----------------------------] 1/4 deleting user       account...                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     🔍  Deleting User Account for: 6QRU1ivJnKGHpom2BdzH9PiTRkJ5WhunPNLtfYcqVisW
        🔍  User Account deleted
        ✅  Deprovisioning Complete
        ```
    agora verificamos o status para confirmar nossa desconexão com
    - `doublezero status`

    saída

    ```
    Tunnel status | Last Session Update | Tunnel Name | Tunnel src | Tunnel dst | Doublezero IP | User Type 
    disconnected  | no session data     |             |            |            |               |    
    ```
    Por último, vamos reconectar com
    - `doublezero connect ibrl`

    saída
    ```
    DoubleZero Service Provisioning
    🔗  Start Provisioning User...
    Public IP detected: 111.11.11.11 - If you want to use a different IP, you can specify it with `--client-ip x.x.x.x`
    🔍  Provisioning User for IP: 111.11.11.11
    User account created
    Connected to device: dz-ny7-sw01 
    Service provisioned with status: ok
    ✅  User Provisioned
    ```
    note na saída acima que nos conectamos com `Connected to device: dz-ny7-sw01` — este é o resultado desejado de nossa investigação inicial no passo 1, onde descobrimos que `dz-ny7-sw01` era o dispositivo com a menor latência.

### Problema: Ambiente DoubleZero incorreto

Mainnet-Beta e Testnet usam repositórios de pacotes diferentes. `doublezero status` mostra em qual rede o cliente está (coluna `Network`). Se um usuário instalou o cliente errado, ou o daemon ainda está apontando para o outro ambiente, use estas trocas de copiar e colar.

Para configurar a CLI do Cliente DoubleZero (`doublezero`) e o daemon (`doublezerod`) para conectar ao **DoubleZero testnet**:

```bash
DESIRED_DOUBLEZERO_ENV=testnet \
	&& sudo mkdir -p /etc/systemd/system/doublezerod.service.d \
	&& echo -e "[Service]\nExecStart=\nExecStart=/usr/bin/doublezerod -sock-file /run/doublezerod/doublezerod.sock -env $DESIRED_DOUBLEZERO_ENV" | sudo tee /etc/systemd/system/doublezerod.service.d/override.conf > /dev/null \
	&& sudo systemctl daemon-reload \
	&& sudo systemctl restart doublezerod \
	&& doublezero config set --env $DESIRED_DOUBLEZERO_ENV  > /dev/null \
	&& echo "✅ doublezerod configured for environment $DESIRED_DOUBLEZERO_ENV"
```

Para configurar a CLI do Cliente DoubleZero (`doublezero`) e o daemon (`doublezerod`) para conectar ao **DoubleZero mainnet-beta**:

```bash
DESIRED_DOUBLEZERO_ENV=mainnet-beta \
	&& sudo mkdir -p /etc/systemd/system/doublezerod.service.d \
	&& echo -e "[Service]\nExecStart=\nExecStart=/usr/bin/doublezerod -sock-file /run/doublezerod/doublezerod.sock -env $DESIRED_DOUBLEZERO_ENV" | sudo tee /etc/systemd/system/doublezerod.service.d/override.conf > /dev/null \
	&& sudo systemctl daemon-reload \
	&& sudo systemctl restart doublezerod \
	&& doublezero config set --env $DESIRED_DOUBLEZERO_ENV  > /dev/null \
	&& echo "✅ doublezerod configured for environment $DESIRED_DOUBLEZERO_ENV"
```

Você deverá ver: `✅ doublezerod configured for environment mainnet-beta` (ou `testnet`). Então `doublezero status` deverá mostrar o `Network` correspondente.

### Problema: `doublezero status` retorna alguns campos com N/A

Este problema geralmente está relacionado a uma incompatibilidade entre o daemon e cliente atuais, versus o daemon e cliente com os quais o túnel DZ conectado foi estabelecido.

**Sintomas:**
- Ao executar `doublezero status` o usuário encontra `N/A` em alguns campos




**Soluções:**
1. Execute
`doublezero status`

    Exemplo:

    ```
    Tunnel status | Last Session Update     | Tunnel Name | Tunnel src   | Tunnel dst   | Doublezero IP | User Type | Current Device | Lowest Latency Device | Metro | Network
    up            | 2025-10-20 20:06:18 UTC | doublezero0 | 149.28.38.64 | 64.86.249.22 | 149.28.38.64  | IBRL      | N/A            | ✅ dz-ny7-sw01        | N/A   | mainnet-beta
    ```

    Note em nosso exemplo de saída acima que o `Tunnel status` é `up`. Nossa `Network` é `mainnet-beta`. No entanto, `Current Device` e `Metro` são `N/A`

    Isto é indicativo de um túnel aberto na sua máquina que não está no seu ambiente atual.
    Neste caso, o status `up`, sem `Current Device` encontrado em `mainnet-beta`, nos revela que nosso túnel está na testnet!
 
2. Troque o ambiente usando os comandos de copiar e colar em [Ambiente DoubleZero incorreto](#problema-ambiente-doublezero-incorreto). Use o oposto do valor `Network` que está retornando `N/A`.

3. Verifique seu status

    Após trocar os ambientes execute:

    ```
    doublezero status
    ```

    A saída esperada deve ser similar a:

    ``` 
    Tunnel status | Last Session Update     | Tunnel Name | Tunnel src   | Tunnel dst   | Doublezero IP | User Type | Current Device | Lowest Latency Device | Metro    | Network 
    up            | 2025-10-21 12:32:12 UTC | doublezero0 | 149.28.38.64 | 64.86.249.22 | 149.28.38.64  | IBRL      | nyc-dz001      | ✅ nyc-dz001          | New York | testnet 
    ```
Com todos os campos preenchidos, você agora está no ambiente correto.