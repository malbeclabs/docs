# Conexão ao DoubleZero no Modo IBRL para Usuários do Shelby Testnet
!!! warning "This translation was generated using artificial intelligence and has not been reviewed by a human translator. It may contain inaccuracies or errors and should not be relied upon."

!!! warning "Ao conectar ao DoubleZero, concordo com os [Termos de Serviço do DoubleZero](https://doublezero.xyz/terms-protocol)"

<div data-wizard-step="rpc-onboarding" markdown>

### Obtenha seu DoubleZeroID

Você precisará fornecer seu `DoubleZeroID` e o `endereço IPv4 público` neste [formulário](https://forms.fillout.com/t/s77k7wandMus?id=rec08iF4Z8kVFGm1z)


- Pode haver taxas associadas ao uso de Usuários com Permissão no futuro.
- Após o envio do formulário, monitore seu contato principal no Telegram.
- No momento, o Shelby só pode se conectar ao DoubleZero Testnet.

</div>

###  Conectando ao Testnet no Modo IBRL

Os usuários com permissão do Shelby completarão a conexão ao DoubleZero Testnet, detalhada nesta página.

## 1. Configuração do Ambiente

Siga as instruções de [configuração](setup.md) antes de continuar.

O último passo na configuração foi desconectar da rede. Isso é para garantir que apenas um túnel esteja aberto na sua máquina para o DoubleZero, e que esse túnel esteja na rede correta.

Para configurar o CLI do DoubleZero (`doublezero`) para se conectar ao tenant Shelby no DoubleZero:
```bash
doublezero config set --tenant shelby
```

Aplique regras de Firewall adicionais específicas para o Shelby:

iptables:
```
sudo iptables -A INPUT -i doublezero0 -p tcp --dport 39431 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 39431 -j DROP
```

UFW:
```
sudo ufw allow in on doublezero0 to any port 39431 proto tcp
sudo ufw deny in to any port 39431 proto tcp
```

## 2. Contatar a Fundação DoubleZero

A Fundação DoubleZero. Você precisará fornecer seu `DoubleZeroID` e o `endereço IPv4 público` a partir do qual você se conectará.


<div data-wizard-step="rpc-connect-ibrl" markdown>

## 3. Conectar no Modo IBRL

No servidor, com o usuário que se conectará ao DoubleZero, execute o comando `connect` para estabelecer a conexão com o DoubleZero.

```bash
doublezero connect ibrl
```

Você deve ver uma saída indicando o provisionamento, como:

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
Aguarde um minuto para o túnel ser concluído. Até que o túnel seja concluído, sua saída de status pode retornar "down" ou "Unknown".

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
