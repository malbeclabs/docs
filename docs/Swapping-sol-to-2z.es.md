**Revise el Descargo de Responsabilidad antes de acceder o usar el código o cualquier material relacionado.**
!!! warning "This translation was generated using artificial intelligence and has not been reviewed by a human translator. It may contain inaccuracies or errors and should not be relied upon."


<!-- https://github.com/doublezerofoundation/doublezero-offchain/pull/159 -->

??? warning "Descargo de Responsabilidad"

    Este documento y el código asociado se proporcionan únicamente con fines informativos y técnicos. La funcionalidad de conversión de tokens descrita aquí es sin custodia: los usuarios interactúan directamente con los contratos inteligentes subyacentes y retienen el control total de sus activos en todo momento.

    El sistema puede depender de o interactuar con código, fuentes de datos o mecanismos de precios y tarifas de terceros (por ejemplo, contratos inteligentes, APIs o exchanges descentralizados) que no son desarrollados, controlados ni revisados por los desarrolladores o publicadores. No se hace ninguna declaración o garantía sobre la precisión, funcionalidad o seguridad de ningún componente de terceros.
    Los desarrolladores y publicadores de este código no garantizan su exactitud, integridad o disponibilidad continua. El código y los materiales relacionados se proporcionan "tal cual" y pueden contener errores, bugs o vulnerabilidades. El uso es completamente bajo su propio riesgo.
    Los desarrolladores y publicadores no reciben ninguna tarifa en conexión con el uso de estos contratos. No tienen ninguna obligación de mantener, actualizar o apoyar el código o la documentación relacionada.

    Este documento no constituye una oferta de venta, una solicitud de compra ni una recomendación para participar en ninguna conversión de tokens, swap u otra transacción. No se proporciona asesoramiento legal, financiero ni de inversión.
    Los usuarios son los únicos responsables de determinar la legalidad de sus actividades. Deben revisar las leyes y regulaciones aplicables en su jurisdicción y consultar asesores independientes antes de usar el código o participar en cualquier conversión. El uso está prohibido donde sea ilegal, incluso por personas o entidades sujetas a sanciones o en jurisdicciones restringidas.

    En la medida máxima permitida por la ley, los desarrolladores y publicadores rechazan toda responsabilidad por cualquier pérdida, daño o reclamación que surja de o en relación con el uso del código o la participación en la conversión.

    La revisión y el uso de este documento y el código asociado están sujetos a los [Términos y Condiciones del Sitio Web](https://doublezero.xyz/terms) y los [Términos y Condiciones del Protocolo](https://doublezero.xyz/terms-protocol).

El protocolo DoubleZero recauda ingresos denominados en SOL de sus validadores usuarios, pero distribuye recompensas denominadas en 2Z a los contribuidores. Por lo tanto, debe convertir SOL en 2Z.

**Para hacerlo, los participantes elegibles pueden operar contra un contrato de swap de DoubleZero, comprando SOL del contrato y vendiéndolo a 2Z. Los precios se basan en feeds de precios de Pyth con un mecanismo de descuento programático.**

Esta breve guía explica cómo usar el programa.

***Revise el Descargo de Responsabilidad al final de este documento antes de acceder o usar el código o cualquier material relacionado.***

---

## Diseño del Programa

El programa de swap es efectivamente un pool de liquidez unilateral que vende SOL en un tamaño de lote fijo de 1 SOL por operación. Cualquier participante elegible puede retirar SOL del programa depositando 2Z, a un precio determinado por un precio de oráculo de Pyth y un descuento dinámico. Con el tiempo, esto ejecuta el objetivo del programa de convertir tokens nativos en 2Z.

Para utilizarlo, un trader debe proporcionar dos precios recientes de Pyth (SOL/USD y 2Z/USD) y una cantidad de 2Z. Luego el programa calcula el 2Z necesario para comprar ese 1 SOL basándose en el precio implícito SOL/2Z. Luego realiza algunos pasos adicionales:

- Comprueba que los precios de Pyth sean suficientemente recientes, es decir, que no tengan más de 5 segundos de antigüedad.
- Comprueba que los intervalos de confianza de los dos precios sean suficientemente pequeños. Es decir, la suma de dos desviaciones estándar de Laplace (es decir, el parámetro `conf` en el precio de Pyth) para los dos precios, normalizada por sus niveles, debe ser menor o igual a 30 puntos básicos.
- Ajusta el precio SOL/2Z mediante un descuento dinámico, expresado como porcentaje del precio de Pyth. Este descuento es una función del tiempo desde la última operación. La fórmula siguiente especifica el descuento, suponiendo que la última operación se realizó en el slot $s_{\text{last}}$ y el slot actual es $s_{\text{now}}$. (Por ejemplo, si han transcurrido 200 slots desde la última operación, el descuento es de 40 puntos básicos.)

$$
\text{discount} = \min\{0.00002 \times \left(s_{\text{now}} - s_{\text{last}}\right), 0.01\}
$$

En este punto, si el trader ha proporcionado suficiente 2Z para ejecutar la transacción a este precio calculado (incluyendo el descuento), se ejecuta a este precio calculado. Devuelve al trader la cantidad de SOL comprada y cualquier 2Z excedente.

Luego el contrato no permite más operaciones para ese slot. Esto es para evitar que el contrato pague un slippage excesivamente alto si el precio de Pyth está muy lejos del precio real en un momento dado de maneras que los filtros existentes no detectan.

---

## Ejecución Atómica Sin Gas

Esta sección detallará cómo usar el comando `harvest-dz`. Este comando realizará atómicamente 2 acciones.
1. El comando solicita una cotización de Jupiter frente al programa de conversión nativo SOL <> 2Z.
2. Cuando la ruta de Jupiter produce más 2Z por SOL de lo que requiere el programa de conversión nativo, `harvest-2z` ejecuta un swap, devolviendo a su billetera 1 SOL más la diferencia en 2Z.

### Cosechar 2Z

Para ejecutar, ejecute lo siguiente:
```
doublezero-solana revenue-distribution harvest-2z
```
La salida se parecerá a:
```
Harvested 5.98151278 2Z tokens with 1.000000000 SOL
```
El comando también puede simularse con el argumento `--dry-run`. La ejecución en seco producirá logs del programa y una salida que se asemejará a:

```
Simulated harvesting 5.98151278 2Z tokens with 1.000000000 SOL
```

---

## Conversión de Protocolo

Esta sección analiza la verificación de las tasas de conversión y la ejecución de la conversión usando el CLI `doublezero-solana`. Y al final, analizamos la interfaz para integraciones personalizadas con el contrato de swap de DoubleZero.

### Cómo verificar el precio de conversión SOL/2Z a través de `doublezero-solana`

Para encontrar las tasas de conversión SOL/2Z en mainnet-beta, ejecute el siguiente comando:

```bash
doublezero-solana revenue-distribution fetch sol-conversion
```

Y la salida que vería se parecerá a:

```bash
| field           | description                  | value         | note                          |
|-----------------|------------------------------|---------------|-------------------------------|
| Swap Rate       | 2Z amount for 1 SOL          | 805.72612992  |                               |
| Swap Rate       | 2Z amount for 1 SOL          | 805.38772494  | Includes 0.04200000% discount |
| Journal Balance | SOL available for conversion | 438.670881289 |                               |
```

El Saldo del Diario informa al usuario cuánta liquidez SOL hay en el contrato inteligente de Distribución de Ingresos. Un usuario puede operar siempre que el Saldo del Diario supere el tamaño de operación fijo de 1 SOL.

La primera fila muestra el precio de conversión SOL/2Z "verdadero" a través de un oráculo offchain. La segunda fila es el precio de conversión utilizado en cadena para el swap, que simplemente ajusta el precio verdadero por el descuento algorítmico.

### Cómo convertir su 2Z a SOL a través de `doublezero-solana`

Para convertir sus tokens 2Z a SOL, ejecute el siguiente comando:

```bash
doublezero-solana revenue-distribution convert-2z
```

Por defecto, si hay suficiente liquidez de SOL y su ATA tiene suficiente 2Z para realizar el swap, esta transacción tendrá éxito. Puede ajustar más finamente el swap especificando los siguientes argumentos:

```bash
      --limit-price <DECIMAL>                    El precio límite por defecto es el precio de oráculo actual SOL/2Z
      --source-2z-account <PUBKEY>               La cuenta de tokens debe ser propiedad del firmante. Por defecto es el ATA del firmante si no se especifica
      --checked-sol-amount <SOL>                 Verificar explícitamente la cantidad de SOL. Cuando se especifica, esta cantidad se verificará contra la cantidad de relleno fija
```

El precio límite especificado determina el precio en el peor caso que está dispuesto a aceptar al realizar la conversión SOL/2Z. Por ejemplo, supongamos que el precio descontado de 2Z para SOL es 800, lo que significa 800 tokens 2Z por 1 SOL. Si especifica un precio límite de 790, no está dispuesto a realizar el swap porque está requiriendo intercambiar como máximo 790 tokens 2Z por 1 SOL. Pero si especifica 810, la operación se realizará porque estaba dispuesto a intercambiar como máximo 810 tokens 2Z (y en este caso, solo habrá intercambiado 800 tokens 2Z en esta transacción).

La cuenta de tokens 2Z de origen reemplaza el ATA por defecto usando el firmante como propietario de este ATA de 2Z. Pero si tiene otra cuenta de tokens que desea usar para realizar el swap, proporcione la pubkey con este argumento.

Opcionalmente, puede especificar la cantidad de SOL verificada al tamaño de relleno estándar (establecido en 1 SOL al lanzamiento). Si no coincide con el tamaño de relleno del programa, el swap falla. Esto mitiga el riesgo de que el tamaño de relleno del programa cambie y usted no lo note.

### Interfaz para Comprar SOL

La interfaz y el CLI `doublezero-solana` viven en [este repositorio](https://github.com/doublezerofoundation/doublezero-offchain). El código fuente de la interfaz del contrato de swap de DoubleZero se puede encontrar [aquí](https://github.com/doublezerofoundation/doublezero-offchain/tree/b3f606a91326baf64b475a37d612981b63243b09). El ID del programa es `9DRcqsJUCo8CL2xDCXpogwzLEVKRDzSyNtVgXqsXHfDs`.

Una forma conveniente de generar las cuentas necesarias para la instrucción de compra de SOL es usar el método `new` (que se encuentra en *instruction/account.rs*).

```rust
pub fn new(
    fill_registry_key: &Pubkey,
    user_token_account_key: &Pubkey,
    dz_mint_key: &Pubkey,
    user_key: &Pubkey,
) -> Self;
```

La `fill_registry_key` se puede obtener ya sea del `ProgramState`

```rust
pub struct ProgramState {
    pub admin_key: Pubkey,
    pub fills_registry_key: Pubkey, // esta clave
    pub is_paused: bool,
    pub configuration_registry_bump: u8,
    pub program_state_bump: u8,
    pub deny_list_registry_bump: u8,
    pub withdraw_authority_bump: u8,
    pub last_trade_slot: u64,
    pub deny_list_authority: Pubkey,
}
```

Alternativamente, puede llamar a `getProgramAccounts` a través del RPC de Solana con su discriminador. Pero recomendamos almacenar en caché esta pubkey ya que nunca cambiará.

La `user_key` es un firmante para la instrucción de compra de SOL y debe ser el propietario de la `user_token_account_key`. Como se describió anteriormente, esto NO necesita ser un ATA. Siempre que su cuenta de tokens 2Z sea propiedad de la `user_key`, esta instrucción tendrá éxito.

La estructura `BuySolAccounts` implementa `Into<Vec<AccountMeta>>` para que pueda generar todos los metadatos de cuenta que necesita para construir la instrucción.

Los datos de instrucción son:

```rust
    SolConversionInstructionData::BuySol {
        limit_price: u64,
        oracle_price_data: OraclePriceData,
    },
```

Estos datos de instrucción están serializados en Borsh y tienen un selector Anchor de 8 bytes, que todo se serializará cuando se use `BorshSerialize::serialize`.

Los datos de precio del oráculo se pueden obtener desde este endpoint público: [https://sol-2z-oracle-api-v1.mainnet-beta.doublezero.xyz/swap-rate](https://sol-2z-oracle-api-v1.mainnet-beta.doublezero.xyz/swap-rate). Los datos son deserializables con serde usando la estructura OraclePriceData que se encuentra en *oracle.rs*.

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

Ejemplo de cómo obtener usando el [crate reqwest](https://docs.rs/reqwest/latest/reqwest/):

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

Con el ID del programa, las cuentas y los datos de instrucción, debería poder construir la instrucción para comprar SOL del contrato de swap de DoubleZero.
