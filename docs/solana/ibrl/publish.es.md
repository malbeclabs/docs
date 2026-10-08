---
description: Conecta un validador de Solana (mainnet-beta o testnet) y hasta tres respaldos a DoubleZero en modo IBRL, incluyendo la prueba de identidad y la solicitud de conexión.
---

# Conexión de Validador en Modo IBRL

!!! warning "Al conectarme a DoubleZero acepto los [Términos de Servicio de DoubleZero](https://doublezero.xyz/terms-protocol)"

??? warning "Al conectarme al testnet de DoubleZero acepto los términos del Acuerdo de Evaluación establecidos aquí (haz clic para expandir)"
    <span style="font-size:14px;">DoubleZero Testnet</span>
    Evaluation Agreement

    By accessing or using the Solution (defined below), you agree as of the
    first date of such access (the "**Effective Date**") that this
    Evaluation Agreement (the "**Agreement**") sets forth the terms and
    conditions under which DoubleZero Foundation ("**DZF**") will provide
    you ("**User**" or "**you**") access to the Solution on an evaluation
    basis. In consideration of the mutual promises herein, you agree as
    follows:

    <span style="font-size:14px;">1. DEFINITIONS.</span>

    <span style="font-size:14px;">1.1 "**Confidential Information**"</span> means any and all information disclosed by either party to the other which is designated as confidential, or which should otherwise be understood to be confidential, including but not limited to, the Solution, product plans, business plans, trade secrets, technology, or any other proprietary information.

    <span style="font-size:14px;">1.2 "**Solution**" </span> means the testnet version of the DoubleZero high-performance network infrastructure for web3 projects ("**Testnet**") and related edge filtering service with integrated bandwidth ("**Information Service**") the DZ Software (defined below), any and all materials provided by DZF relating to the DZ Software ("**Documentation**"), and other materials that DZF provides to User hereunder.

    <span style="font-size:14px;">2. ACCESS. </span>

    <span style="font-size:14px;">2.1 ^^Access to Solution^^.</span> Subject to the terms and conditions of this Agreement, DZF will provide User access to the Solution through the Internet. User's access is a non-exclusive, non-transferable, limited use of the Solution to enable User to evaluate the Information Service only. With respect to any software comprising the Solution ("**DZ Software**"), DZF hereby grants User a limited, revocable license, during the Evaluation Period, to copy, download, make a reasonable number of copies of, run, and deploy (as applicable) such DZ Software solely as contemplated by the Documentation.

    <span style="font-size:14px;">2.2 ^^Restrictions^^. </span>User may use the Solution in accordance with this Agreement from the Effective Date until terminated by DZF (the "**Evaluation Period**"). User understands that any rights to use the Solution beyond the Evaluation Period will be subject to a separate commercial agreement between the parties with respect thereto, including the payment of fees. User shall not, and shall not permit any third party to: (i) modify or create any derivative works based on the Solution or any portion thereof; (ii) reproduce the Solution except as expressly permitted by this Agreement; (iii) sublicense, distribute, sell, lend, rent, lease, transfer, or grant any rights in or to all or any portion of the Solution or provide access to the Solution to third parties, on a service bureau basis or otherwise, except as an offering of the Information Services through or in connection with User's platform or product and not on a standalone basis; or (iv) use the Solution other than as provided herein.

    <span style="font-size:14px;">2.3 ^^Ownership^^.</span> DZF retains all right, title and interest, including intellectual property rights, in and to the Solution.

    <span style="font-size:14px;">3 FEEDBACK.</span>
    DZF may periodically request that User provide, and User agrees to provide to DZF, feedback regarding the use, operation, and functionality of the Solution ("Feedback"). User hereby grants DZF a non-exclusive, worldwide, perpetual, irrevocable, royalty-free, fully paid-up, fully sublicensable and transferable right and license to use and incorporate Feedback into any products and services, to make, use, sell, offer for sale, import, and otherwise exploit such products and services, and to otherwise use, copy, distribute, and otherwise exploit the Feedback without restriction.

    <span style="font-size:14px;">4. TERM AND TERMINATION.</span>

    <span style="font-size:14px;">4.1 ^^Term^^.</span> This Agreement will commence as of the Effective Date and will remain in full force and effect for the Evaluation Period. Either party may terminate this Agreement immediately for convenience, for any reason or no reason, upon written notice to the other party (email to suffice).

    <span style="font-size:14px;">4.1 ^^Effects of Termination^^.</span> Upon termination of this Agreement for any reason: (i) the rights granted to User hereunder will immediately terminate; (ii) User shall immediately discontinue any use of the Solution and shall return or destroy all Documentation and any DZ Software under its control; (iii) each party shall promptly return or destroy all Confidential Information and property of the other party; and (iv) Sections 2.2, 2.3, 3, 4.2, and 5 through 8 will survive.

    <span style="font-size:14px;">5. CONFIDENTIALITY.</span>
    Each party agrees that it will use the Confidential Information of the other party solely to perform its obligations and exercise its rights under this Agreement and it will not disclose, or permit to be disclosed, the same, except as otherwise permitted hereunder. However, either party may disclose Confidential Information to its personnel, attorneys, and other representatives who have a need to know and are bound by confidentiality obligations no less protective than those set forth in this Agreement; and as required by law (in which case the receiving party will provide the disclosing party with prior notice thereof and opportunity to contest such disclosure, and will minimize such disclosure to the extent permitted by applicable law). The obligations of confidentiality in this Section 5 shall not apply to information that: (a) is or becomes generally known or publicly available through no fault of the receiving party; (b) was properly known to the receiving party, without restriction, prior to disclosure by the disclosing party; (c) was properly disclosed to the receiving party, without restriction, by another person with the legal authority to do so; or (d) is independently developed by the receiving party without use of or reference to the disclosing party's Confidential Information. Each party agrees to exercise due care in protecting the Confidential Information of the other party from unauthorized use and disclosure. In the event of actual or threatened breach of the provisions of this Section or the licenses contained herein, the non-breaching party will be entitled to seek immediate injunctive and other equitable relief, without waiving any other rights or remedies available to it. User is responsible for maintaining the Solution and the secrecy of any passwords, seed phrases, or codes that provide access to the Solution as the Confidential Information of DZF. Nothing herein limits or restricts DZF's right or ability to use data regarding the performance, availability, usage, integrity and security of the Solution. If either party breaches, or threatens to breach the provisions of this Section 5, each party agrees that the non-breaching party will have no adequate remedy at law and is therefore entitled to immediate injunctive and other equitable relief, without bond and without the necessity of showing actual money damages.

    <span style="font-size:14px;">6. WARRANTY DISCLAIMER; LIMITATION OF LIABILITY.</span>

    <span style="font-size:14px;">6.1 ^^WARRANTY DISCLAIMER^^.</span> THE SOLUTION IS PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND. DZF MAKES NO WARRANTIES, WHETHER EXPRESS, IMPLIED, STATUTORY OR OTHERWISE WITH RESPECT TO THE SOLUTION AND DOCUMENTATION INCLUDING THEIR CONDITION, CONFORMITY TO ANY REPRESENTATION OR DESCRIPTION, AND DZF SPECIFICALLY DISCLAIMS ALL IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT.

    <span style="font-size:14px;">6.2 ^^LIMITATION OF LIABILITY^^.</span>
    EXCEPT FOR A BREACH OF SECTIONS 2.1, 2.2, AND 5, IN NO EVENT SHALL EITHER PARTY BE LIABLE TO THE OTHER FOR INDIRECT, INCIDENTAL, SPECIAL OR OTHER CONSEQUENTIAL DAMAGES, INCLUDING WITHOUT LIMITATION DAMAGES FOR LOSS OF PROFITS OR USE OR LOSS OF DATA, INCURRED BY YOU OR ANY THIRD PARTY, ARISING OUT OF OR RELATED TO THIS AGREEMENT WHETHER IN AN ACTION IN CONTRACT, TORT, OR OTHERWISE, EVEN IF THE OTHER PARTY HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES. IN NO EVENT SHALL DZF'S AGGREGATE LIABILITY ARISING OUT OF OR RELATED TO THIS AGREEMENT EXCEED ONE HUNDRED DOLLARS (\$100), WHETHER AN ACTION IN CONTRACT, TORT, OR OTHERWISE. **THE FOREGOING LIMITATIONS WILL APPLY NOTWITHSTANDING THE FAILURE OF ESSENTIAL PURPOSE OF ANY LIMITED REMEDY HEREIN.** THE PARTIES AGREE THAT THE FOREGOING LIMITATIONS REPRESENT A REASONABLE ALLOCATION OF RISK UNDER THIS AGREEMENT.

    <span style="font-size:14px;">7. GOVERNING LAW.</span>
    This Agreement and all matters arising out of or relating to this Agreement shall be governed, interpreted and constructed in accordance with the laws of the Cayman Islands. Should a controversy, dispute or claim arise out of or in relation to this Agreement ("Dispute"), the relevant party as appropriate, must give 30 days' notice of such Dispute to the other parties (the "Notice of Dispute"). Should the Dispute not be resolved at the expiration of 30 days after service of the Notice of Dispute, the relevant party may commence arbitration proceedings as provided herein. Should the Dispute remain at the expiration of 30 days after service of the Notice of Dispute, the Dispute shall be settled by arbitration administered by the Cayman International Mediation & Arbitration Centre (CI-MAC) in accordance with the CI-MAC Arbitration Rules (the "Arbitration Rules") in force as at the date of this Agreement, which Arbitration Rules are deemed to be incorporated by reference to this clause, and governed by the Arbitration Act (as amended). The arbitration shall be seated in George Town, Grand Cayman, Cayman Islands and governed by Cayman Islands law. The language of the arbitration shall be English. The arbitration shall be determined by a sole arbitrator to be appointed in accordance with the Arbitration Rules. Any award or decision made by the arbitrator shall be in writing and shall be final and binding on the parties without any right of appeal, and judgment upon any award thus obtained may be entered in or enforced by any court having jurisdiction thereof. No action at law or in equity based upon any claim arising out of or related to this Agreement shall be instituted in any court of any jurisdiction. If any litigation or arbitration is necessary to enforce the terms of this Agreement, the prevailing party will be entitled to have their attorney fees paid by the other party. Each party waives any right it may have to assert the doctrine of forum non conveniens, to assert that it is not subject to the jurisdiction of such arbitration or courts or to object to venue to the extent any proceeding is brought in accordance herewith. </span>

    <span style="font-size:14px;">8. GENERAL PROVISIONS.</span>
    This Agreement may not be transferred or assigned by User without the prior written consent of DZF. DZF may freely assign this Agreement. All notices required to be sent hereunder shall be sent by email (to DZF: legal@doublezero.xyz) and deemed received the day after sending (with transmission confirmed). If any provision of this Agreement is held to be invalid or unenforceable, the remaining provisions of this Agreement will remain in full force and effect. The waiver by either party of any default or breach of this Agreement shall not constitute a waiver of any other or subsequent default or breach. Neither party shall be liable for any delay or failure in performance due to acts of God, earthquakes, shortages of supplies, transportation difficulties, labor disputes, riots, war, fire, epidemics, and similar occurrences beyond its control, whether or not foreseeable. This Agreement together with any attachments constitutes the complete agreement between the parties and supersedes all prior or contemporaneous agreements or representations, written or oral, concerning the subject matter herein. This Agreement may not be modified or amended except in writing signed by a duly authorized representative of each party.

