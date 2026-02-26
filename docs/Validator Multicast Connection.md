# Validator Multicast Connection
!!! warning "By connecting to DoubleZero I agree to the [DoubleZero Terms of Service](https://doublezero.xyz/terms-protocol)"

If you are not already connected to DoubleZero please complete [Setup](setup.md), and [Mainnet-Beta](DZ%20Mainnet-beta%20Connection.md) validator connection documentation.

If you are a validator who is already connected to DoubleZero you may continue this guide.

#### Jito-Agave (version 3.1.9 or higher)

1. In your validator start script, add:
   `--shred-receiver-address 233.84.178.1:7733`
2. Connect to the DoubleZero multicast group `bebop` as a publisher:
   `doublezero connect multicast --publish bebop`
3. Restart your validator.

#### Frankendancer

1. 
In `config.toml`, add:
   ```toml
   [tiles.shred]
   additional_shred_destinations_leader = [ "233.84.178.1:7733", ]
   ```
2. Connect to the DoubleZero multicast group `bebop` as a publisher:
   `doublezero connect multicast --publish bebop`
3. Restart your validator.


!!! note inline end
    Frankendancer users in XDP driver mode cannot use tcpdump. There is currently no way to confirm you are publishing, but a solution will be available soon.

#### Confirm you are publishing

During your next leader slot, use `tcpdump` to confirm you are publishing to the multicast group. You should see a heartbeat every 10 seconds to verify you are publishing shreds.

Run: `sudo tcpdump -vv -c5 -ni doublezero1 port 7733 or port 5765`

Example output when publishing:

```
tcpdump: verbose output suppressed, use -v[v]... for full protocol decode
tcpdump: verbose output suppressed, use -v[v]... for full protocol decodetcpdump -vv -c5 -ni doublezero1 port 7733 or port 5765
tcpdump: listening on doublezero1, link-type LINUX_SLL (Linux cooked v1), snapshot length 262144 bytes
21:53:11.018243 IP (tos 0x0, ttl 32, id 47109, offset 0, flags [DF], proto UDP (17), length 32)
    148.51.120.2.38319 > 233.84.178.1.5765: [bad udp cksum 0xa7a9 -> 0x67ba!] UDP, length 4
21:53:21.018217 IP (tos 0x0, ttl 32, id 47558, offset 0, flags [DF], proto UDP (17), length 32)
    148.51.120.2.38319 > 233.84.178.1.5765: [bad udp cksum 0xa7a9 -> 0x67ba!] UDP, length 4
21:53:31.018042 IP (tos 0x0, ttl 32, id 47919, offset 0, flags [DF], proto UDP (17), length 32)
    148.51.120.2.38319 > 233.84.178.1.5765: [bad udp cksum 0xa7a9 -> 0x67ba!] UDP, length 4
21:53:32.822061 IP (tos 0x0, ttl 64, id 5721, offset 0, flags [DF], proto UDP (17), length 1231)
    148.51.120.2.57512 > 233.84.178.1.7733: [bad udp cksum 0xac58 -> 0xadfc!] UDP, length 1203
21:53:32.822110 IP (tos 0x0, ttl 64, id 5722, offset 0, flags [DF], proto UDP (17), length 1231)
    148.51.120.2.57512 > 233.84.178.1.7733: [bad udp cksum 0xac58 -> 0x9e62!] UDP, length 1203
5 packets captured
204 packets received by filter
0 packets dropped by kernel
```
