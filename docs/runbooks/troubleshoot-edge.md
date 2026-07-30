---
description: Quick checks for Edge shreds publish and subscribe failures — client version, escrow, tunnel, retransmit.
---

# Runbook — Troubleshoot Edge

**Full guides:** [Edge Subscriber](../Edge%20Subscriber%20Connection.md) · [Publish shreds](../Validator%20Multicast%20Connection.md) · [Troubleshooting](../troubleshooting.md)

---

## Subscribe (seat) path

| Symptom | Check |
|---------|--------|
| Tunnel down | `sudo systemctl status doublezerod`; `doublezero enable`; GRE/BGP/PIM/7733 firewall; `doublezero status` |
| Seat not allocated | `doublezero-solana shreds list` / `shreds price`; escrow ≥ epoch price; late-epoch pay; higher-tenure incumbents |
| No UDP on 7733 | Seat active? `tcpdump -ni doublezero1 udp port 7733`; correct `--client-ip` |
| AWS drops | Disable ENI source/destination check |
| "Multicast user already exists" | `doublezero disconnect`, then retry pay/connect |
| Client outdated | `sudo apt update && sudo apt install doublezero-solana` |

---

## Publish (validator) path

| Symptom | Check |
|---------|--------|
| Not on dashboard | Client version (Jito 3.1.9+ / Harmonic 3.1.11+ / Frankendancer); flag `233.84.178.1:7733`; leader slot yet? |
| Retransmitting | Remove `--shred-retransmit-receiver-address`; check publisher-check **No Retransmit** column |
| Multicast not joined | `doublezero connect multicast --publish edge-solana-shreds`; IBRL still up? |

Dashboards: [publisher-check](https://data.malbeclabs.com/dz/publisher-check) · [users](https://data.malbeclabs.com/dz/users)
