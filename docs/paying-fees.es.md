# Precios y Tarifas para Validadores
!!! warning "This translation was generated using artificial intelligence and has not been reviewed by a human translator. It may contain inaccuracies or errors and should not be relied upon."


**Precios simples y alineados para validadores Solana**

Las tarifas comenzarán en la época 859, que inicia el sábado 4 de octubre a las 4am ET. Se cobra una tarifa plana del 5% sobre las recompensas por firma de bloques y las tarifas de prioridad.

Las tarifas financian directamente la infraestructura que hace posible DoubleZero, incluyendo líneas de fibra física y equipos en centros de datos.

Una exploración detallada sobre por qué existen las tarifas y el modelo de precios para validadores se puede encontrar [aquí](https://doublezero.xyz/fees).

***Esta guía se enfoca en cómo se pagan las tarifas desde una perspectiva técnica.***

## **Modelo de Liquidación**

- Las tarifas están denominadas en SOL y se liquidan por época
- La deuda del validador se calcula on-chain por el programa de Distribución de Ingresos
- Cada validador tiene una cuenta de depósito (PDA) para pagos
- Ventana de financiamiento: Las tarifas se depositan durante la época de Solana siguiente a su acumulación. Es decir, las tarifas acumuladas durante la época 860 deben pagarse en la época 861.
- Se admite la prefinanciación. Los saldos se reducen a lo largo de las épocas

---

# **Estimación de Tarifas**

Las estimaciones históricas y los datos por pubkey están disponibles en el [Repositorio de Estimaciones de Tarifas](http://github.com/doublezerofoundation/fees). El repositorio no reemplaza los datos on-chain. Usted es responsable del saldo on-chain, no del saldo en este repositorio.

¿Preguntas? Contacte a Nihar Shah en nihar@doublezero.us

# Detalles para Desarrolladores

### Interfaz de Línea de Comandos
El CLI de DoubleZero proporciona comandos para gestionar los depósitos de validadores y monitorear saldos.
Necesitará SOL en la cuenta desde la que ejecute estos comandos para pagar el gas.

<div data-wizard-step="fee-check" markdown>

### Paso 1: Comprender la Deuda Adeudada

Para ver la deuda en una dirección específica puede usar este formato:
```
doublezero-solana revenue-distribution fetch validator-debts --node-id ValidatorIdentity111111111111111111111111111
```
Examinaremos un ejemplo de salida a continuación:

```
| node_id                                      |    total_amount | deposit_balance | note                   |
|----------------------------------------------|-----------------|-----------------|------------------------|
| ValidatorIdentity111111111111111111111111111 | 0.632736605 SOL | 0.000220966 SOL | 0.632515639 SOL needed |
| ValidatorIdentity111111111111111111111111111 | 24.520162479 SOL| 0.000000000 SOL | Not funded             |
```
En el ejemplo de salida hay dos posibles resultados bajo `note`. `Not funded` significa que la cuenta no ha sido financiada. En el ejemplo, `0.632515639 SOL needed` es la cantidad pendiente de SOL necesaria para pagar todas las deudas actualmente adeudadas asociadas con el ID de Validador objetivo.

</div>

<div data-wizard-step="fee-pay" markdown>

### Paso 2: Pagar la Deuda Adeudada

!!! note inline end
      Puede programar este comando para que se ejecute a intervalos regulares.

Para pagar la deuda adeudada puede usar el siguiente comando. Esto usará automáticamente el keypair predeterminado en `$HOME/.config/solana/id.json`

Puede especificar el keypair con el que desea pagar su deuda añadiendo el argumento `-k path/to/keypair.json` al final del comando.

```
doublezero-solana revenue-distribution validator-deposit --fund-outstanding-debt --node-id ValidatorIdentity111111111111111111111111111
```
A continuación se proporciona un ejemplo de salida:

```
Solana validator deposit: DZ_PDA_MvFTgPku3dUrw2W3dbeK5dhxmXYKKYETDUK1V
Funded: TransactionHashHVxSobvdY2r14CkEwsBDhwf2dBmFatyeftisrdfSocMM2tXPjFvXPRmVs1xagiqKSX4b92fgt
Node ID: ValidatorIdentity111111111111111111111111111
Balance: 0.309294915 SOL
```

`Solana validator deposit:` devuelve la cuenta de depósito que fue financiada

`Funded:` devuelve el hash de la transacción, que puede consultar en su explorador Solana favorito

`Node ID:` devuelve el ID del Validador por el que se pagó

`Balance:` devuelve la cantidad de SOL que hay en la cuenta de depósito, después de que se complete la transferencia

</div>