Elige la red de DoubleZero que corresponda a tu clúster de Solana: `mainnet-beta` o `testnet`. Instala los paquetes correspondientes en [configuración](../../setup.md), y usa esa misma red para cada comando a continuación.

!!! Note inline end
    El modo IBRL no requiere reiniciar los clientes del validador, porque utiliza tu dirección IP pública existente.

Los validadores de Solana se conectan a DoubleZero en modo IBRL siguiendo los pasos de esta página.

Cada validador de Solana tiene su propio **par de claves de identidad**; de este se extrae la clave pública conocida como el **ID del nodo**. Esta es la huella digital única del validador en la red de Solana.

Con el DoubleZeroID y el ID del nodo identificados, demostrarás la propiedad de tu máquina. Esto se hace creando un mensaje que incluye el DoubleZeroID firmado con la clave de identidad del validador. La firma criptográfica resultante sirve como prueba verificable de que controlas el validador.

Finalmente, enviarás una **solicitud de conexión a DoubleZero**. Esta solicitud comunica: *"Aquí está mi identidad, aquí está la prueba de propiedad, y aquí está cómo pretendo conectarme."* DoubleZero valida esta información, acepta la prueba y aprovisiona el acceso a la red para el validador en DoubleZero.

Esta guía permite que 1 Validador Primario se registre a sí mismo, y hasta 3 máquinas de respaldo/conmutación por error al mismo tiempo.

