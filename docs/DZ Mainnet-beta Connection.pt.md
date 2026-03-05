# Conexão do Validador ao Mainnet-Beta no Modo IBRL
!!! warning "Ao conectar ao DoubleZero, concordo com os [Termos de Serviço do DoubleZero](https://doublezero.xyz/terms-protocol)"



###  Conectando ao Mainnet-Beta no Modo IBRL

!!! Note inline end
    O modo IBRL não requer reinicialização dos clientes validadores, pois usa seu endereço IP público existente.

Os Validadores Mainnet da Solana completarão a conexão ao DoubleZero Mainnet-beta, detalhada nesta página.

Cada validador Solana tem seu próprio **keypair de identidade**; dele é extraída a chave pública conhecida como o **node ID**. Esta é a impressão digital única do validador na rede Solana.

Com o DoubleZeroID e o node ID identificados, você provará a propriedade da sua máquina. Isso é feito criando uma mensagem que inclui o DoubleZeroID assinado com a chave de identidade do validador. A assinatura criptográfica resultante serve como prova verificável de que você controla o validador.

Por fim, você enviará uma **solicitação de conexão ao DoubleZero**. Esta solicitação comunica: *"Aqui está minha identidade, aqui está a prova de propriedade e aqui está como pretendo me conectar."* O DoubleZero valida essas informações, aceita a prova e provisiona acesso à rede para o validador no DoubleZero.

Este guia permite que 1 Validador Primário se registre e até 3 máquinas de backup/failover ao mesmo tempo.

## Pré-requisitos

- CLI da Solana instalado e no $PATH
- Para validadores: Permissão para acessar o arquivo keypair de identidade do validador (por exemplo, validator-keypair.json) sob o usuário sol
- Para validadores: Verificar que a chave de identidade do validador Solana conectado tem pelo menos 1 SOL
- As regras de firewall permitem conexões de saída para DoubleZero e Solana RPC conforme necessário, incluindo GRE (ip proto 47) e BGP (169.254.0.0/16 na tcp/179)

!!! info
    O ID do Validador será verificado contra o gossip da Solana para determinar o IP alvo. O IP alvo e o ID DoubleZero serão então usados para abrir um túnel GRE entre sua máquina e o Dispositivo DoubleZero alvo.

    Considere: No caso em que você tem um ID junk e um ID Primário no mesmo IP, apenas o ID Primário será usado no registro da máquina. Isso ocorre porque o ID junk não aparecerá no gossip e, portanto, não pode ser usado para verificar o IP da máquina alvo.

## 1. Configuração do Ambiente

Siga as instruções de [configuração](setup.md) antes de continuar.

O último passo na configuração foi desconectar da rede. Isso é para garantir que apenas um túnel esteja aberto na sua máquina para o DoubleZero, e que esse túnel esteja na rede correta.

<div data-wizard-step="mainnet-env-config" markdown>

Para configurar o CLI do DoubleZero (`doublezero`) e o daemon (`doublezerod`) para se conectar ao **DoubleZero mainnet-beta**:
```bash
DESIRED_DOUBLEZERO_ENV=mainnet-beta \
	&& sudo mkdir -p /etc/systemd/system/doublezerod.service.d \
	&& echo -e "[Service]\nExecStart=\nExecStart=/usr/bin/doublezerod -sock-file /run/doublezerod/doublezerod.sock -env $DESIRED_DOUBLEZERO_ENV" | sudo tee /etc/systemd/system/doublezerod.service.d/override.conf > /dev/null \
	&& sudo systemctl daemon-reload \
	&& sudo systemctl restart doublezerod \
	&& doublezero config set --env $DESIRED_DOUBLEZERO_ENV  > /dev/null \
	&& echo "✅ doublezerod configured for environment $DESIRED_DOUBLEZERO_ENV"
```

Você deve ver a seguinte saída:
`
✅ doublezerod configured for environment mainnet-beta
`

Após aproximadamente 30 segundos, você verá os dispositivos DoubleZero disponíveis:

```bash
doublezero latency
```

</div>

## 2. Abrir a porta 44880

