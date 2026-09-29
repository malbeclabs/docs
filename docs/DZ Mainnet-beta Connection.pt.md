---
description: Conecte um validador Solana (mainnet-beta ou testnet) e até três backups ao DoubleZero no modo IBRL, incluindo prova de identidade e a solicitação de conexão.
---

# Conexão de Validador no Modo IBRL

!!! warning "Ao conectar-me ao DoubleZero, concordo com os [Termos de Serviço do DoubleZero](https://doublezero.xyz/terms-protocol)"

??? warning "Ao conectar-me ao testnet do DoubleZero, concordo com os termos do Acordo de Avaliação estabelecidos aqui (clique para expandir)"
    <span style="font-size:14px;">DoubleZero Testnet</span>
    Acordo de Avaliação

    Ao acessar ou utilizar a Solução (definida abaixo), você concorda, a partir da
    primeira data de tal acesso (a "**Data de Vigência**"), que este
    Acordo de Avaliação (o "**Acordo**") estabelece os termos e
    condições sob os quais a DoubleZero Foundation ("**DZF**") fornecerá
    a você ("**Usuário**" ou "**você**") acesso à Solução em caráter de
    avaliação. Em consideração às promessas mútuas aqui contidas, você concorda com o
    seguinte:

    <span style="font-size:14px;">1. DEFINIÇÕES.</span>

    <span style="font-size:14px;">1.1 "**Informações Confidenciais**"</span> significa toda e qualquer informação divulgada por qualquer uma das partes à outra que seja designada como confidencial, ou que de outra forma deva ser entendida como confidencial, incluindo, mas não se limitando a, a Solução, planos de produto, planos de negócios, segredos comerciais, tecnologia ou qualquer outra informação proprietária.

    <span style="font-size:14px;">1.2 "**Solução**" </span> significa a versão testnet da infraestrutura de rede de alto desempenho DoubleZero para projetos web3 ("**Testnet**") e o serviço de filtragem de borda relacionado com largura de banda integrada ("**Serviço de Informação**"), o Software DZ (definido abaixo), quaisquer e todos os materiais fornecidos pela DZF relacionados ao Software DZ ("**Documentação**"), e outros materiais que a DZF forneça ao Usuário nos termos deste instrumento.

    <span style="font-size:14px;">2. ACESSO. </span>

    <span style="font-size:14px;">2.1 ^^Acesso à Solução^^.</span> Sujeito aos termos e condições deste Acordo, a DZF fornecerá ao Usuário acesso à Solução através da Internet. O acesso do Usuário é uma utilização não exclusiva, intransferível e limitada da Solução para permitir que o Usuário avalie apenas o Serviço de Informação. Com relação a qualquer software que compõe a Solução ("**Software DZ**"), a DZF concede ao Usuário uma licença limitada e revogável, durante o Período de Avaliação, para copiar, baixar, fazer um número razoável de cópias, executar e implantar (conforme aplicável) tal Software DZ exclusivamente conforme contemplado pela Documentação.

    <span style="font-size:14px;">2.2 ^^Restrições^^. </span>O Usuário pode usar a Solução de acordo com este Acordo a partir da Data de Vigência até ser encerrado pela DZF (o "**Período de Avaliação**"). O Usuário entende que quaisquer direitos de uso da Solução além do Período de Avaliação estarão sujeitos a um acordo comercial separado entre as partes a esse respeito, incluindo o pagamento de taxas. O Usuário não deverá, e não permitirá que terceiros: (i) modifiquem ou criem quaisquer obras derivadas com base na Solução ou qualquer parte dela; (ii) reproduzam a Solução exceto conforme expressamente permitido por este Acordo; (iii) sublicenciem, distribuam, vendam, emprestem, aluguem, arrendem, transfiram ou concedam quaisquer direitos sobre a totalidade ou qualquer parte da Solução ou forneçam acesso à Solução a terceiros, em regime de bureau de serviços ou de outra forma, exceto como oferta dos Serviços de Informação através de ou em conexão com a plataforma ou produto do Usuário e não de forma autônoma; ou (iv) usem a Solução de forma diferente da prevista neste instrumento.

    <span style="font-size:14px;">2.3 ^^Propriedade^^.</span> A DZF retém todos os direitos, títulos e interesses, incluindo direitos de propriedade intelectual, sobre a Solução.

    <span style="font-size:14px;">3 FEEDBACK.</span>
    A DZF pode periodicamente solicitar que o Usuário forneça, e o Usuário concorda em fornecer à DZF, feedback sobre o uso, operação e funcionalidade da Solução ("Feedback"). O Usuário concede à DZF um direito e licença não exclusivos, mundiais, perpétuos, irrevogáveis, livres de royalties, totalmente pagos, totalmente sublicenciáveis e transferíveis para usar e incorporar o Feedback em quaisquer produtos e serviços, para fabricar, usar, vender, oferecer para venda, importar e de outra forma explorar tais produtos e serviços, e para de outra forma usar, copiar, distribuir e explorar o Feedback sem restrições.

    <span style="font-size:14px;">4. VIGÊNCIA E RESCISÃO.</span>

    <span style="font-size:14px;">4.1 ^^Vigência^^.</span> Este Acordo entrará em vigor a partir da Data de Vigência e permanecerá em pleno vigor e efeito durante o Período de Avaliação. Qualquer uma das partes pode rescindir este Acordo imediatamente por conveniência, por qualquer motivo ou sem motivo, mediante notificação por escrito à outra parte (e-mail é suficiente).

    <span style="font-size:14px;">4.1 ^^Efeitos da Rescisão^^.</span> Após a rescisão deste Acordo por qualquer motivo: (i) os direitos concedidos ao Usuário nos termos deste instrumento serão imediatamente encerrados; (ii) o Usuário deverá descontinuar imediatamente qualquer uso da Solução e deverá devolver ou destruir toda a Documentação e qualquer Software DZ sob seu controle; (iii) cada parte deverá prontamente devolver ou destruir todas as Informações Confidenciais e propriedade da outra parte; e (iv) as Seções 2.2, 2.3, 3, 4.2 e 5 a 8 sobreviverão.

    <span style="font-size:14px;">5. CONFIDENCIALIDADE.</span>
    Cada parte concorda que usará as Informações Confidenciais da outra parte exclusivamente para cumprir suas obrigações e exercer seus direitos nos termos deste Acordo e não divulgará, nem permitirá que sejam divulgadas, as mesmas, exceto conforme de outra forma permitido neste instrumento. No entanto, qualquer uma das partes pode divulgar Informações Confidenciais a seu pessoal, advogados e outros representantes que tenham necessidade de conhecê-las e estejam vinculados por obrigações de confidencialidade não menos protetivas do que as estabelecidas neste Acordo; e conforme exigido por lei (caso em que a parte receptora fornecerá à parte divulgadora notificação prévia e oportunidade de contestar tal divulgação, e minimizará tal divulgação na medida permitida pela lei aplicável). As obrigações de confidencialidade nesta Seção 5 não se aplicarão a informações que: (a) sejam ou se tornem geralmente conhecidas ou publicamente disponíveis sem culpa da parte receptora; (b) eram devidamente conhecidas pela parte receptora, sem restrição, antes da divulgação pela parte divulgadora; (c) foram devidamente divulgadas à parte receptora, sem restrição, por outra pessoa com autoridade legal para fazê-lo; ou (d) são desenvolvidas independentemente pela parte receptora sem uso ou referência às Informações Confidenciais da parte divulgadora. Cada parte concorda em exercer a devida diligência na proteção das Informações Confidenciais da outra parte contra uso e divulgação não autorizados. Em caso de violação real ou ameaçada das disposições desta Seção ou das licenças aqui contidas, a parte não violadora terá direito a buscar medida cautelar imediata e outras medidas equitativas, sem renunciar a quaisquer outros direitos ou recursos disponíveis. O Usuário é responsável por manter a Solução e o sigilo de quaisquer senhas, frases-semente ou códigos que forneçam acesso à Solução como Informações Confidenciais da DZF. Nada neste instrumento limita ou restringe o direito ou a capacidade da DZF de usar dados sobre o desempenho, disponibilidade, uso, integridade e segurança da Solução. Se qualquer uma das partes violar ou ameaçar violar as disposições desta Seção 5, cada parte concorda que a parte não violadora não terá recurso adequado na lei e, portanto, terá direito a medida cautelar imediata e outras medidas equitativas, sem caução e sem a necessidade de demonstrar danos monetários reais.

    <span style="font-size:14px;">6. ISENÇÃO DE GARANTIA; LIMITAÇÃO DE RESPONSABILIDADE.</span>

    <span style="font-size:14px;">6.1 ^^ISENÇÃO DE GARANTIA^^.</span> A SOLUÇÃO É FORNECIDA "NO ESTADO EM QUE SE ENCONTRA" SEM GARANTIA DE QUALQUER TIPO. A DZF NÃO OFERECE GARANTIAS, SEJAM EXPRESSAS, IMPLÍCITAS, LEGAIS OU DE OUTRA FORMA, COM RELAÇÃO À SOLUÇÃO E À DOCUMENTAÇÃO, INCLUINDO SUA CONDIÇÃO, CONFORMIDADE COM QUALQUER REPRESENTAÇÃO OU DESCRIÇÃO, E A DZF ESPECIFICAMENTE RENUNCIA A TODAS AS GARANTIAS IMPLÍCITAS DE COMERCIALIZAÇÃO, ADEQUAÇÃO A UM PROPÓSITO ESPECÍFICO, TÍTULO E NÃO VIOLAÇÃO.

    <span style="font-size:14px;">6.2 ^^LIMITAÇÃO DE RESPONSABILIDADE^^.</span>
    EXCETO POR VIOLAÇÃO DAS SEÇÕES 2.1, 2.2 E 5, EM NENHUM CASO QUALQUER DAS PARTES SERÁ RESPONSÁVEL PERANTE A OUTRA POR DANOS INDIRETOS, INCIDENTAIS, ESPECIAIS OU OUTROS DANOS CONSEQUENCIAIS, INCLUINDO, SEM LIMITAÇÃO, DANOS POR PERDA DE LUCROS OU USO OU PERDA DE DADOS, INCORRIDOS POR VOCÊ OU QUALQUER TERCEIRO, DECORRENTES OU RELACIONADOS A ESTE ACORDO, SEJA EM AÇÃO CONTRATUAL, EXTRACONTRATUAL OU OUTRA, MESMO QUE A OUTRA PARTE TENHA SIDO AVISADA DA POSSIBILIDADE DE TAIS DANOS. EM NENHUM CASO A RESPONSABILIDADE AGREGADA DA DZF DECORRENTE OU RELACIONADA A ESTE ACORDO EXCEDERÁ CEM DÓLARES (\$100), SEJA EM AÇÃO CONTRATUAL, EXTRACONTRATUAL OU OUTRA. **AS LIMITAÇÕES ANTERIORES SE APLICARÃO NÃO OBSTANTE A FALHA DO PROPÓSITO ESSENCIAL DE QUALQUER RECURSO LIMITADO NESTE INSTRUMENTO.** AS PARTES CONCORDAM QUE AS LIMITAÇÕES ANTERIORES REPRESENTAM UMA ALOCAÇÃO RAZOÁVEL DE RISCO NOS TERMOS DESTE ACORDO.

    <span style="font-size:14px;">7. LEI APLICÁVEL.</span>
    Este Acordo e todas as questões decorrentes ou relacionadas a este Acordo serão regidos, interpretados e construídos de acordo com as leis das Ilhas Cayman. Caso surja uma controvérsia, disputa ou reclamação decorrente ou em relação a este Acordo ("Disputa"), a parte relevante, conforme apropriado, deve notificar a outra parte sobre tal Disputa com 30 dias de antecedência (a "Notificação de Disputa"). Caso a Disputa não seja resolvida ao término de 30 dias após a notificação da Notificação de Disputa, a parte relevante pode iniciar procedimentos de arbitragem conforme previsto neste instrumento. Caso a Disputa persista ao término de 30 dias após a notificação da Notificação de Disputa, a Disputa será resolvida por arbitragem administrada pelo Cayman International Mediation & Arbitration Centre (CI-MAC) de acordo com as Regras de Arbitragem do CI-MAC (as "Regras de Arbitragem") em vigor na data deste Acordo, cujas Regras de Arbitragem são consideradas incorporadas por referência a esta cláusula, e regidas pela Lei de Arbitragem (conforme alterada). A arbitragem terá sede em George Town, Grand Cayman, Ilhas Cayman e será regida pela lei das Ilhas Cayman. O idioma da arbitragem será o inglês. A arbitragem será determinada por um único árbitro a ser nomeado de acordo com as Regras de Arbitragem. Qualquer decisão ou sentença proferida pelo árbitro será por escrito e será final e vinculante para as partes sem qualquer direito de recurso, e o julgamento sobre qualquer sentença assim obtida poderá ser registrado ou executado por qualquer tribunal com jurisdição para tal. Nenhuma ação judicial ou em equidade baseada em qualquer reclamação decorrente ou relacionada a este Acordo será instaurada em qualquer tribunal de qualquer jurisdição. Se qualquer litígio ou arbitragem for necessário para fazer cumprir os termos deste Acordo, a parte vencedora terá direito a ter seus honorários advocatícios pagos pela outra parte. Cada parte renuncia a qualquer direito que possa ter de invocar a doutrina de forum non conveniens, de alegar que não está sujeita à jurisdição de tal arbitragem ou tribunais ou de se opor ao foro na medida em que qualquer procedimento seja iniciado em conformidade com este instrumento. </span>

    <span style="font-size:14px;">8. DISPOSIÇÕES GERAIS.</span>
    Este Acordo não pode ser transferido ou cedido pelo Usuário sem o consentimento prévio por escrito da DZF. A DZF pode ceder livremente este Acordo. Todas as notificações que devam ser enviadas nos termos deste instrumento serão enviadas por e-mail (para a DZF: legal@doublezero.xyz) e consideradas recebidas no dia seguinte ao envio (com confirmação de transmissão). Se qualquer disposição deste Acordo for considerada inválida ou inexequível, as demais disposições deste Acordo permanecerão em pleno vigor e efeito. A renúncia por qualquer uma das partes de qualquer inadimplência ou violação deste Acordo não constituirá renúncia a qualquer outra ou subsequente inadimplência ou violação. Nenhuma das partes será responsável por qualquer atraso ou falha no desempenho devido a atos de Deus, terremotos, escassez de suprimentos, dificuldades de transporte, disputas trabalhistas, tumultos, guerra, incêndio, epidemias e ocorrências similares além de seu controle, sejam ou não previsíveis. Este Acordo, juntamente com quaisquer anexos, constitui o acordo completo entre as partes e substitui todos os acordos ou representações anteriores ou contemporâneos, escritos ou orais, relativos ao assunto aqui tratado. Este Acordo não pode ser modificado ou alterado exceto por escrito assinado por um representante devidamente autorizado de cada parte.

