---
description: Conecte um validador Solana Mainnet-Beta e até três backups ao DoubleZero no modo IBRL, incluindo prova de identidade e a solicitação de conexão.
---

# Conexão de Validador Mainnet-Beta no Modo IBRL
!!! warning "Ao conectar-se ao DoubleZero, eu concordo com os [Termos de Serviço do DoubleZero](https://doublezero.xyz/terms-protocol)"



###  Conectando ao Mainnet-Beta no Modo IBRL

!!! Note inline end
    O modo IBRL não requer reiniciar os clientes do validador, pois utiliza seu endereço IP público existente.

Validadores Solana Mainnet completarão a conexão ao DoubleZero Mainnet-beta, que é detalhada nesta página.

Cada validador Solana possui seu próprio **par de chaves de identidade**; a partir dele, extraia a chave pública conhecida como **node ID**. Esta é a impressão digital única do validador na rede Solana.

Com o DoubleZeroID e o node ID identificados, você provará a propriedade da sua máquina. Isso é feito criando uma mensagem que inclui o DoubleZeroID assinada com a chave de identidade do validador. A assinatura criptográfica resultante serve como prova verificável de que você controla o validador.

Por fim, você enviará uma **solicitação de conexão ao DoubleZero**. Esta solicitação comunica: *"Aqui está minha identidade, aqui está a prova de propriedade, e aqui está como pretendo me conectar."* O DoubleZero valida essas informações, aceita a prova e provisiona o acesso à rede para o validador no DoubleZero.

Este guia permite que 1 Validador Primário se registre e até 3 máquinas de backup/failover ao mesmo tempo.

## Pré-requisitos

- Solana CLI instalado e no $PATH
- Para validadores: Permissão para acessar o arquivo do par de chaves de identidade do validador (ex.: validator-keypair.json) sob o usuário sol
- Para validadores: Verificar se a chave de Identidade do validador Solana sendo conectado possui pelo menos 1 SOL
- Regras de firewall permitem conexões de saída para DoubleZero e Solana RPC conforme necessário, incluindo
 GRE (ip proto 47) e BGP (169.254.0.0/16 em tcp/179)

!!! info
    O ID do Validador será verificado contra o gossip da Solana para determinar o IP de destino. O IP de destino e o DoubleZero ID serão então usados ao abrir um túnel GRE entre sua máquina e o Dispositivo DoubleZero de destino.

    Considere: No caso em que você tem um ID descartável e um ID Primário no mesmo IP, apenas o ID Primário será usado no registro da máquina. Isso ocorre porque o ID descartável não aparecerá no gossip e, portanto, não pode ser usado para verificar o IP da máquina de destino.

## 1. Confirmar a rede do cliente

Por favor, siga as instruções de [configuração](setup.md) antes de prosseguir. Instale os pacotes do **Mainnet-Beta** — Testnet e Mainnet-Beta usam repositórios de pacotes diferentes.

O último passo na configuração foi desconectar da rede. Isso é para garantir que apenas um túnel esteja aberto na sua máquina para o DoubleZero, e que esse túnel esteja na rede correta.

Confirme que o cliente está no mainnet-beta:

```bash
doublezero status
```

