# Operations Guide for Contributors

This guide covers the ongoing operational tasks for maintaining your DoubleZero Devices (DZDs), including agent upgrades, device/interface updates, and link management.

**Prerequisites**: Before using this guide, ensure you have:

- Completed the [Device Provisioning Guide](contribute-provisioning.md)
- Your DZD is fully operational with both Config and Telemetry agents running

---

## Device Updates

Use `doublezero device update` to modify device settings after initial provisioning.

```bash
doublezero device update --pubkey <DEVICE_PUBKEY> [OPTIONS]
```

**Common update options:**

| Option | Description |
|--------|-------------|
| `--device-type <TYPE>` | Change operating mode: `hybrid`, `transit`, `edge` (see [Device Types](contribute-provisioning.md#device-types)) |
| `--location <LOCATION>` | Move device to a different location |
| `--metrics-publisher <PUBKEY>` | Change the metrics publisher key |

---

## Interface Updates

Use `doublezero device interface update` to modify existing interfaces. This command accepts the same options as `interface create`.

```bash
doublezero device interface update <DEVICE> <NAME> [OPTIONS]
```

For the full list of interface options including CYOA/DIA settings, see [Creating Interfaces](contribute-provisioning.md#step-6-creating-interfaces-on-a-device).

**Example - Add CYOA settings to an existing interface:**

```bash
doublezero device interface update lax-dz001 Ethernet1/2 \
  --interface-cyoa gre-over-dia \
  --interface-dia dia \
  --bandwidth 10000 \
  --cir 1000
```

### List Interfaces

```bash
doublezero device interface list              # All interfaces across all devices
doublezero device interface list <DEVICE>     # Interfaces for a specific device
```

---

## Config Agent Upgrade

When a new version of the Config Agent is released, follow these steps to upgrade.

### 1. Download the latest version

```
switch# bash
$ sudo bash
# cd /mnt/flash
# wget https://dl.cloudsmith.io/public/malbeclabs/doublezero/rpm/any-distro/any-version/x86_64/doublezero-agent_<X.Y.Z>_linux_amd64.rpm
# exit
$ exit
```

### 2. Remove the old version

First, find the filename of the old version:
```
switch# show extensions
```

Run the following commands to remove the old version. Replace `<W.X.Y>` with the old version from the output above:
```
switch# delete flash:doublezero-agent_<W.X.Y>_linux_amd64.rpm
switch# delete extension:doublezero-agent_<W.X.Y>_linux_amd64.rpm
```

### 3. Install the new version

```
switch# copy flash:doublezero-agent_<X.Y.Z>_linux_amd64.rpm extension:
switch# extension doublezero-agent_<X.Y.Z>_linux_amd64.rpm
switch# copy installed-extensions boot-extensions
```

### 4. Verify the upgrade

The Status should be "A, I, B".
```
switch# show extensions
Name                                        Version/Release    Status     Extension
------------------------------------------- ------------------ ---------- ---------
doublezero-agent_<X.Y.Z>_linux_amd64.rpm    <X.Y.Z>/1          A, I, B    1

A: available | NA: not available | I: installed | F: forced | B: install at boot
```

### Verify Config Agent Log Output

```
show agent doublezero-agent log
```

---

## Telemetry Agent Upgrade

When a new version of the Telemetry Agent is released, follow these steps to upgrade.

### 1. Download the latest version

```
switch# bash
$ sudo bash
# cd /mnt/flash
# wget https://dl.cloudsmith.io/public/malbeclabs/doublezero/rpm/any-distro/any-version/x86_64/doublezero-device-telemetry-agent_<X.Y.Z>_linux_amd64.rpm
# exit
$ exit
```

### 2. Remove the old version

First, find the filename of the old version:
```
switch# show extensions
```

Run the following commands to remove the old version. Replace `<W.X.Y>` with the old version from the output above:
```
switch# delete flash:doublezero-device-telemetry-agent_<W.X.Y>_linux_amd64.rpm
switch# delete extension:doublezero-device-telemetry-agent_<W.X.Y>_linux_amd64.rpm
```

### 3. Install the new version

```
switch# copy flash:doublezero-device-telemetry-agent_<X.Y.Z>_linux_amd64.rpm extension:
switch# extension doublezero-device-telemetry-agent_<X.Y.Z>_linux_amd64.rpm
switch# copy installed-extensions boot-extensions
```

### 4. Verify the upgrade

The Status should be "A, I, B".
```
switch# show extensions
Name                                                      Version/Release    Status     Extension
--------------------------------------------------------- ------------------ ---------- ---------
doublezero-device-telemetry-agent_<X.Y.Z>_linux_amd64.rpm    <X.Y.Z>/1          A, I, B    1

A: available | NA: not available | I: installed | F: forced | B: install at boot
```

### Verify Telemetry Agent Log Output

```
show agent doublezero-telemetry log
```

---

## Monitoring

> ⚠️ **Important:**
>
>  1. For the configuration examples below, please be mindful of whether your agents are using a management VRF.
>  2. The configuration agent and telemetry agent use the same listening port (:8080) for their metrics endpoint by default. If you are enabling metrics on both, use the `-metrics-addr` flag to set unique listening ports for each agent.

### Config Agent Metrics

The configuration agent on the DoubleZero device has the ability to expose prometheus compatible metrics by setting the `-metrics-enable` flag in the `doublezero-agent` daemon configuration. The default listening port is tcp/8080 but can be changed to suit the environment via the `-metrics-addr`:
```
daemon doublezero-agent
   exec /usr/local/bin/doublezero-agent -pubkey $PUBKEY -controller $CONTROLLER_ADDR -metrics-enable -metrics-addr 10.0.0.11:2112
   no shutdown
```

The following DoubleZero specific metrics are exposed along with go-specific runtime metrics:
```
$ curl -s 10.0.0.11:2112/metrics | grep doublezero

# HELP doublezero_agent_apply_config_errors_total Number of errors encountered while applying config to the device
# TYPE doublezero_agent_apply_config_errors_total counter
doublezero_agent_apply_config_errors_total 0

# HELP doublezero_agent_bgp_neighbors_errors_total Number of errors encountered while retrieving BGP neighbors from the device
# TYPE doublezero_agent_bgp_neighbors_errors_total counter
doublezero_agent_bgp_neighbors_errors_total 0

# HELP doublezero_agent_build_info Build information of the agent
# TYPE doublezero_agent_build_info gauge
doublezero_agent_build_info{commit="4378018f",date="2025-09-23T14:07:48Z",version="0.6.5~git20250923140746.4378018f"} 1

# HELP doublezero_agent_get_config_errors_total Number of errors encountered while getting config from the controller
# TYPE doublezero_agent_get_config_errors_total counter
doublezero_agent_get_config_errors_total 0
```

#### High Signal Errors

- `up` - This is the timeseries metric automatically generated by prometheus if the scrape instance is healthy and reachable. If it is not, either the agent is not reachable or the agent is not running.
- `doublezero_agent_apply_config_errors_total` - The configuration attemping to be applied by the agent failed. In this situation, users will not be able to onboard to the device and onchain configuration changes will not be applied until this is resolved.
- `doublezero_agent_get_config_errors_total` - This signals that the local configuration agent can't talk to the DoubleZero controller. In most cases, this can be due to an issue with management connectivity on the device. Similar to the metric above, users will not be able to onboard to the device and onchain configuration changes will not be applied until this is resolved.

### Telemetry Agent Metrics

The telemetry agent on the DoubleZero device has the ability to expose prometheus compatible metrics by setting the `-metrics-enable` flag in the `doublezero-telemetry` daemon configuration. The default listening port is tcp/8080 but can be changed to suit the environment via the `-metrics-addr`:
```
daemon doublezero-telemetry
   exec /usr/local/bin/doublezero-telemetry  --local-device-pubkey $PUBKEY --env $ENV --keypair $KEY_PAIR -metrics-enable --metrics-addr 10.0.0.11:2113
   no shutdown
```

The following DoubleZero specific metrics are exposed along with go-specific runtime metrics:
```
$ curl -s 10.0.0.11:2113/metrics | grep doublezero

# HELP doublezero_device_telemetry_agent_build_info Build information of the device telemetry agent
# TYPE doublezero_device_telemetry_agent_build_info gauge
doublezero_device_telemetry_agent_build_info{commit="4378018f",date="2025-09-23T14:07:45Z",version="0.6.5~git20250923140743.4378018f"} 1

# HELP doublezero_device_telemetry_agent_errors_total Number of errors encountered
# TYPE doublezero_device_telemetry_agent_errors_total counter
doublezero_device_telemetry_agent_errors_total{error_type="peer_discovery_program_load"} 7
doublezero_device_telemetry_agent_errors_total{error_type="submitter_failed_to_write_samples"} 8
doublezero_device_telemetry_agent_errors_total{error_type="collector_submit_samples_on_close"} 0
doublezero_device_telemetry_agent_errors_total{error_type="peer_discovery_getting_local_interfaces"} 0
doublezero_device_telemetry_agent_errors_total{error_type="peer_discovery_finding_local_tunnel"} 0
doublezero_device_telemetry_agent_errors_total{error_type="peer_discovery_link_tunnel_net_invalid"} 0
doublezero_device_telemetry_agent_errors_total{error_type="submitter_failed_to_initialize_account"} 0
doublezero_device_telemetry_agent_errors_total{error_type="submitter_retries_exhausted"} 0

# HELP doublezero_device_telemetry_agent_peer_discovery_not_found_tunnels Number of local tunnel interfaces not found during peer discovery
# TYPE doublezero_device_telemetry_agent_peer_discovery_not_found_tunnels gauge
doublezero_device_telemetry_agent_peer_discovery_not_found_tunnels{local_device_pk="8PQkip3CxWhQTdP7doCyhT2kwjSL2csRTdnRg2zbDPs1"} 0
```

#### High Signal Errors

- `up` - This is the timeseries metric automatically generated by prometheus if the scrape instance is healthy and reachable. If it is not, either the agent is not reachable or the agent is not running.
- `doublezero_device_telemetry_agent_errors_total` with an `error_type` of `submitter_failed_to_write_samples` - This is a signal the telemetry agent can't write samples onchain, which could be do to management connectivity issues on the device.

---

## Link Management

### Link Draining

Link draining allows contributors to gracefully remove a link from active service for maintenance or troubleshooting. There are two drain states:

| Status | IS-IS Behavior | Description |
|--------|----------------|-------------|
| `soft-drained` | Metric set to 1,000,000 | Link is deprioritized. Traffic will use alternate paths if available, but will still use this link if it's the only option. |
| `hard-drained` | Set to passive | Link is completely removed from routing. No traffic will traverse this link. |

### State Transitions

The following state transitions are allowed:

```
activated → soft-drained ✓
activated → hard-drained ✓
soft-drained → hard-drained ✓
hard-drained → soft-drained ✓
soft-drained → activated ✓
hard-drained → activated ✗ (must go through soft-drained first)
```

> ⚠️ **Note:**
> You cannot go directly from `hard-drained` to `activated`. You must first transition to `soft-drained`, then to `activated`.

### Soft Drain a Link

Soft draining deprioritizes a link by setting its IS-IS metric to 1,000,000. Traffic will prefer alternate paths but can still use this link if necessary.

```bash
doublezero link update --pubkey <LINK_PUBKEY> --status soft-drained
```

### Hard Drain a Link

Hard draining removes the link from routing entirely by setting IS-IS to passive mode. No traffic will traverse this link.

```bash
doublezero link update --pubkey <LINK_PUBKEY> --status hard-drained
```

### Restore a Link to Active

To return a drained link to normal operation:

```bash
# From soft-drained
doublezero link update --pubkey <LINK_PUBKEY> --status activated

# From hard-drained (must go through soft-drained first)
doublezero link update --pubkey <LINK_PUBKEY> --status soft-drained
doublezero link update --pubkey <LINK_PUBKEY> --status activated
```

### Delay Override

The delay override feature allows contributors to temporarily change a link's effective delay without modifying the actual measured delay value. This is useful for temporary demoting a link from primary to secondary path.

### Set a Delay Override

To override a link's delay (making it less preferred in routing):

```bash
doublezero link update --pubkey <LINK_PUBKEY> --delay-override-ms 100
```

Valid values are `0.01` to `1000` milliseconds.

### Clear a Delay Override

To remove the override and return to using the actual measured delay:

```bash
doublezero link update --pubkey <LINK_PUBKEY> --delay-override-ms 0
```

> ⚠️ **Note:**
> When a link is soft-drained, both `delay_ms` and `delay_override_ms` are overridden to 1000ms (1 second) to ensure deprioritization.