Escolha a rede DoubleZero que corresponde ao seu cluster Solana: `mainnet-beta` ou `testnet`. Instale os pacotes correspondentes em [configuração](setup.md), e use a mesma rede para todos os comandos abaixo.

!!! Note inline end
    O modo IBRL não requer reiniciar os clientes validadores, porque utiliza o seu endereço IP público existente.

Validadores Solana conectam-se ao DoubleZero no modo IBRL usando os passos desta página.

Cada validador Solana possui seu próprio **par de chaves de identidade**; a partir dele, extraia a chave pública conhecida como **ID do nó**. Esta é a impressão digital única do validador na rede Solana.

Com o DoubleZeroID e o ID do nó identificados, você comprovará a propriedade da sua máquina. Isso é feito criando uma mensagem que inclui o DoubleZeroID assinada com a chave de identidade do validador. A assinatura criptográfica resultante serve como prova verificável de que você controla o validador.

Por fim, você enviará uma **solicitação de conexão ao DoubleZero**. Esta solicitação comunica: *"Aqui está minha identidade, aqui está a prova de propriedade e aqui está como pretendo me conectar."* O DoubleZero valida essas informações, aceita a prova e provisiona o acesso à rede para o validador no DoubleZero.

Este guia permite que 1 Validador Primário se registre e até 3 máquinas de backup/failover ao mesmo tempo.