A coluna `Network` deve ser `mainnet-beta`. Se for `testnet`, ou se você instalou o pacote errado, use a opção de troca por copiar e colar em [solução de problemas](troubleshooting.md#issue-wrong-doublezero-environment).

Após cerca de 30 segundos você verá os dispositivos DoubleZero disponíveis:

```bash
doublezero latency
```
Exemplo de saída (Mainnet-Beta)
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
A saída do Testnet será idêntica em estrutura, mas com menos dispositivos.

## 2. Abrir a porta 44880

Os usuários precisam abrir a porta 44880 para utilizar alguns [recursos de roteamento](https://github.com/malbeclabs/doublezero/blob/main/rfcs/rfc7-client-route-liveness.md).

Para abrir a porta 44880 você pode atualizar as tabelas IP como:

<div data-wizard-step="firewall-iptables" markdown>

```
sudo iptables -A INPUT -i doublezero0 -p udp --dport 44880 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero0 -p udp --dport 44880 -j ACCEPT
```

</div>

observe as flags `-i doublezero0`, `-o doublezero0` que restringem esta regra apenas à interface DoubleZero

Ou UFW como:

<div data-wizard-step="firewall-ufw" markdown>

```
sudo ufw allow in on doublezero0 to any port 44880 proto udp
sudo ufw allow out on doublezero0 to any port 44880 proto udp
```

</div>

observe as flags `in on doublezero0`, `out on doublezero0` que restringem esta regra apenas à interface DoubleZero

## 3. Atestar Propriedade do Validador

<div data-wizard-step="mainnet-find-validator" markdown>

Com seu Ambiente DoubleZero configurado, agora é hora de atestar a Propriedade do seu Validador.

O DoubleZero ID que você criou na [configuração](setup.md) do seu validador primário deve ser usado em todas as máquinas de backup.

O ID na sua máquina primária pode ser encontrado com `doublezero address`. O mesmo ID deve estar em `~/.config/doublezero/id.json` em todas as máquinas do cluster.

Para realizar isso, você primeiro verificará se a máquina na qual está executando os comandos é seu **Validador Primário** com:

```
doublezero-solana passport find-validator -u mainnet-beta
```

Isso verifica que o validador está registrado no gossip e aparece no cronograma de líderes.

Saída esperada:

```
Connected to Solana: mainnet

DoubleZero ID: YourDoubleZeroAddress11111111111111111111111111111
Detected public IP: 11.11.11.111
Validator ID: ValidatorIdentity111111111111111111111111111
Gossip IP: 11.11.11.111
In Leader scheduler
✅ This validator can connect as a primary in DoubleZero 🖥️  💎. It is a leader scheduled validator.
```

!!! info
    O mesmo fluxo de trabalho é usado para uma ou várias máquinas.
    Para registrar uma máquina, exclua os argumentos "--backup-validator-ids" ou "backup_ids=" de quaisquer comandos nesta página.

Agora, em todas as máquinas de backup nas quais você pretende executar seu **Validador Primário**, execute o seguinte:
```
doublezero-solana passport find-validator -u mainnet-beta
```

Saída esperada:

```
Connected to Solana: mainnet

DoubleZero ID: YourDoubleZeroAddress11111111111111111111111111111
Detected public IP: 22.22.22.222
Validator ID: ValidatorIdentity222222222222222222222222222
Gossip IP: 22.22.22.222
In Not in Leader scheduler
 ✅ This validator can only connect as a backup in DoubleZero 🖥️  🛟. It is not leader scheduled and cannot act as a primary validator.
```
Esta saída é esperada. O nó de backup não pode estar no cronograma de líderes no momento da criação do passe.

Agora você executará este comando em **todas as máquinas de backup** nas quais planeja usar a conta de voto e a identidade do seu **Validador Primário**.

</div>


<div data-wizard-step="mainnet-prepare-access" markdown>

### Preparar a Conexão

Execute o seguinte comando na máquina do **Validador Primário**. Esta é a máquina na qual você tem stake ativo, que está no cronograma de líderes com o ID do seu validador primário no solana gossip na máquina da qual você está executando o comando:

```
doublezero-solana passport prepare-validator-access -u mainnet-beta \
  --doublezero-address YourDoubleZeroAddress11111111111111111111111111111 \
  --primary-validator-id ValidatorIdentity111111111111111111111111111 \
  --backup-validator-ids ValidatorIdentity222222222222222222222222222,ValidatorIdentity33333333333333333333333333,ValidatorIdentity444444444444444444444444444>
```


Exemplo de saída:

```
DoubleZero Passport - Prepare Validator Access Request
Connected to Solana: mainnet-beta

Primary validator 🖥️  💎:
  ID: ValidatorIdentity111111111111111111111111111
  Gossip: ✅ OK 11.11.11.111)
  Leader scheduler: ✅ OK (Stake: 1,050,000.00 SOL)

Backup validator 🖥️ 🛡️:
  ID: ValidatorIdentity222222222222222222222222222
  Gossip: ✅ OK (22.22.22.222)
  Leader scheduler:  ✅ OK (not a leader scheduled validator)


Backup validator 🖥️ 🛡️:
  ID: ValidatorIdentity333333333333333333333333333
  Gossip: ✅ OK (33.33.33.333)
  Leader scheduler:  ✅ OK (not a leader scheduled validator)


  Backup validator 🖥️ 🛡️:
  ID: ValidatorIdentity444444444444444444444444444
  Gossip: ✅ OK (33.33.33.333)
  Leader scheduler:  ✅ OK (not a leader scheduled validator)

  To request access, sign the following message with your validator's identity key:

  solana sign-offchain-message \
     service_key=YourDoubleZeroAddress11111111111111111111111111111,backup_ids=ValidatorIdentity222222222222222222222222222,ValidatorIdentity33333333333333333333333333,ValidatorIdentity444444444444444444444444444 \
     -k <identity-keypair-file.json>

```
Observe a saída no final deste comando. É a estrutura para o próximo passo.

</div>

## 4. Gerar Assinatura

<div data-wizard-step="mainnet-sign-message" markdown>

No final do último passo, recebemos uma saída pré-formatada para `solana sign-offchain-message`

A partir da saída acima, executaremos este comando na máquina do **Validador Primário**.

```
  solana sign-offchain-message \
     service_key=YourDoubleZeroAddress11111111111111111111111111111,backup_ids=ValidatorIdentity222222222222222222222222222,ValidatorIdentity33333333333333333333333333,ValidatorIdentity444444444444444444444444444 \
     -k <identity-keypair-file.json>
```

**Saída:**

```
  Signature111111rrNykTByK2DgJET3U6MdjSa7xgFivS9AHyhdSG6AbYTeczUNJSjYPwBGqpmNGkoWk9NvS3W7
```

</div>

## 5. Iniciar uma Solicitação de Conexão no DoubleZero

<div data-wizard-step="mainnet-request-access" markdown>

Use o comando `request-validator-access` para criar uma conta na Solana para a solicitação de conexão. O agente DoubleZero Sentinel detecta a nova conta, valida sua identidade e assinatura, e cria o passe de acesso no DoubleZero para que o servidor possa estabelecer uma conexão.


Use o node ID, DoubleZeroID e a assinatura.

!!! note inline end
      Neste exemplo usamos `-k /home/user/.config/solana/id.json` para encontrar a Identidade do validador. Use o local apropriado para sua implantação local.

```
doublezero-solana passport request-validator-access -k <path to keypair> -u mainnet-beta \
--primary-validator-id ValidatorIdentity111111111111111111111111111 \
--backup-validator-ids ValidatorIdentity222222222222222222222222222,ValidatorIdentity33333333333333333333333333,ValidatorIdentity444444444444444444444444444 \
--signature Signature111111rrNykTByK2DgJET3U6MdjSa7xgFivS9AHyhdSG6AbYTeczUNJSjYPwBGqpmNGkoWk9NvS3W7 --doublezero-address YourDoubleZeroAddress11111111111111111111111111111
```

**Saída:**

Esta saída pode ser usada para ver a transação em um explorador Solana. Certifique-se de alterar o explorador para mainnet. Esta verificação é opcional.

```bash
Request Solana validator access: Transaction22222222VaB8FMqM2wEBXyV5THpKRXWrPtDQxmTjHJHiAWteVYTsc7Gjz4hdXxvYoZXGeHkrEayp
```

Se bem-sucedido, o DoubleZero registrará o primário com seus backups. Agora você pode fazer failover entre os IPs registrados no passe de acesso. O DoubleZero manterá a conectividade automaticamente ao alternar para nós de backup registrados desta forma.

</div>

## 6. Conectar no Modo IBRL

<div data-wizard-step="mainnet-connect-ibrl" markdown>

No servidor, com o usuário que se conectará ao DoubleZero, execute o comando `connect` para estabelecer a conexão com o DoubleZero.

```
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
Aguarde um minuto para o túnel GRE terminar a configuração. Até que o túnel GRE termine a configuração, sua saída de status pode retornar "down" ou "Unknown"

Verifique sua conexão:

```bash
doublezero status
```

**Saída:**
!!! note inline end
    Examine esta saída. Observe que o `Tunnel src` e o `DoubleZero IP` correspondem ao endereço IPv4 público na sua máquina.
    <!--`Tunnel dst` é o endereço do dispositivo DZ ao qual você está conectado.-->

```bash
 Tunnel status | Last Session Update     | Tunnel Name | Tunnel src    | Tunnel dst     | Doublezero IP | User Type | Current Device | Lowest Latency Device | Metro     | Network
 up            | 2025-10-20 12:12:55 UTC | doublezero0 | 11.11.11.111 | 12.34.56.789 | 11.11.11.111 | IBRL      | ams-dz001      | ✅ ams-dz001          | Amsterdam | mainnet-beta
```
Um status de `up` significa que você está conectado com sucesso.

Você poderá visualizar as rotas propagadas por outros usuários no DoubleZero executando:

```
ip route
```


```
default via 149.28.38.1 dev enp1s0 proto dhcp src 149.28.38.64 metric 100
5.39.216.186 via 169.254.0.68 dev doublezero0 proto bgp src 149.28.38.64
5.39.251.201 via 169.254.0.68 dev doublezero0 proto bgp src 149.28.38.64
5.39.251.202 via 169.254.0.68 dev doublezero0 proto bgp src 149.28.38.64
...
```

</div>

### Próximo Passo: Publicando Shreds via Multicast

Se você completou esta configuração e planeja publicar shreds via multicast, prossiga para a [próxima página](Validator%20Multicast%20Connection.md).