## Requisitos Previos {#prerequisites}

- Solana CLI instalado y en $PATH
- Para validadores: Permiso para acceder al archivo del par de claves de identidad del validador (por ejemplo, validator-keypair.json) bajo el usuario sol
- Para validadores: Verificar que la clave de Identidad del validador de Solana que se va a conectar tenga al menos 1 SOL
- Las reglas de firewall permiten conexiones salientes para DoubleZero y Solana RPC según sea necesario, incluyendo
 GRE (ip proto 47) y BGP (169.254.0.0/16 en tcp/179)

!!! info
    El ID del Validador se verificará contra el gossip de Solana para determinar la IP de destino. La IP de destino y el DoubleZero ID se utilizarán entonces al abrir un túnel GRE entre tu máquina y el dispositivo DoubleZero de destino.

    Considerar: En el caso donde tengas un ID descartable y un ID Primario en la misma IP, solo el ID Primario se usará en el registro de la máquina. Esto se debe a que el ID descartable no aparecerá en gossip y, por lo tanto, no puede usarse para verificar la IP de la máquina de destino.

## 1. Confirmar la red del cliente {#1-confirm-the-client-network}

Por favor sigue las instrucciones de [configuración](../../setup.md) antes de continuar. Instala los paquetes para **mainnet-beta** o **testnet**. Usan diferentes repositorios de paquetes.

