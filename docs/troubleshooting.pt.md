# Solução de Problemas

Este guia cobrirá uma variedade de problemas, e está em andamento. Se você completar o guia, pode buscar suporte adicional no Discord [DoubleZero Tech](https://discord.com/channels/1341597747932958802/1344323790464880701).


## Comandos Comuns e Saídas

Para começar, examine a saída dos seguintes comandos e sua saída esperada. Eles irão auxiliá-lo em uma solução de problemas mais detalhada.
Se você abrir um ticket, pode ser solicitado que você forneça a saída deles.

#### 1. Verificar Versão
Comando:

`doublezero --version`

Exemplo de Saída:
```
DoubleZero 0.6.3
```

#### 2. Verificar Endereço DoubleZero
Comando:

`doublezero address`

Exemplo de Saída:
```
MTAwoHgKyTwwDGJo2dye6EWqyTn27JRwXxaDEaeMqe2
```

#### 3. Verificar seu Passe de Acesso

Pubkey de exemplo: `MTAwoHgKyTwwDGJo2dye6EWqyTn27JRwXxaDEaeMqe2` — substitua pela sua pubkey ao executar o comando.

Comando:

`doublezero access-pass list | grep MTAwoHgKyTwwDGJo2dye6EWqyTn27JRwXxaDEaeMqe2`

Saída:
```
account                                      | accesspass_type                                                | ip              | user_payer                                   | last_access_epoch | remaining_epoch | connections | status       | owner

2XHCWm8Sef1GirhAhAJVA8WTXToPT6gFYP7fA9mWMShR | prepaid                                                        | 141.14.14.14   | MTAwoHgKyTwwDGJo2dye6EWqyTn27JRwXxaDEaeMqe2 | MAX               | MAX             | 0           | requested    | DZfHh2vjXFqt8zfNbT1afm8PGuCm3BrQKegC5THtKFdn
```

#### 4. Verificar Créditos do Ledger DoubleZero
Comando:

`doublezero balance`

Exemplo de Saída:
```
0.78 Credits
```

#### 5. Verificar Status da Conexão
Comando:

`doublezero status`

Exemplo de Saída:

```bash
 Tunnel status | Last Session Update     | Tunnel Name | Tunnel src    | Tunnel dst     | Doublezero IP | User Type | Current Device | Lowest Latency Device | Metro     | Network
 up            | 2025-10-20 12:12:55 UTC | doublezero0 | 11.11.11.111 | 12.34.56.789 | 11.11.11.111 | IBRL      | ams-dz001      | ✅ ams-dz001          | Amsterdam | testnet
```


#### 6. Verificar Latência
Comando:

`doublezero latency`

Exemplo de Saída:
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

# Exemplos de Solução de Problemas
Agora que examinamos as saídas básicas e o que é esperado em uma implantação saudável, podemos examinar alguns exemplos comuns de solução de problemas.

### Problema: ❌ Error creating user

Este problema geralmente está relacionado a uma incompatibilidade entre o par pubkey/IP esperado e o par pubkey/IP que o usuário está tentando usar para acessar o DoubleZero.

**Sintomas:**
- Ao conectar com `doublezero connect ibrl`, o usuário encontra `❌ Error creating user`


**Soluções:**
1. Verifique

    `doublezero address`

    Exemplo de Saída:
    ```
    MTAwoHgKyTwwDGJo2dye6EWqyTn27JRwXxaDEaeMqe2
    ```
2. Verifique se este endereço está na lista de permitidos:

    `doublezero access-pass list | awk 'NR==1 || /MTAwoHgKyTwwDGJo2dye6EWqyTn27JRwXxaDEaeMqe2/'`

    Exemplo de Saída:
    ```
    account                                      | accesspass_type                                                | ip              | user_payer                                   | last_access_epoch | remaining_epoch | connections | status       | owner

    FHyoPs7U23MuSTtepEyXUtSAEffEpFpJGoYvug8X2sWY | prepaid                                                        | 141.14.14.14   | MTAwoHgKyTwwDGJo2dye6EWqyTn27JRwXxaDEaeMqe2 | MAX               | MAX             | 0           | requested    | DZfHh2vjXFqt8zfNbT1afm8PGuCm3BrQKegC5THtKFdn
    ```
     A pubkey de `doublezero address` deve corresponder à pubkey do user_payer e o endereço IP do qual você está tentando se conectar deve corresponder ao IP no Passe de Acesso.
    `doublezero address` é obtido do arquivo id.json em ~/.config/doublezero/ por padrão. Consulte o [passo 6 aqui](https://docs.malbeclabs.com/setup/)

3. Se o acima parece correto e você está recebendo um erro ao conectar ou se o mapeamento acima estiver incorreto, entre em contato com o suporte em [DoubleZero Tech](https://discord.com/channels/1341597747932958802/1344323790464880701)

### Problema: ❌ Error provisioning service: malformed stuff: cannot provision multiple tunnels at the same time
Este erro indica que um dispositivo já está conectado ao DoubleZero.

**Sintomas:**
- O usuário tenta se conectar ao DoubleZero
- `❌ Error provisioning service: malformed stuff: cannot provision multiple tunnels at the same time` é encontrado.

**Soluções:**
1. Verifique
    `doublezero status`

    Saída:
    ```bash
    Tunnel status | Last Session Update     | Tunnel Name | Tunnel src    | Tunnel dst     | Doublezero IP | User Type | Current Device | Lowest Latency Device | Metro     | Network
    up            | 2025-10-20 12:12:55 UTC | doublezero0 | 11.11.11.111 | 12.34.56.789 | 11.11.11.111 | IBRL      | ams-dz001      | ✅ ams-dz001          | Amsterdam | testnet
    ```
2. `up` indica uma conexão saudável.
3. O erro aparece porque um túnel para o DoubleZero com o IP DoubleZero específico já está ativo nesta máquina.

    Este erro é frequentemente encontrado após uma atualização do cliente DoubleZero. As atualizações do DoubleZero reiniciam automaticamente o serviço doublezerod e reconectarão você se você estivesse conectado antes da reinicialização do serviço.


### Problema: Status do DoubleZero está unknown ou down
Este problema está frequentemente relacionado ao túnel GRE sendo ativado com sucesso entre o servidor e o Dispositivo DoubleZero, mas um firewall impedindo o estabelecimento da sessão BGP. Por causa disso, você não está recebendo rotas da rede nem enviando tráfego pelo DoubleZero.

**Sintomas:**
- `doublezero connect ibrl` foi bem-sucedido. No entanto, `doublezero status` retorna `down` ou `unknown`

**Soluções:**
1. Verifique suas regras de firewall!

   O DoubleZero usa o espaço de endereços link local: 169.254.0.0/16 para as interfaces de túnel GRE entre sua máquina e o Dispositivo DoubleZero. 169.254.0.0/16 é tipicamente espaço "não roteável" e, portanto, as boas práticas de segurança recomendam bloquear as comunicações para/deste espaço. Você precisará permitir uma regra em seu firewall que habilite src 169.254.0.0/16 para se comunicar com dst 169.254.0.0/16 na porta tcp 179. Essa regra precisará ser colocada acima de quaisquer regras que Neguem tráfego para 169.254.0.0/16.

    Em um firewall como ufw você pode executar `sudo ufw status` para visualizar as regras do firewall.

    Execute `sudo ufw insert <N> allow proto tcp from 169.254.0.0/16 to 169.254.0.0/16 port 179` para inserir a regra na posição <N>. ou seja, se N = 1, então você inserirá esta regra como a primeira regra.
    `sudo ufw status numbered` mostrará a ordenação numérica das regras.

### Problema: O dispositivo DoubleZero mais próximo mudou

Isso não é um erro, mas pode ser uma otimização. Abaixo está uma prática recomendada que pode ser executada de tempos em tempos, ou automatizada.

**Soluções:**

1. Verifique a latência para o dispositivo mais próximo
    - Execute `doublezero latency`

2. Determine se você já está conectado ao dispositivo alvo
    - Execute `doublezero user list --env testnet | grep 111.11.11.11` substituindo `111.11.11.11` pelo endereço IPv4 público do seu dispositivo conectado ao DoubleZero.

3. Opcional: examine a rede para dispositivos disponíveis
    - Execute `doublezero device list` para uma lista completa de dispositivos.

4. Determine se o dispositivo alvo tem uma conexão disponível
    - Execute `doublezero device list | grep dz-ny7-sw01` substituindo `dz-ny7-sw01` pelo seu dispositivo alvo.

5. Conecte-se ao Dispositivo DoubleZero mais próximo

    Desconecte e reconecte ao DoubleZero:
    - `doublezero disconnect`
    - `doublezero status` (confirme a desconexão)
    - `doublezero connect ibrl`

### Problema: `doublezero status` retorna alguns campos com N/A

Este problema está geralmente relacionado a uma incompatibilidade entre o daemon e cliente atuais versus o daemon e cliente em que o túnel DZ conectado foi estabelecido.

**Sintomas:**
- Ao executar `doublezero status`, o usuário encontra `N/A` em alguns campos

**Soluções:**
1. Execute `doublezero status` e examine a saída.

    Se `Current Device` e `Metro` são `N/A`, mas o status do túnel está `up`, isso indica que seu túnel aberto está em um ambiente diferente do configurado atualmente.

2. Mude seu ambiente para o oposto do ambiente que retorna `N/A`:

    ```bash
    DESIRED_DOUBLEZERO_ENV=testnet \
	    && sudo mkdir -p /etc/systemd/system/doublezerod.service.d \
	    && echo -e "[Service]\nExecStart=\nExecStart=/usr/bin/doublezerod -sock-file /run/doublezerod/doublezerod.sock -env $DESIRED_DOUBLEZERO_ENV" | sudo tee /etc/systemd/system/doublezerod.service.d/override.conf > /dev/null \
	    && sudo systemctl daemon-reload \
	    && sudo systemctl restart doublezerod \
	    && doublezero config set --env $DESIRED_DOUBLEZERO_ENV  > /dev/null \
	    && echo "✅ doublezerod configured for environment $DESIRED_DOUBLEZERO_ENV"
    ```

3. Verifique seu status após mudar os ambientes:

    ```
    doublezero status
    ```

    Com todos os campos preenchidos, você está agora no ambiente correto.
