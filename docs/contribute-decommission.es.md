# Guía de desmantelamiento de sitio para contribuidores

Esta guía describe cómo desmantelar un dispositivo DoubleZero (DZD) o dar de baja un sitio: cómo retirar sus dispositivos y enlaces de la red sin interrumpir a los usuarios conectados, y luego eliminarlos onchain.

El proceso se ejecuta en tres fases: limitar el dispositivo 31 días antes del día de desmantelamiento, notificar a los usuarios conectados durante un período de aviso para que puedan migrar, y luego drenar y eliminar los enlaces, interfaces y el dispositivo el día del desmantelamiento.

> ⚠️ **Coordine con DoubleZero primero:**
> Siempre alinéese con el equipo de DoubleZero antes de desmantelar un dispositivo o sitio, y programe su fecha y hora de desmantelamiento con nosotros. Ejecutamos algunos pasos de nuestro lado alrededor de ese horario, por lo que necesitamos estar programados. Acuerde las fechas y el plan antes de limitar un dispositivo o drenar un enlace.

> ⚠️ **Switches y enlaces DZX:**
> Si el dispositivo que está desmantelando es un switch DZX, o tiene algún enlace DZX, identifique a los contribuidores afectados lo antes posible y notifíqueles, ya que es posible que necesiten mover o reconstruir sus enlaces antes de su fecha. También cree un evento de mantenimiento en el [portal OPS](contribute-ops-management.md) para la fecha de desmantelamiento.

---

## Resumen

| Cuándo | Acción | Quién |
|--------|--------|-------|
| 31 días antes | Limitar el dispositivo para que nuevos usuarios no puedan conectarse (`--max-users 0`) | Contribuidor |
| 14 días antes | Los usuarios conectados son notificados para migrar a otro dispositivo | Equipo de DoubleZero |
| Período de aviso | Los usuarios se reconectan por su cuenta a otros DZDs | Usuarios |
| Día de desmantelamiento | Drenar y eliminar los enlaces, interfaces y el dispositivo | Contribuidor |

Principios:

- **Detener nuevos usuarios temprano, migrar usuarios existentes gradualmente.** Limitar el dispositivo temprano significa que solo pierde usuarios a partir de ese momento. Los usuarios existentes siguen funcionando y migran según su propio calendario.
- **Mantener todo activo durante el período de aviso.** No drene los enlaces ni el dispositivo hasta el día de desmantelamiento, para que los usuarios en proceso de migración mantengan el servicio normal.
- **El orden de desmontaje es impuesto por el contrato.** No puede eliminar un enlace o dispositivo mientras esté activo, por lo que los pasos a continuación drenan primero y eliminan al final.

> ⚠️ **Aviso con poco tiempo:**
> Si tiene menos de 31 días antes de la salida, comience inmediatamente. Limite el dispositivo ahora y acorte los períodos para ajustarse al tiempo disponible. El orden de los pasos no cambia.

---

## Fase 1 — Limitar el dispositivo (31 días antes)

Limite el dispositivo para que nuevos usuarios no puedan conectarse:

```bash
doublezero device update --pubkey <DEVICE_PUBKEY> --max-users 0
```

Los usuarios existentes no se ven afectados y siguen funcionando. Repita para cada dispositivo que se vaya a desmantelar en el sitio. Los enlaces y el dispositivo permanecen completamente activos, por lo que los usuarios conectados mantienen el servicio normal.

---

## Fase 2 — Período de aviso (14 días antes)

El equipo de DoubleZero notifica a los usuarios conectados, pidiéndoles que se reconecten a un DZD diferente antes de la fecha de desmantelamiento. Coordine con el equipo sobre quién contacta a qué usuarios.

No se drena nada durante este período, por lo que los usuarios mantienen el servicio normal. Los usuarios se reconectan a su propio ritmo. Monitoree el conteo de usuarios con:

```bash
doublezero device list
```

---

## Fase 3 — Día de desmantelamiento

Antes de comenzar, determine exactamente qué necesita ser eliminado: el dispositivo, los enlaces conectados a él y las interfaces a limpiar. Puede encontrar todo esto con:

```bash
doublezero device list | grep <CONTRIBUTOR_CODE>    # encontrar su dispositivo: su código y pubkey
doublezero link list | grep <DEVICE_CODE>           # encontrar los enlaces conectados al dispositivo
doublezero device interface list <DEVICE_CODE>      # listar las interfaces del dispositivo a eliminar
```

Ejecute estos pasos en orden. Cada paso desbloquea el siguiente.

> ⚠️ **Antes de la eliminación final del dispositivo:**
> Notifique a la Fundación DoubleZero antes de ejecutar el último paso. La Fundación elimina a cualquier usuario que no haya migrado a tiempo, lo cual de otro modo bloquearía la eliminación, y completa cualquier paso requerido del lado de la fundación.

### 1. Drenar los enlaces

Primero drenado suave, luego drenado fuerte. Consulte [Drenado de enlaces](contribute-operations.md#link-draining) para conocer qué hace cada estado.

```bash
doublezero link update --pubkey <LINK_PUBKEY> --status soft-drained
# una vez que el tráfico se haya movido:
doublezero link update --pubkey <LINK_PUBKEY> --status hard-drained
```

Repita para cada enlace en los dispositivos que se van a retirar.

### 2. Eliminar los enlaces

```bash
doublezero link delete --pubkey <LINK_PUBKEY>
```

Esto libera las interfaces que los enlaces estaban usando.

### 3. Eliminar las interfaces

```bash
doublezero device interface delete <DEVICE_CODE> <INTERFACE_NAME>
```

Repita para cada interfaz en el dispositivo.

### 4. Drenar el dispositivo

```bash
doublezero device update --pubkey <DEVICE_PUBKEY> --status drained
```

El drenado elimina el dispositivo del enrutamiento y cierra cualquier sesión de usuario restante. También mueve el dispositivo fuera de su estado activo para que pueda ser eliminado.

### 5. Eliminar el dispositivo

```bash
doublezero device delete --pubkey <DEVICE_PUBKEY>
```

El dispositivo solo puede ser eliminado una vez que ya no esté activo, no tenga enlaces que lo referencien y no le queden interfaces, lo cual los pasos anteriores se encargan de resolver.

---

## Cancelación o aplazamiento

Limitar y drenar son reversibles hasta que comience a eliminar:

```bash
doublezero device update --pubkey <DEVICE_PUBKEY> --max-users <ORIGINAL_VALUE>   # restaurar capacidad
doublezero link update --pubkey <LINK_PUBKEY> --status soft-drained             # desde hard-drained
doublezero link update --pubkey <LINK_PUBKEY> --status activated                # volver a activo
doublezero device update --pubkey <DEVICE_PUBKEY> --status activated            # revertir el drenado del dispositivo
```

Eliminar los enlaces, interfaces o el dispositivo es permanente: cierra las cuentas onchain. Solo comience a eliminar una vez que la salida esté confirmada.