Os usuários precisam abrir a porta 44880 para utilizar alguns [recursos de roteamento](https://github.com/malbeclabs/doublezero/blob/main/rfcs/rfc7-client-route-liveness.md).

Para abrir a porta 44880 você pode atualizar as regras do iptables da seguinte forma:

<div data-wizard-step="firewall-iptables" markdown>

```
sudo iptables -A INPUT -i doublezero0 -p udp --dport 44880 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero0 -p udp --dport 44880 -j ACCEPT
```

</div>

observe os flags `-i doublezero0`, `-o doublezero0` que restringem esta regra apenas à interface DoubleZero

Ou UFW da seguinte forma:

<div data-wizard-step="firewall-ufw" markdown>

```
sudo ufw allow in on doublezero0 to any port 44880 proto udp
sudo ufw allow out on doublezero0 to any port 44880 proto udp
```

</div>

observe os flags `in on doublezero0`, `out on doublezero0` que restringem esta regra apenas à interface DoubleZero

## 3. Atestar a Propriedade do Validador

<div data-wizard-step="mainnet-find-validator" markdown>

Com seu Ambiente DoubleZero configurado, é hora de atestar a Propriedade do seu Validador.

O ID DoubleZero que você criou na [configuração](setup.md) do seu validador primário deve ser usado em todas as máquinas de backup.

O ID na sua máquina primária pode ser encontrado com `doublezero address`. O mesmo ID deve estar em `~/.config/doublezero/id.json` em todas as máquinas do cluster.

Para conseguir isso, você primeiro verificará que a máquina da qual está executando os comandos é seu **Validador Primário** com:

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
    O mesmo fluxo de trabalho é usado para uma ou muitas máquinas.
    Para registrar uma máquina, exclua os argumentos "--backup-validator-ids" ou "backup_ids=" de qualquer comando nesta página.

Agora, em todas as máquinas de backup nas quais você planeja executar seu **Validador Primário**, execute o seguinte:
```
doublezero-solana passport find-validator -u mainnet-beta
```

Esta saída é esperada. O nó de backup não pode estar no cronograma de líderes no momento da criação do passe.

</div>


<div data-wizard-step="mainnet-prepare-access" markdown>

### Preparar a Conexão

Execute o seguinte comando na máquina do **Validador Primário**. Esta é a máquina na qual você tem stake ativo, que está no cronograma de líderes com seu ID de validador primário no gossip da Solana na máquina da qual você está executando o comando:

```
doublezero-solana passport prepare-validator-access -u mainnet-beta \
  --doublezero-address YourDoubleZeroAddress11111111111111111111111111111 \
  --primary-validator-id ValidatorIdentity111111111111111111111111111 \
  --backup-validator-ids ValidatorIdentity222222222222222222222222222,ValidatorIdentity33333333333333333333333333,ValidatorIdentity444444444444444444444444444>
```

Observe a saída no final deste comando. É a estrutura para o próximo passo.

</div>

## 4. Gerar Assinatura

<div data-wizard-step="mainnet-sign-message" markdown>

No final do último passo, recebemos uma saída pré-formatada para `solana sign-offchain-message`.

Da saída anterior executaremos este comando na máquina do **Validador Primário**.

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

Use o comando `request-validator-access` para criar uma conta na Solana para a solicitação de conexão. O agente Sentinel do DoubleZero detecta a nova conta, valida sua identidade e assinatura, e cria o passe de acesso no DoubleZero para que o servidor possa estabelecer uma conexão.

Use o node ID, o DoubleZeroID e a assinatura.

!!! note inline end
      Neste exemplo usamos `-k /home/user/.config/solana/id.json` para encontrar a Identidade do validador. Use o local apropriado para sua implantação local.

```
doublezero-solana passport request-validator-access -k <path to keypair> -u mainnet-beta \
--primary-validator-id ValidatorIdentity111111111111111111111111111 \
--backup-validator-ids ValidatorIdentity222222222222222222222222222,ValidatorIdentity33333333333333333333333333,ValidatorIdentity444444444444444444444444444 \
--signature Signature111111rrNykTByK2DgJET3U6MdjSa7xgFivS9AHyhdSG6AbYTeczUNJSjYPwBGqpmNGkoWk9NvS3W7 --doublezero-address YourDoubleZeroAddress11111111111111111111111111111
```

**Saída:**

Esta saída pode ser usada para ver a transação em um explorador Solana. Certifique-se de mudar o explorador para mainnet. Esta verificação é opcional.

```bash
Request Solana validator access: Transaction22222222VaB8FMqM2wEBXyV5THpKRXWrPtDQxmTjHJHiAWteVYTsc7Gjz4hdXxvYoZXGeHkrEayp
```

Se bem-sucedido, o DoubleZero registrará o primário com seus backups. Agora você pode fazer failover entre os IPs registrados no passe de acesso. O DoubleZero manterá a conectividade automaticamente ao mudar para nós de backup registrados desta forma.

</div>

## 6. Conectar no Modo IBRL

<div data-wizard-step="mainnet-connect-ibrl" markdown>

No servidor, com o usuário que se conectará ao DoubleZero, execute o comando `connect` para estabelecer a conexão com o DoubleZero.

```
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
Aguarde um minuto para o túnel GRE terminar de ser configurado. Até que o túnel GRE esteja configurado, sua saída de status pode retornar "down" ou "Unknown".

Verifique sua conexão:

```bash
doublezero status
```

**Saída:**
!!! note inline end
    Examine esta saída. Observe que `Tunnel src` e `DoubleZero IP` correspondem ao endereço IPv4 público da sua máquina.

```bash
 Tunnel status | Last Session Update     | Tunnel Name | Tunnel src    | Tunnel dst     | Doublezero IP | User Type | Current Device | Lowest Latency Device | Metro     | Network
 up            | 2025-10-20 12:12:55 UTC | doublezero0 | 11.11.11.111 | 12.34.56.789 | 11.11.11.111 | IBRL      | ams-dz001      | ✅ ams-dz001          | Amsterdam | mainnet-beta
```
Um status de `up` significa que você está conectado com sucesso.

Você poderá visualizar as rotas propagadas por outros usuários no DoubleZero executando:

```
ip route
```

</div>

### Próximo Passo: Publicando Shreds via Multicast

Se você completou esta configuração e planeja publicar shreds via multicast, continue para a [próxima página](Validator%20Multicast%20Connection.md).
