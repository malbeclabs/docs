# OPS Management

The DoubleZero OPS Management portal is where contributors log and track incidents (unplanned outages) and maintenance (planned work) across the network. All tickets are visible to all contributors.

**Portal:** [https://doublezero.xyz/ops-management](https://doublezero.xyz/ops-management)

## Portal vs Slack

The OPS Management portal and Slack work together. All incidents and maintenance are tracked as tickets, accessible via the portal or the API. Each ticket notifies the right Slack channels automatically and gives every contributor a shared view of what is happening on the network. Slack is where the conversation happens: sharing logs, coordinating with other contributors, and collaborating on active issues.

Tickets are the canonical record, whether created via the portal or the API. Slack threads are not: they don't update ticket status and aren't stored permanently. Always keep the ticket status current, even if the conversation is happening in Slack.

The portal and Slack serve different purposes. Use both, but for the right things.

| Use the portal (or API) for... | Use Slack for... |
|-------------------------------|-----------------|
| Opening, updating, and closing tickets | Conversation and collaboration on an active issue |
| Recording status transitions | Sharing logs, screenshots, or starting a call |
| Assigning or escalating a ticket | Getting eyes on a problem quickly |
| Setting root cause on close | Coordinating with other contributors |



---

## Onboarding

Complete these steps once before using the portal.

### 1. Set Your Ops Manager Key

Register a Solana wallet pubkey as your Ops Manager key. Supported wallets: Phantom, Solflare, Coinbase Wallet.

```bash
doublezero contributor update \
  --ops-manager <OPS_MANAGER_PUBKEY> \
  --pubkey <CONTRIBUTOR_PUBKEY>
```

### 2. Connect Your Wallet on the Portal

1. Navigate to [https://doublezero.xyz/ops-management](https://doublezero.xyz/ops-management).
2. Click **Connect Your Wallet** and select your wallet.
3. Sign the message to prove ownership of your Ops Manager key.

Once authenticated, the **Incident Tracking Table** shows.

### 3. Create API Keys (Optional)

For programmatic access instead of the web form:

1. Click **Manage API Keys** on the portal.
2. Create one or more API keys.
3. Download the API documentation from this page.

---

## Incidents

An incident is an unplanned service-impacting event.

### Severity Levels

Assign severity based on the impact to the DoubleZero network. You can update severity as the situation evolves.

| Severity | Impact | Response |
|----------|--------|----------|
| `sev1` | Full outage or major control/data plane breakage with no fallback | Drop everything immediately, even outside working hours. Escalate to DoubleZero Foundation immediately. |
| `sev2` | Partial but substantial impact; degraded service with possible fallback | Treat as urgent. Coordinate actively. Overnight response required for sustained degradation. |
| `sev3` | Limited or no user-visible impact; potential to escalate if unresolved | Top priority during working hours. Monitor closely. No after-hours escalation required unless impact increases. |

??? note "Severity examples"

    **Sev1 examples**

    - More than 10% of user traffic blackholed on DoubleZero, no fallback to public internet
    - More than 80% of user onboarding, connect, or disconnect attempts failing
    - More than 20% of DZDs reporting interface errors
    - Controller returning valid but incorrect configs to DZD agents

    **Sev2 examples**

    - More than 20% of users unable to send/receive traffic over DoubleZero tunnels, but failing back to public internet
    - 0–10% of user traffic blackholed on DoubleZero without fallback
    - 20–80% of new user onboarding, connect, or disconnect attempts failing
    - More than 20% of config agents failing to apply DZD config
    - 0–20% of DZDs reporting interface errors
    - Upstream issues causing observability loss (monitoring/alerting down)
    - Onchain data pipeline down or producing incorrect data
    - More than 20% of internet latency collection or submission failing
    - Controller inaccessible by DZD agents
    - Controller returning invalid configs to DZDs that will not be applied

    **Sev3 examples**

    - 0–20% of users unable to send/receive traffic over DoubleZero tunnels, with fallback to public internet
    - 0–20% of DZDs reporting interface errors
    - 0–20% of DZDs experiencing config agent failures
    - 0–20% of user onboarding, connect, or disconnect attempts failing
    - More than 20% of internet latency collection or submission failing for a single data provider
    - 0–20% of internet latency collection or submission failing for all data providers
    - Bugs or tech debt causing alerting noise that cannot be silenced
    - DIA down or ledger RPC networking issues for 0–20% of devices for several hours
    - Low-impact issues such as minor bugs, cosmetic errors, or isolated incidents not affecting customer traffic
    - Small fraction of devices intermittently reporting errors without service disruption

### Opening an Incident

Click **Create New Record**, select Type = **Incident** on the portal, or submit via the API.

**Required:**

| Field | Description |
|-------|-------------|
| `title` | Short summary (max 100 characters) |
| `description` | Detailed explanation (max 500 characters) |
| `severity` | `sev1`, `sev2`, or `sev3` |
| `status` | Cannot be set to a terminal state (`resolved`, `closed`) on create |
| Device and/or Link | At least one required. On the web form, select from a dropdown of your device and link codes. When using the API, pass the corresponding pubkeys as `device_pubkey` and/or `affected_link_pubkey`. |

**Optional:**

| Field | Description |
|-------|-------------|
| `reporter_name` / `reporter_email` | Your contact details |
| `assignee` | Who is responsible for resolution |
| `internal_reference` | Your internal ticket ID (e.g. Jira, ServiceNow) |
| `start_at` | Defaults to creation time; editable |

Once created, a notification is posted to the contributor incidents Slack channel with the ticket ID, severity, affected devices/links, and contributor name.

### Updating an Incident

As the incident progresses, keep the ticket status current. This is the signal other contributors and DZ use to understand what's being worked on.

| Status | When to set it |
|--------|----------------|
| `open` | Initial state: issue reported, not yet being worked |
| `acknowledged` | You've seen it and taken ownership |
| `investigating` | Actively diagnosing: gathering logs, checking metrics |
| `mitigating` | Root cause known or suspected; applying a fix or workaround |
| `monitoring` | Fix applied; watching to confirm it holds |
| `resolved` | Issue confirmed fixed; **root cause required** |
| `closed` | Fully complete; no further action; **root cause required** |

```
open → acknowledged → investigating → mitigating → monitoring → resolved → closed
```

You can skip statuses if appropriate. For example, jump straight from `open` to `investigating` if you immediately start working it. Always use the most accurate status for the current state.

Each status update posts a reply in the original Slack notification thread.

### Closing an Incident

To move an incident to `resolved` or `closed`, a **root cause** must be set. You can set root cause at any earlier stage if you already know it; it becomes mandatory at close.

| Code | Description |
|------|-------------|
| `hardware` | Hardware repair, replacement, or upgrade (SFP, NIC, cable, device) |
| `software` | Software or firmware fix, update, or restart |
| `configuration` | Configuration change, fix, or rollback |
| `capacity` | Congestion, capacity limits, or traffic management |
| `carrier` | Circuit, wavelength, or cross-connect provider issue |
| `network_external` | External network issue outside contributor control |
| `facility` | Datacenter infrastructure issue (power, cooling) |
| `fiber_cut` | Physical fiber damage repaired |
| `security` | Security incident mitigated |
| `human_error` | Operational mistake corrected |
| `false_positive` | No actual issue found after investigation |
| `duplicate` | Already tracked in another ticket |
| `self_resolved` | Issue resolved without intervention |
| `dz_managed` | Issue with a DoubleZero-managed software component (activator, controller, etc.) |

---

## Maintenance

A maintenance record is a planned, time-bounded activity that may affect availability. Create it in advance so other contributors can see and avoid conflicting windows.

### Scheduling Maintenance

Click **Create New Record** > **Maintenance** on the portal, or submit via the API.

**Required:**

| Field | Description |
|-------|-------------|
| `title` | Short summary (max 100 characters) |
| `description` | Detailed explanation (max 500 characters) |
| `start_at` | Planned start time (UTC) |
| `end_at` | Planned end time (UTC); must be after `start_at` |
| Device and/or Link | At least one required. On the web form, select from a dropdown of your device and link codes. When using the API, pass the corresponding pubkeys as `device_pubkey` and/or `affected_link_pubkey`. |

Once created, a notification is posted to the contributor maintenance Slack channel with the ticket ID, affected devices/links, planned window, and contributor name.

### Managing Maintenance Status

Keep the status current as the window progresses.

| Status | When to set it |
|--------|----------------|
| `planned` | Scheduled, not yet started |
| `in-progress` | Work has begun |
| `completed` | Work finished successfully |
| `closed` | Auto-set 24 hours after `end_at` |
| `cancelled` | Called off before or during execution |

```
planned → in-progress → completed → closed (auto 24h after end_at)
    ↓          ↓
    └──────────┴──→ cancelled
```

---

## Permissions and Escalation

### What Contributors Can Do

- Create and manage tickets for their own devices and links only.
- Assign tickets to themselves or escalate to DZ/Malbeclabs.
- View all tickets across all contributors.

### What DZ/Malbeclabs Admins Can Do

- Create tickets for any contributor's devices and links.
- Assign or reassign tickets between contributors.
- Handle escalations and support requests.

### DZX Link Ownership

DZX links connect devices from two different contributors. The **A-side** contributor (first device in the link name) owns the link and is the only one who can create tickets for it.

**Example:** For link `deviceA:deviceB`, the contributor who owns `deviceA` owns the link.

**If the issue is on the Z-side:**

1. A-side contributor creates a ticket for the DZX link.
2. Assign the ticket to DZ/Malbeclabs.
3. DZ/Malbeclabs investigates and reassigns to the Z-side contributor if needed.

We recognise this workflow is limited. Z-side contributors currently cannot create tickets for DZX links they don't own, which means coordination has to go through DZ/Malbeclabs. We are working to improve this so that both sides of a DZX link can declare incidents and maintenance independently.
