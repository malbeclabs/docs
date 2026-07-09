# Site Decommissioning Guide for Contributors

This guide describes how to decommission a DoubleZero Device (DZD) or exit a site: how to remove your devices and links from the network without disrupting connected users, then delete them onchain.

The process runs in three stages: cap the device 31 days before decommission day, notify connected users during a notice window so they can move, then drain and delete the links, interfaces, and device on decommission day.

> ⚠️ **Coordinate with DoubleZero first:**
> Always align with the DoubleZero team before decommissioning a device or site, and schedule your decommission date and time with us. We run a few steps on our side around that slot, so we need to be scheduled in. Agree on the dates and plan before you cap a device or drain a link.

> ⚠️ **DZX switches and links:**
> If the device you are decommissioning is a DZX switch, or has any DZX links, identify the affected contributors as early as possible and give them notice, since they may need to move or rebuild their links before your date. Also create a maintenance event in the [OPS portal](contribute-ops-management.md) for the decommission date.

---

## Overview

| When | Action | Who |
|------|--------|-----|
| 31 days before | Cap the device so no new users can attach (`--max-users 0`) | Contributor |
| 14 days before | Connected users are notified to move to another device | DoubleZero team |
| Notice window | Users reconnect themselves to other DZDs | Users |
| Decommission day | Drain and delete the links, interfaces, and device | Contributor |

Principles:

- **Stop new users early, move existing users gradually.** Capping the device early means it only loses users from that point on. Existing users keep working and migrate on their own schedule.
- **Keep everything live during the notice window.** Do not drain the links or the device until decommission day, so migrating users keep normal service.
- **The teardown order is enforced by the contract.** You cannot delete a link or device while it is active, so the steps below drain first and delete last.

> ⚠️ **Short notice:**
> If you have less than 31 days before the exit, start immediately. Cap the device now and shorten the windows to fit the available time. The step order does not change.

---

## Phase 1 — Cap the device (31 days before)

Cap the device so no new users can attach:

```bash
doublezero device update --pubkey <DEVICE_PUBKEY> --max-users 0
```

Existing users are untouched and keep working. Repeat for every device being decommissioned at the site. The links and the device stay fully active, so connected users keep normal service.

---

## Phase 2 — Notice window (14 days before)

The DoubleZero team notifies the connected users, asking them to reconnect to a different DZD before the decommission date. Coordinate with the team on who reaches out to which users.

Nothing is drained during this window, so users keep normal service. Users reconnect themselves at their own pace. Monitor the user count with:

```bash
doublezero device list
```

---

## Phase 3 — Decommission day

Before you start, work out exactly what needs to be removed: the device, the links connected to it, and the interfaces to clean up. You can find all of this with:

```bash
doublezero device list | grep <CONTRIBUTOR_CODE>    # find your device: its code and pubkey
doublezero link list | grep <DEVICE_CODE>           # find the links connected to the device
doublezero device interface list <DEVICE_CODE>      # list the interfaces on the device to remove
```

Run these steps in order. Each step unlocks the next.

> ⚠️ **Before the final device deletion:**
> Notify the DoubleZero Foundation before running the last step. The Foundation removes any users who did not migrate in time, which would otherwise block the deletion, and completes any required foundation-side steps.

### 1. Drain the links

Soft-drain first, then hard-drain. See [Link Draining](contribute-operations.md#link-draining) for what each state does.

```bash
doublezero link update --pubkey <LINK_PUBKEY> --status soft-drained
# once traffic has moved off:
doublezero link update --pubkey <LINK_PUBKEY> --status hard-drained
```

Repeat for every link on the devices being removed.

### 2. Delete the links

```bash
doublezero link delete --pubkey <LINK_PUBKEY>
```

This frees the interfaces the links were using.

### 3. Delete the interfaces

```bash
doublezero device interface delete <DEVICE_CODE> <INTERFACE_NAME>
```

Repeat for each interface on the device.

### 4. Drain the device

```bash
doublezero device update --pubkey <DEVICE_PUBKEY> --status drained
```

Draining removes the device from routing and closes any remaining user sessions. It also moves the device out of its active state so it can be deleted.

### 5. Delete the device

```bash
doublezero device delete --pubkey <DEVICE_PUBKEY>
```

The device can only be deleted once it is no longer active, has no links referencing it, and has no interfaces left, which the previous steps handle.

---

## Cancelling or postponing

Capping and draining are reversible until you begin deleting:

```bash
doublezero device update --pubkey <DEVICE_PUBKEY> --max-users <ORIGINAL_VALUE>   # restore capacity
doublezero link update --pubkey <LINK_PUBKEY> --status soft-drained             # from hard-drained
doublezero link update --pubkey <LINK_PUBKEY> --status activated                # back to active
doublezero device update --pubkey <DEVICE_PUBKEY> --status activated            # un-drain the device
```

Deleting the links, interfaces, or device is permanent: it closes the onchain accounts. Only start deleting once the exit is confirmed.
