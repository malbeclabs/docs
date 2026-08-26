**Revise el Aviso Legal antes de acceder o utilizar el código o cualquier material relacionado.**

<!-- https://github.com/malbeclabs/doublezero-offchain/pull/159 -->

??? warning "Aviso Legal"
    
    Este documento y el código asociado se proporcionan únicamente con fines informativos y técnicos. La funcionalidad de conversión de tokens descrita en este documento es no custodial: los usuarios interactúan directamente con los contratos inteligentes subyacentes y conservan el control total de sus activos en todo momento.

    El sistema puede depender de o interactuar con código de terceros, fuentes de datos o mecanismos de precios y tarifas (por ejemplo, contratos inteligentes, APIs o exchanges descentralizados) que no son desarrollados, controlados ni revisados por el/los desarrollador(es) o editor(es). No se realiza ninguna declaración ni garantía en cuanto a la precisión, funcionalidad o seguridad de ningún componente de terceros.
    El/los desarrollador(es) y editor(es) de este código no garantizan su precisión, integridad o disponibilidad continua. El código y los materiales relacionados se proporcionan "tal cual" y pueden contener errores, fallos o vulnerabilidades. Su uso es completamente bajo su propio riesgo.
    El/los desarrollador(es) y editor(es) no reciben ninguna tarifa en relación con el uso de estos contratos. No tienen ninguna obligación de mantener, actualizar o dar soporte al código o a la documentación relacionada.

    Este documento no constituye una oferta de venta, una solicitud de compra ni una recomendación para participar en ninguna conversión de tokens, intercambio u otra transacción. No se proporciona asesoramiento legal, financiero ni de inversión.
    Los usuarios son los únicos responsables de determinar la legalidad de sus actividades. Deben revisar las leyes y regulaciones aplicables en su jurisdicción y consultar a asesores independientes antes de utilizar el código o participar en cualquier conversión. El uso está prohibido donde sea ilegal, incluyendo por personas o entidades sujetas a sanciones o en jurisdicciones restringidas.

    En la máxima medida permitida por la ley, el/los desarrollador(es) y editor(es) renuncian a toda responsabilidad por cualquier pérdida, daño o reclamación que surja de o en relación con el uso del código o la participación en la conversión.

    La revisión y el uso de este documento y del código asociado están sujetos a los [Términos y Condiciones del Sitio Web](https://doublezero.xyz/terms) y a los [Términos y Condiciones del Protocolo](https://doublezero.xyz/terms-protocol).

El protocolo DoubleZero recauda ingresos denominados en SOL de sus usuarios validadores, pero distribuye recompensas denominadas en 2Z a los contribuidores. Por lo tanto, debe convertir SOL en 2Z.

**Para ello, los participantes elegibles pueden operar contra un contrato de intercambio de DoubleZero, comprando SOL del contrato y vendiéndole 2Z. El precio se basa en los feeds de precios de Pyth con un mecanismo de descuento programático.**

Esta breve guía explica cómo utilizar el programa.

***Revise el Aviso Legal al final de este documento antes de acceder o utilizar el código o cualquier material relacionado.***

---

## Diseño del Programa

El programa de intercambio es efectivamente un pool de liquidez unilateral que vende SOL en un tamaño de lote fijo de 1 SOL por operación. Cualquier participante elegible puede retirar SOL del programa depositando 2Z, a un precio determinado por un precio de oráculo de Pyth y un descuento dinámico. Con el tiempo, esto cumple el objetivo del programa de convertir tokens nativos en 2Z.

Para utilizarlo, un operador debe proporcionar dos precios recientes de Pyth (SOL/USD y 2Z/USD) y una cantidad de 2Z. El programa entonces calcula la cantidad de 2Z necesaria para comprar ese 1 SOL basándose en el precio implícito SOL/2Z. Luego toma algunos pasos adicionales:

- Verifica que los precios de Pyth sean suficientemente recientes, es decir, que no tengan más de 5 segundos de antigüedad.
- Verifica que los intervalos de confianza de los dos precios sean suficientemente pequeños. Es decir, la suma de dos desviaciones estándar de Laplace (es decir, el parámetro `conf` en el precio de Pyth) para los dos precios, normalizada por sus niveles, debe ser menor o igual a 30 puntos básicos.
- Ajusta el precio SOL/2Z mediante un descuento dinámico, expresado como un porcentaje del precio de Pyth. Este descuento es una función del tiempo transcurrido desde la última operación. La fórmula a continuación especifica el descuento, asumiendo que la última operación se realizó en el slot $s_{\text{last}}$ y el slot actual es $s_{\text{now}}$. (Por ejemplo, si han transcurrido 200 slots desde la última operación, el descuento es de 40 puntos básicos.)

$$
\text{discount} = \min\{0.00002 \times \left(s_{\text{now}} - s_{\text{last}}\right), 0.01\}
$$

En este punto, si el operador ha proporcionado suficiente 2Z para ejecutar la transacción a este precio calculado (incluyendo el descuento), se ejecuta a este precio calculado. Se devuelve al operador la cantidad comprada de SOL y cualquier excedente de 2Z.

El contrato entonces no permite más operaciones para ese slot. Esto es para evitar que el contrato pague un deslizamiento excesivamente alto en caso de que el precio de Pyth esté lejos del precio real en un momento dado, de maneras que los filtros existentes no detecten problemas.

---

## Ejecución Atómica sin Gas

Esta sección detallará cómo usar el comando `harvest-dz`. Este comando realizará atómicamente 2 acciones.
1. El comando solicita una cotización de Jupiter frente al programa nativo de conversión SOL <> 2Z.
2. Cuando la ruta de Jupiter produce más 2Z por SOL de lo que el programa de conversión nativo requiere, `harvest-2z` ejecuta un intercambio, devolviendo a su billetera 1 SOL más la diferencia en 2Z.

### Harvest 2Z

Para ejecutar, ejecute lo siguiente:
```
doublezero-solana revenue-distribution harvest-2z
```
La salida será similar a:
```
Harvested 5.98151278 2Z tokens with 1.000000000 SOL
```
El comando también puede simularse con el argumento `--dry-run`. La ejecución en seco producirá registros del programa y una salida similar a:

```
Simulated harvesting 5.98151278 2Z tokens with 1.000000000 SOL
```

---

## Conversión del Protocolo

Esta sección trata sobre cómo verificar las tasas de conversión y ejecutar la conversión utilizando el CLI `doublezero-solana`. Y al final, discutimos la interfaz para integraciones personalizadas con el contrato de intercambio de DoubleZero.

### Cómo verificar el precio de conversión SOL/2Z mediante `doublezero-solana`

Para encontrar las tasas de conversión SOL/2Z en mainnet-beta, ejecute el siguiente comando:

```bash
doublezero-solana revenue-distribution fetch sol-conversion
```

Y la salida que verá será similar a:

```bash
| field           | description                  | value         | note                          |
|-----------------|------------------------------|---------------|-------------------------------|
| Swap Rate       | 2Z amount for 1 SOL          | 805.72612992  |                               |
| Swap Rate       | 2Z amount for 1 SOL          | 805.38772494  | Includes 0.04200000% discount |
| Journal Balance | SOL available for conversion | 438.670881289 |                               |
```

El Journal Balance informa al usuario cuánta liquidez en SOL hay en el contrato inteligente de Distribución de Ingresos. Un usuario puede operar siempre que el Journal Balance exceda el tamaño fijo de operación de 1 SOL.

La primera fila muestra el precio de conversión SOL/2Z "real" a través de un oráculo offchain. La segunda fila es el precio de conversión utilizado on-chain para el intercambio, que simplemente ajusta el precio real con el descuento algorítmico.

### Cómo convertir sus 2Z a SOL mediante `doublezero-solana`

Para convertir sus tokens 2Z a SOL, ejecute el siguiente comando:

```bash
doublezero-solana revenue-distribution convert-2z
```

Por defecto, si hay suficiente liquidez en SOL y su ATA tiene suficiente 2Z para realizar el intercambio, esta transacción se completará con éxito. Puede ajustar el intercambio más precisamente especificando los siguientes argumentos:

```bash
      --limit-price <DECIMAL>                    Limit price defaults to the current SOL/2Z oracle price
      --source-2z-account <PUBKEY>               Token account must be owned by the signer. Defaults to signer ATA if not specified
      --checked-sol-amount <SOL>                 Explicitly check SOL amount. When specified, this amount will be checked against the fixed fill quantity
```

El precio límite especificado determina el peor precio que está dispuesto a aceptar al realizar la conversión SOL/2Z. Por ejemplo, supongamos que el precio con descuento de 2Z por SOL es 800, lo que significa 800 tokens 2Z por 1 SOL. Si especifica un precio límite de 790, no está dispuesto a realizar el intercambio porque está requiriendo intercambiar como máximo 790 tokens 2Z por 1 SOL. Pero si especifica 810, la operación se ejecutará porque estaba dispuesto a intercambiar como máximo 810 tokens 2Z (y en este caso, solo habrá intercambiado 800 tokens 2Z en esta transacción).

La cuenta de tokens 2Z de origen anula la ATA predeterminada que usa al firmante como propietario de esta ATA de 2Z. Pero si tiene otra cuenta de tokens que desea usar para realizar el intercambio, proporcione la pubkey correspondiente con este argumento.

Opcionalmente, puede especificar la cantidad verificada de SOL al tamaño de llenado estándar (establecido en 1 SOL en el lanzamiento). Si no coincide con el tamaño de llenado del programa, el intercambio falla. Esto mitiga el riesgo de que el tamaño de llenado del programa cambie y usted no lo note.

### Interfaz para Comprar SOL

La interfaz y el CLI `doublezero-solana` se encuentran en [este repositorio](https://github.com/malbeclabs/doublezero-offchain). El código fuente de la interfaz del contrato de intercambio de DoubleZero se puede encontrar [aquí](https://github.com/malbeclabs/doublezero-offchain/tree/b3f606a91326baf64b475a37d612981b63243b09). El program ID es `9DRcqsJUCo8CL2xDCXpogwzLEVKRDzSyNtVgXqsXHfDs`.

Una forma conveniente de generar las cuentas necesarias para la instrucción de compra de SOL es usando el método `new` (que se encuentra en *instruction/account.rs*).

```rust
pub fn new(
    fill_registry_key: &Pubkey,
    user_token_account_key: &Pubkey,
    dz_mint_key: &Pubkey,
    user_key: &Pubkey,
) -> Self;
```

El `fill_registry_key` se puede obtener del `ProgramState`

```rust
pub struct ProgramState {
    pub admin_key: Pubkey,
    pub fills_registry_key: Pubkey, // this key
    pub is_paused: bool,
    pub configuration_registry_bump: u8,
    pub program_state_bump: u8,
    pub deny_list_registry_bump: u8,
    pub withdraw_authority_bump: u8,
    pub last_trade_slot: u64,
    pub deny_list_authority: Pubkey,
}
```

Alternativamente, puede llamar a `getProgramAccounts` a través de Solana RPC con su discriminador. Pero recomendamos almacenar en caché esta pubkey ya que nunca cambiará.

El `user_key` es un firmante para la instrucción de compra de SOL y debe ser el propietario del `user_token_account_key`. Como se describió anteriormente, esto NO necesita ser una ATA. Siempre que su cuenta de tokens 2Z sea propiedad del `user_key`, esta instrucción se ejecutará con éxito.

La estructura `BuySolAccounts` implementa `Into<Vec<AccountMeta>>` para que pueda generar todos los account metas que necesita para construir la instrucción.

Los datos de la instrucción son

```rust
    SolConversionInstructionData::BuySol {
        limit_price: u64,
        oracle_price_data: OraclePriceData,
    },
```

Estos datos de instrucción se serializan con Borsh y tienen un selector Anchor de 8 bytes, que se serializará todo al usar `BorshSerialize::serialize`.

Los datos del precio del oráculo se pueden obtener desde este endpoint público: [https://sol-2z-oracle-api-v1.mainnet-beta.doublezero.xyz/swap-rate](https://sol-2z-oracle-api-v1.mainnet-beta.doublezero.xyz/swap-rate). Los datos son deserializables con serde usando la estructura OraclePriceData que se encuentra en *oracle.rs*.

```rust
#[derive(Debug, BorshDeserialize, BorshSerialize, Clone, Default, PartialEq, Eq)]
#[cfg_attr(
    feature = "serde",
    derive(serde::Deserialize),
    serde(rename_all = "camelCase")
)]
pub struct OraclePriceData {
    pub swap_rate: u64,
    pub timestamp: i64,
    pub signature: String,
}
```

Ejemplo de cómo obtenerlo usando el [crate reqwest](https://docs.rs/reqwest/latest/reqwest/):

```rust
use anyhow::{Context, Result};

pub async fn try_request_oracle_conversion_price(oracle_endpoint: &str) -> Result<OraclePriceData> {
    reqwest::Client::new()
        .get(oracle_endpoint)
        .header("User-Agent", "SOL buyoooooooor")
        .send()
        .await?
        .json()
        .await
        .with_context(|| format!("Failed to request SOL/2Z price from {oracle_endpoint}"))
}
```

Con el program ID, las cuentas y los datos de instrucción, debería poder construir la instrucción para comprar SOL del contrato de intercambio de DoubleZero.