El último paso en la configuración fue desconectarse de la red. Esto es para asegurar que solo un túnel esté abierto en tu máquina hacia DoubleZero, y que ese túnel esté en la red correcta.

Confirma que el cliente está en la red que elegiste:

```bash
doublezero status
```

La columna `Network` debería ser `mainnet-beta` o `testnet`, coincidiendo con tu clúster de Solana. Si es incorrecta, o instalaste el paquete equivocado, usa el cambio de copiar y pegar en [solución de problemas](../../support/troubleshooting.md#issue-wrong-doublezero-environment).

Después de aproximadamente 30 segundos verás los dispositivos DoubleZero disponibles:

```bash
doublezero latency
```

Salida de ejemplo (mainnet-beta; testnet se ve igual pero con menos dispositivos):

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

## 2. Abrir el puerto 44880 {#2-open-port-44880}

Los usuarios necesitan abrir el puerto 44880 para utilizar algunas [funcionalidades de enrutamiento](https://github.com/malbeclabs/doublezero/blob/main/rfcs/rfc7-client-route-liveness.md).

Para abrir el puerto 44880 podrías actualizar las tablas de IP como:

```
sudo iptables -A INPUT -i doublezero0 -p udp --dport 44880 -j ACCEPT
sudo iptables -A OUTPUT -o doublezero0 -p udp --dport 44880 -j ACCEPT
```


observa los flags `-i doublezero0`, `-o doublezero0` que restringen esta regla únicamente a la interfaz DoubleZero

O UFW como:

```
sudo ufw allow in on doublezero0 to any port 44880 proto udp
sudo ufw allow out on doublezero0 to any port 44880 proto udp
```


observa los flags `in on doublezero0`, `out on doublezero0` que restringen esta regla únicamente a la interfaz DoubleZero

## 3. Atestiguar la Propiedad del Validador {#3-attest-validator-ownership}

!!! note "Flag de red"
    Los comandos de Passport a continuación usan `-u mainnet-beta`. En testnet, usa `-u testnet` (o `-ut`) en su lugar.

Con tu Entorno DoubleZero configurado, ahora es momento de atestiguar la Propiedad de tu Validador.

El DoubleZero ID que creaste en la [configuración](../../setup.md) de tu validador primario debe usarse en todas las máquinas de respaldo.

El ID en tu máquina primaria se puede encontrar con `doublezero address`. El mismo ID debe estar en `~/.config/doublezero/id.json` en todas las máquinas del clúster.

Para lograr esto, primero verificarás que la máquina desde la que estás ejecutando los comandos es tu **Validador Primario** con:

```
doublezero-solana passport find-validator -u mainnet-beta
```

Esto verifica que el validador esté registrado en gossip y aparezca en el calendario de líderes.

Salida esperada:

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
    El mismo flujo de trabajo se usa para una o varias máquinas.
    Para registrar una sola máquina, excluye los argumentos "--backup-validator-ids" o "backup_ids=" de cualquier comando en esta página.

Ahora, en todas las máquinas de respaldo donde pretendes ejecutar tu **Validador Primario**, ejecuta lo siguiente:
```
doublezero-solana passport find-validator -u mainnet-beta
```

Salida esperada:

```
Connected to Solana: mainnet

DoubleZero ID: YourDoubleZeroAddress11111111111111111111111111111
Detected public IP: 22.22.22.222
Validator ID: ValidatorIdentity222222222222222222222222222
Gossip IP: 22.22.22.222
In Not in Leader scheduler
 ✅ This validator can only connect as a backup in DoubleZero 🖥️  🛟. It is not leader scheduled and cannot act as a primary validator.
```
Esta salida es esperada. El nodo de respaldo no puede estar en el calendario de líderes al momento de crear el pase.

Ahora ejecutarás este comando en **todas las máquinas de respaldo** en las que planeas usar la cuenta de voto y la identidad de tu **Validador Primario**.


### Preparar la Conexión {#prepare-the-connection}

Ejecuta el siguiente comando en la máquina del **Validador Primario**. Esta es la máquina donde tienes stake activo, que está en el calendario de líderes con tu ID de validador primario en solana gossip en la máquina desde la que estás ejecutando el comando:

```
doublezero-solana passport prepare-validator-access -u mainnet-beta \
  --doublezero-address YourDoubleZeroAddress11111111111111111111111111111 \
  --primary-validator-id ValidatorIdentity111111111111111111111111111 \
  --backup-validator-ids ValidatorIdentity222222222222222222222222222,ValidatorIdentity33333333333333333333333333,ValidatorIdentity444444444444444444444444444>
```


Salida de ejemplo:

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
Observa la salida al final de este comando. Es la estructura para el siguiente paso.


## 4. Generar Firma {#4-generate-signature}

Al final del último paso, recibimos una salida preformateada para `solana sign-offchain-message`

De la salida anterior ejecutaremos este comando en la máquina del **Validador Primario**.

```
  solana sign-offchain-message \
     service_key=YourDoubleZeroAddress11111111111111111111111111111,backup_ids=ValidatorIdentity222222222222222222222222222,ValidatorIdentity33333333333333333333333333,ValidatorIdentity444444444444444444444444444 \
     -k <identity-keypair-file.json>
```

**Salida:**

```
  Signature111111rrNykTByK2DgJET3U6MdjSa7xgFivS9AHyhdSG6AbYTeczUNJSjYPwBGqpmNGkoWk9NvS3W7
```


## 5. Iniciar una Solicitud de Conexión en DoubleZero {#5-initiate-a-connection-request-in-doublezero}

Usa el comando `request-validator-access` para crear una cuenta en Solana para la solicitud de conexión. El agente DoubleZero Sentinel detecta la nueva cuenta, valida su identidad y firma, y crea el pase de acceso en DoubleZero para que el servidor pueda establecer una conexión.


Usa el ID del nodo, el DoubleZeroID y la firma.

!!! note inline end
      En este ejemplo usamos `-k /home/user/.config/solana/id.json` para encontrar la Identidad del validador. Usa la ubicación apropiada para tu despliegue local.

```
doublezero-solana passport request-validator-access -k <path to keypair> -u mainnet-beta \
--primary-validator-id ValidatorIdentity111111111111111111111111111 \
--backup-validator-ids ValidatorIdentity222222222222222222222222222,ValidatorIdentity33333333333333333333333333,ValidatorIdentity444444444444444444444444444 \
--signature Signature111111rrNykTByK2DgJET3U6MdjSa7xgFivS9AHyhdSG6AbYTeczUNJSjYPwBGqpmNGkoWk9NvS3W7 --doublezero-address YourDoubleZeroAddress11111111111111111111111111111
```

**Salida:**

Esta salida se puede usar para ver la transacción en un explorador de Solana. Asegúrate de configurar el explorador en mainnet-beta o testnet para que coincida con tu clúster. Esta verificación es opcional.

```bash
Request Solana validator access: Transaction22222222VaB8FMqM2wEBXyV5THpKRXWrPtDQxmTjHJHiAWteVYTsc7Gjz4hdXxvYoZXGeHkrEayp
```

Si tiene éxito, DoubleZero registrará el primario con sus respaldos. Ahora puedes hacer conmutación por error entre las IPs registradas en el pase de acceso. DoubleZero mantendrá la conectividad automáticamente al cambiar a nodos de respaldo registrados de esta manera.


## 6. Conectar en Modo IBRL {#6-connect-in-ibrl-mode}

En el servidor, con el usuario que se conectará a DoubleZero, ejecuta el comando `connect` para establecer la conexión a DoubleZero.

```
doublezero connect ibrl
```

Deberías ver una salida indicando el aprovisionamiento, como:

```
⚡  Connecting to mainnet-beta...
    DoubleZero ID: <your DoubleZero ID>
⚡  Provisioning for IP: <your public ip>
    Device selected: <the doublezero device you are connecting to>
✅  User Provisioned
```
Espera un minuto para que el túnel GRE termine de configurarse. Hasta que el túnel GRE termine de configurarse, la salida de tu estado puede devolver "down" o "Unknown"

Verifica tu conexión:

```bash
doublezero status
```

**Salida:**
!!! note inline end
    Examina esta salida. Observa que el `Tunnel src` y el `DoubleZero IP` coinciden con la dirección IPv4 pública de tu máquina.
    <!--`Tunnel dst` es la dirección del dispositivo DZ al que estás conectado.-->

```bash
 Tunnel status | Last Session Update     | Tunnel Name | Tunnel src    | Tunnel dst     | Doublezero IP | User Type | Current Device | Lowest Latency Device | Metro     | Network
 up            | 2025-10-20 12:12:55 UTC | doublezero0 | 11.11.11.111 | 12.34.56.789 | 11.11.11.111 | IBRL      | ams-dz001      | ✅ ams-dz001          | Amsterdam | mainnet-beta
```

(`Network` muestra `testnet` cuando te conectaste en testnet.)

Un estado de `up` significa que estás conectado exitosamente.

Podrás ver las rutas propagadas por otros usuarios en DoubleZero ejecutando:

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


### Siguiente Paso: Publicar Shreds vía Multicast {#up-next-publishing-shreds-via-multicast}

Si has completado esta configuración y planeas publicar shreds vía multicast, continúa a la [siguiente página](../edge/publish.md).