## Pré-requisitos

- Solana CLI instalado e no $PATH
- Para validadores: Permissão para acessar o arquivo de par de chaves de identidade do validador (ex.: validator-keypair.json) sob o usuário sol
- Para validadores: Verificar que a chave de identidade do validador Solana sendo conectado possui pelo menos 1 SOL
- Regras de firewall permitem conexões de saída para DoubleZero e Solana RPC conforme necessário, incluindo
 GRE (ip proto 47) e BGP (169.254.0.0/16 em tcp/179)

!!! info
    O ID do Validador será verificado contra o gossip do Solana para determinar o IP de destino. O IP de destino e o DoubleZero ID serão então usados ao abrir um túnel GRE entre sua máquina e o dispositivo DoubleZero de destino.

    Considere: No caso em que você tem um ID temporário e um ID Primário no mesmo IP, apenas o ID Primário será usado no registro da máquina. Isso porque o ID temporário não aparecerá no gossip e, portanto, não pode ser usado para verificar o IP da máquina de destino.

## 1. Confirmar a rede do cliente

Por favor, siga as instruções de [configuração](setup.md) antes de prosseguir. Instale os pacotes para **mainnet-beta** ou **testnet**. Eles usam repositórios de pacotes diferentes.

O último passo na configuração foi desconectar-se da rede. Isso é para garantir que apenas um túnel esteja aberto na sua máquina para o DoubleZero, e que esse túnel esteja na rede correta.

