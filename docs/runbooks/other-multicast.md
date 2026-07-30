---
description: Short runbook for publishing or subscribing to named DoubleZero multicast feeds other than Edge shreds product flows.
---

# Runbook — Other multicast

**Goal:** Publish and/or subscribe to a **named** multicast group (not the Edge shreds seat product).

**Full guide:** [Other Multicast Connection](../Other%20Multicast%20Connection.md)

For **Edge shreds publish** use [publish-edge-shreds](publish-edge-shreds.md).  
For **Edge shreds subscribe (paid seat)** use [subscribe-edge-shreds](subscribe-edge-shreds.md).

---

## Steps

1. [Install client](install-client.md) + access as required for your feed.
2. List groups: `doublezero multicast group list`
3. Connect:

```bash
doublezero connect multicast --publish <feed>
# or
doublezero connect multicast --subscribe <feed>
# or both / multiple feeds — see full guide
```

4. Verify: `doublezero status` then `doublezero user list --client-ip <YOUR_IP>`
