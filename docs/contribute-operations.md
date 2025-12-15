# Operations Guide

This guide covers the ongoing operational tasks for maintaining your DoubleZero Devices (DZDs), including agent upgrades and monitoring.

**Prerequisites**: Before using this guide, ensure you have:

- Completed the [Device Provisioning Guide](contribute-provisioning.md)
- Your DZD is fully operational with both Config and Telemetry agents running

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