Confirme que o cliente está na rede que você escolheu:

```bash
doublezero status
```

A coluna `Network` deve ser `mainnet-beta` ou `testnet`, correspondendo ao seu cluster Solana. Se estiver errada, ou se você instalou o pacote errado, use a opção de troca por copiar-colar em [solução de problemas](troubleshooting.md#issue-wrong-doublezero-environment).

Após cerca de 30 segundos você verá os dispositivos DoubleZero disponíveis:

```bash
doublezero latency
```

Exemplo de saída (mainnet-beta; testnet é semelhante, mas com menos dispositivos):

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

## 2. Abrir a porta 44880

Os usuários precisam abrir a porta 44880 para utilizar alguns [recursos de roteamento](https://github.com/malbeclabs/doublezero/blob/main/rfcs/rfc7-client-route-liveness.md).

Para abrir a porta 44880 você pode atualizar as tabelas IP, como por exemplo:

```
sudo iptables -A INPUT -i doublezero0 -p udp --dport 44880 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero0 -p udp --dport 44880 -j ACCEPT
```


note as flags `-i doublezero0`, `-o doublezero0` que restringem esta regra apenas à interface DoubleZero

Ou UFW, como por exemplo:

```
sudo ufw allow in on doublezero0 to any port 44880 proto udp
sudo ufw allow out on doublezero0 to any port 44880 proto udp
```


note as flags `in on doublezero0`, `out on doublezero0` que restringem esta regra apenas à interface DoubleZero

## 3. Atestar Propriedade do Validador

!!! note "Flag de rede"
    Os comandos de passport abaixo usam `-u mainnet-beta`. No testnet, use `-u testnet` (ou `-ut`) em vez disso.

Com seu Ambiente DoubleZero configurado, agora é hora de atestar a Propriedade do seu Validador.

O DoubleZero ID que você criou na [configuração](setup.md) do seu validador primário deve ser usado em todas as máquinas de backup.

O ID na sua máquina primária pode ser encontrado com `doublezero address`. O mesmo ID deve estar em `~/.config/doublezero/id.json` em todas as máquinas do cluster.

Para conseguir isso, você primeiro verificará que a máquina de onde está executando os comandos é o seu **Validador Primário** com:

```
doublezero-solana passport find-validator -u mainnet-beta
```

Isso verifica que o validador está registrado no gossip e aparece no agendamento de líderes.

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

Agora, em todas as máquinas de backup onde você pretende executar o seu **Validador Primário**, execute o seguinte:
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
Esta saída é esperada. O nó de backup não pode estar no agendamento de líderes no momento da criação do passe.

Agora você executará este comando em **todas as máquinas de backup** onde planeja usar a conta de voto e a identidade do seu **Validador Primário**.


### Preparar a Conexão

Execute o seguinte comando na máquina do **Validador Primário**. Esta é a máquina onde você tem stake ativo, que está no agendamento de líderes com o ID do seu validador primário no solana gossip na máquina de onde está executando o comando:

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


## 4. Gerar Assinatura

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


## 5. Iniciar uma Solicitação de Conexão no DoubleZero

Use o comando `request-validator-access` para criar uma conta no Solana para a solicitação de conexão. O agente DoubleZero Sentinel detecta a nova conta, valida sua identidade e assinatura, e cria o passe de acesso no DoubleZero para que o servidor possa estabelecer uma conexão.


Use o ID do nó, o DoubleZeroID e a assinatura.

!!! note inline end
      Neste exemplo usamos `-k /home/user/.config/solana/id.json` para encontrar a identidade do validador. Use o local apropriado para sua implantação local.

```
doublezero-solana passport request-validator-access -k <path to keypair> -u mainnet-beta \
--primary-validator-id ValidatorIdentity111111111111111111111111111 \
--backup-validator-ids ValidatorIdentity222222222222222222222222222,ValidatorIdentity33333333333333333333333333,ValidatorIdentity444444444444444444444444444 \
--signature Signature111111rrNykTByK2DgJET3U6MdjSa7xgFivS9AHyhdSG6AbYTeczUNJSjYPwBGqpmNGkoWk9NvS3W7 --doublezero-address YourDoubleZeroAddress11111111111111111111111111111
```

**Saída:**

Esta saída pode ser usada para ver a transação em um explorador Solana. Certifique-se de configurar o explorador para mainnet-beta ou testnet para corresponder ao seu cluster. Esta verificação é opcional.

```bash
Request Solana validator access: Transaction22222222VaB8FMqM2wEBXyV5THpKRXWrPtDQxmTjHJHiAWteVYTsc7Gjz4hdXxvYoZXGeHkrEayp
```

Se bem-sucedido, o DoubleZero registrará o primário com seus backups. Agora você pode fazer failover entre os IPs registrados no passe de acesso. O DoubleZero manterá a conectividade automaticamente ao alternar para nós de backup registrados desta forma.


## 6. Conectar no Modo IBRL

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
Aguarde um minuto para que o túnel GRE termine a configuração. Até que o túnel GRE esteja completamente configurado, sua saída de status pode retornar "down" ou "Unknown".

Verifique sua conexão:

```bash
doublezero status
```

**Saída:**
!!! note inline end
    Examine esta saída. Observe que o `Tunnel src` e o `DoubleZero IP` correspondem ao endereço IPv4 público da sua máquina.
    <!--`Tunnel dst` é o endereço do dispositivo DZ ao qual você está conectado.-->

```bash
 Tunnel status | Last Session Update     | Tunnel Name | Tunnel src    | Tunnel dst     | Doublezero IP | User Type | Current Device | Lowest Latency Device | Metro     | Network
 up            | 2025-10-20 12:12:55 UTC | doublezero0 | 11.11.11.111 | 12.34.56.789 | 11.11.11.111 | IBRL      | ams-dz001      | ✅ ams-dz001          | Amsterdam | mainnet-beta
```

(`Network` mostra `testnet` quando você se conectou no testnet.)

Um status `up` significa que você está conectado com sucesso.

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


### Próximo Passo: Publicação de Shreds via Multicast

Se você completou esta configuração e planeja publicar shreds via multicast, prossiga para a [próxima página](Validator%20Multicast%20Connection.md).