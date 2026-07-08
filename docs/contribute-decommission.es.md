# Guía de desmantelamiento de sitio para Contribuidores

Esta guía describe cómo desmantelar un Dispositivo DoubleZero (DZD) o dar de baja un sitio: cómo retirar tus dispositivos y enlaces de la red sin interrumpir a los usuarios conectados, y luego eliminarlos onchain.

El proceso se ejecuta en tres etapas: limitar el dispositivo 31 días antes del día de desmantelamiento, notificar a los usuarios conectados durante un período de aviso para que puedan migrar, y luego drenar y eliminar los enlaces, interfaces y el dispositivo el día del desmantelamiento.

> ⚠️ **Coordina con DoubleZero primero:**
> Siempre alinéate con el equipo de DoubleZero antes de desmantelar un dispositivo o sitio. Acuerda las fechas y el plan antes de limitar un dispositivo o drenar un enlace, para que la migración de usuarios y los pasos requeridos por parte de la fundación puedan coordinarse.

---

## Descripción general

| Cuándo | Acción | Quién |
|--------|--------|-------|
| 31 días antes | Limitar el dispositivo para que no se puedan conectar nuevos usuarios (`--max-users 0`) | Contribuidor |
| 14 días antes | Los usuarios conectados son notificados para migrar a otro dispositivo | Equipo de DoubleZero |
| Período de aviso | Los usuarios se reconectan por su cuenta a otros DZDs | Usuarios |
| Día de desmantelamiento | Drenar y eliminar los enlaces, interfaces y el dispositivo | Contribuidor |

Principios:

- **Detener nuevos usuarios temprano, mover usuarios existentes gradualmente.** Limitar el dispositivo temprano significa que solo pierde usuarios a partir de ese momento. Los usuarios existentes siguen funcionando y migran a su propio ritmo.
- **Mantener todo activo durante el período de aviso.** No drenes los enlaces ni el dispositivo hasta el día de desmantelamiento, para que los usuarios en proceso de migración mantengan el servicio normal.
- **El orden de desmontaje es impuesto por el contrato.** No puedes eliminar un enlace o dispositivo mientras está activo, por lo que los pasos a continuación drenan primero y eliminan al final.

> ⚠️ **Aviso con poca antelación:**
> Si tienes menos de 31 días antes de la salida, comienza inmediatamente. Limita el dispositivo ahora y acorta los períodos para ajustarte al tiempo disponible. El orden de los pasos no cambia.

---

## Fase 1 — Limitar el dispositivo (31 días antes)

Limita el dispositivo para que no se puedan conectar nuevos usuarios:

```bash
doublezero device update --pubkey <DEVICE_PUBKEY> --max-users 0
```

Los usuarios existentes no se ven afectados y siguen funcionando. Repite para cada dispositivo que se esté desmantelando en el sitio. Los enlaces y el dispositivo permanecen completamente activos, por lo que los usuarios conectados mantienen el servicio normal.

---

## Fase 2 — Período de aviso (14 días antes)

El equipo de DoubleZero notifica a los usuarios conectados, pidiéndoles que se reconecten a un DZD diferente antes de la fecha de desmantelamiento. Coordina con el equipo sobre quién contacta a qué usuarios.

No se drena nada durante este período, por lo que los usuarios mantienen el servicio normal. Los usuarios se reconectan a su propio ritmo. Monitorea el conteo de usuarios con:

```bash
doublezero device list
```

---

## Fase 3 — Día de desmantelamiento

Ejecuta estos pasos en orden. Cada paso desbloquea el siguiente.

> ⚠️ **Antes de la eliminación final del dispositivo:**
> Notifica a la Fundación DoubleZero antes de ejecutar el último paso. La Fundación elimina a los usuarios que no migraron a tiempo, lo cual de otro modo bloquearía la eliminación, y completa los pasos requeridos por parte de la fundación.

### 1. Drenar los enlaces

Primero drenado suave, luego drenado fuerte. Consulta [Drenado de enlaces](contribute-operations.md#link-draining) para conocer qué hace cada estado.

```bash
doublezero link update --pubkey <LINK_PUBKEY> --status soft-drained
# una vez que el tráfico se haya movido:
doublezero link update --pubkey <LINK_PUBKEY> --status hard-drained
```

Repite para cada enlace en los dispositivos que se están retirando.

### 2. Eliminar los enlaces

```bash
doublezero link delete --pubkey <LINK_PUBKEY>
```

Esto libera las interfaces que los enlaces estaban utilizando.

### 3. Eliminar las interfaces

```bash
doublezero device interface delete <DEVICE_CODE> <INTERFACE_NAME>
```

Repite para cada interfaz en el dispositivo.

### 4. Drenar el dispositivo

```bash
doublezero device update --pubkey <DEVICE_PUBKEY> --status drained
```

El drenado elimina el dispositivo del enrutamiento y cierra cualquier sesión de usuario restante. También mueve el dispositivo fuera de su estado activo para que pueda ser eliminado.

### 5. Eliminar el dispositivo

```bash
doublezero device delete --pubkey <DEVICE_PUBKEY>
```

El dispositivo solo puede eliminarse una vez que ya no esté activo, no tenga enlaces que lo referencien y no le queden interfaces, lo cual los pasos anteriores se encargan de gestionar.

---

## Cancelar o posponer

Limitar y drenar son reversibles hasta que comiences a eliminar:

```bash
doublezero device update --pubkey <DEVICE_PUBKEY> --max-users <ORIGINAL_VALUE>   # restaurar capacidad
doublezero link update --pubkey <LINK_PUBKEY> --status soft-drained             # desde hard-drained
doublezero link update --pubkey <LINK_PUBKEY> --status activated                # volver a activo
doublezero device update --pubkey <DEVICE_PUBKEY> --status activated            # revertir el drenado del dispositivo
```

Eliminar los enlaces, interfaces o el dispositivo es permanente: cierra las cuentas onchain. Solo comienza a eliminar una vez que la salida esté confirmada.