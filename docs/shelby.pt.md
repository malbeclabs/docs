---
description: Guia de conexão permissionada para usuários da Shelby Testnet conectando-se ao DoubleZero no modo IBRL.
---

# Shelby
!!! warning "Ao conectar-me ao DoubleZero, concordo com os [Termos de Serviço do DoubleZero](https://doublezero.xyz/terms-protocol)"

### Obtenha seu DoubleZeroID

Você precisará fornecer seu `DoubleZeroID` e o `public ipv4 address` neste [formulário](https://forms.fillout.com/t/s77k7wandMus?id=rec08iF4Z8kVFGm1z)


- Pode haver taxas associadas ao uso de Usuário Permissionado no futuro.
- Após o envio do formulário, monitore seu contato principal no Telegram.
- Neste momento, Shelby só é capaz de se conectar ao DoubleZero Testnet.


### Conectando-se à Testnet no Modo IBRL

Os usuários permissionados do Shelby completarão a conexão ao DoubleZero Testnet, que está detalhada nesta página.

## 1. Configuração do Ambiente

Por favor, siga as instruções de [configuração](setup.md) antes de prosseguir.

O último passo na configuração foi desconectar-se da rede. Isso é para garantir que apenas um túnel esteja aberto na sua máquina para o DoubleZero, e que esse túnel esteja na rede correta.

Para configurar o CLI do DoubleZero Client (`doublezero`) para conectar-se ao tenant Shelby no DoubleZero:
```bash
doublezero config set --tenant shelby
```

Aplique regras adicionais de Firewall específicas para o Shelby:

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

## 2. Contate a Fundação DoubleZero

A fundação DoubleZero. Você precisará fornecer seu `DoubleZeroID` e o `public ipv4 address` a partir do qual você se conectará.


## 3. Conecte-se no Modo IBRL

No servidor, com o usuário que se conectará ao DoubleZero, execute o comando `connect` para estabelecer a conexão com o DoubleZero.

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
Aguarde um minuto para o túnel ser concluído. Até que o túnel seja concluído, a saída do seu status pode retornar "down" ou "Unknown"

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