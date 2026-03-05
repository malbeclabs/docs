**Revise el Descargo de Responsabilidad antes de acceder o usar el código o cualquier material relacionado.**

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

Los validadores pueden pagar sus tarifas en 2Z a través de un [programa de swap](https://github.com/doublezerofoundation/doublezero-offchain/tree/main/crates/solana-interface/sol-conversion) onchain. El swap se realiza intercambiando 2Z por SOL. El saldo de SOL en su cuenta de depósito se actualizará según el swap.


Este proceso **siempre** usará incrementos de 1 SOL. El resultado de este swap **siempre** se depositará directamente en su cuenta de depósito. Es una vía de un solo sentido: no puede recuperar el 2Z o SOL de esta transacción. Se enviará a un módulo de distribución onchain.


#### Paso 1
Primero determine cuál es la tasa de conversión actual


```
doublezero-solana revenue-distribution fetch sol-conversion
```


salida:
```
| field           | description                  | value         | note                          |
|-----------------|------------------------------|---------------|-------------------------------|
| Swap Rate       | 2Z amount for 1 SOL          | 800.86265341  |                               |
| Swap Rate       | 2Z amount for 1 SOL          | 797.75530631  | Includes 0.38800000% discount |
| Journal Balance | SOL available for conversion | 438.670881289 |                               |
```


#### Paso 2
Coloque una orden con límite. Ejecutará este swap bajo su propio riesgo. No hacemos recomendaciones sobre el perfil de riesgo, y los ejemplos proporcionados aquí son con fines educativos.


##### Cómo estructurar una orden con límite
Basándonos en el ejemplo anterior, ahora colocaremos una orden con límite un 5% por encima del precio de cotización.
797.76 * 1.05 = 837.65


En este ejemplo, asumiremos que la cuenta de depósito tiene 0 SOL.


```
doublezero-solana revenue-distribution --convert-2z-limit-price 837.65 --node-id ValidatorIdentity11111111111111111111111111111111111111111111111111111111111111 --fund 1
```
Note en el comando anterior `--fund 1`, esto financia explícitamente 1 SOL en la cuenta de depósito.


Si elige cualquier número diferente a 1 recibirá un error indicando la cantidad incorrecta:
```
Error: SOL amount must be 1.000000000 for 2Z -> SOL conversion. Got 1.500000000
```


Se le pedirá confirmar la transacción:


```
⚠️  By specifying --convert-2z-limit-price, you are funding 1.000000000 SOL to your deposit account. Proceed? [y/N]
```


salida:
```
2Z token balance: 987241.76579348
Converted 2Z to SOL: 2iaBzd4vgEeDnpfSCD9aYFMWZ3UoVzrJfUjSMhsDhfSQ6isPZKkKe3ZWQ6b5aWvV3h8Vsk8Mmde6wmCiidD4Qc6s
Converted 837.65 2Z tokens to 1.000000000 SOL
```
Observe que en un swap exitoso el `Balance:` se ha actualizado a 1 SOL.


Si un precio está fuera de su rango especificado se encontrará con un error como:
```
Error: RPC response error -32002: Transaction simulation failed: Error processing Instruction 0: custom program error: 0x177f; 10 log messages:
 Program 9DRcqsJUCo8CL2xDCXpogwzLEVKRDzSyNtVgXqsXHfDs invoke [1]
 Program log: Instruction: BuySol
 Program log: Signature verified successfully
 Program log: Timestamp verified successfully
 Program log: Bid price 79500000000
 Program log: Ask price 79862251144
 Program data: 1fxoRNOEulcAypo7AAAAAAC7kYISAAAAiD4pmBIAAAAsk/ZoAAAAAA4PxjWjgr+ERO7jDdvoOmT/WpgDFLfY+FGKKDdOw4PMAAAAAAAAAAA=
 Program log: AnchorError thrown in on-chain/programs/converter-program/src/buy_sol.rs:142. Error Code: BidTooLow. Error Number: 6015. Error Message: Provided bid is too low.
 Program 9DRcqsJUCo8CL2xDCXpogwzLEVKRDzSyNtVgXqsXHfDs consumed 50754 of 90000 compute units
 Program 9DRcqsJUCo8CL2xDCXpogwzLEVKRDzSyNtVgXqsXHfDs failed: custom program error: 0x177f
```
