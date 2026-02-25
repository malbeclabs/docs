# DoubleZero Validator Multicast
!!! warning "By connecting to DoubleZero I agree to the [DoubleZero Terms of Service](https://doublezero.xyz/terms-protocol)"




### Publishing shreds to bebop (validators)

After following [setup](setup.md), and the relevant [testnet](DZ%20Testnet%20Connection.md) or [mainnet-beta](DZ%20Mainnet-beta%20Connection.md) validator connection documentation you may publish shreds to the DoubleZero multicast group. Validators can publish shreds to the **bebop** multicast group. The multicast destination is `233.84.178.1:7733`. Configure your validator client as follows:

#### Jito Agave (version x.x.x or higher)

1. Connect to the DoubleZero multicast group bebop as a publisher:
   `doublezero connect multicast --publish bebop`
2. In your validator start script, add:
   `--shred-receiver-address 233.84.178.1:7733`
3. Restart your validator.

#### Frankendancer

1. Connect to the DoubleZero multicast group bebop as a publisher:
   `doublezero connect multicast --publish bebop`
2. In `config.toml`, add:
   ```toml
   [tiles.shred]
   additional_shred_destinations_leader = [ "233.84.178.1:7733", ]
   ```
3. Restart your validator.

#### Confirm you are publishing

During your next leader slot, confirm you are publishing to the multicast group, use tcpdump during your next leader slot. You should see a heartbeat every 30 seconds.

Run: `sudo tcpdump -c5 -ni doublezero1 port 7733 or port 4096 or port 5765 -vv`

Example output when publishing:

```
tcpdump: verbose output suppressed, use -v[v]... for full protocol decode
listening on doublezero1, link-type LINUX_SLL (Linux cooked v1), snapshot length 262144 bytes
23:13:37.189797 IP 147.51.126.79.8015 > 233.84.178.1.7733: UDP, length 1203
23:13:37.189816 IP 147.51.126.79.8015 > 233.84.178.1.7733: UDP, length 1203
...
5 packets captured
64 packets received by filter
0 packets dropped by kernel
```
