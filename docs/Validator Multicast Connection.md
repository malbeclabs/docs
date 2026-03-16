# Validator Multicast Connection
!!! warning "By connecting to DoubleZero I agree to the [DoubleZero Terms of Service](https://doublezero.xyz/terms-protocol)"

!!! note inline end "Trading firms and businesses"
    If you operate a trading firm or business looking to subscribe to the feed, more details will be shared soon. Please register interest to get more information [here](https://doublezero.xyz/edge-form).

If you are not already connected to DoubleZero please complete [Setup](https://docs.malbeclabs.com/setup/), and [Mainnet-Beta](https://docs.malbeclabs.com/DZ%20Mainnet-beta%20Connection/) validator connection documentation.

If you are a validator who is already connected to DoubleZero you may continue this guide.

## 1. Client Configuration

### Jito-Agave (v3.1.9+)

1. In your validator start script, add: `--shred-receiver-address 233.84.178.1:7733`

    You are able to send to Jito and the `bebop` group at the same time.

    example:

    ```json
    #!/bin/bash
    export PATH="/home/sol/.local/share/solana/install/releases/v3.1.9-jito/bin:$PATH"
    BLOCK_ENGINE_URL=https://ny.mainnet.block-engine.jito.wtf
    RELAYER_URL=http://ny.mainnet.relayer.jito.wtf:8100
    SHRED_RECEIVER_ADDR=<JitoBlockEngineAddress>
    <...The rest of your config...>
    --shred-receiver-address 233.84.178.1:7733
    ```

2. Restart your validator.
3. Connect to the DoubleZero multicast group `bebop` as a publisher: `doublezero connect ibrl && doublezero connect multicast --publish bebop`

### Frankendancer

1. In `config.toml`, add:

    ```toml
    [tiles.shred]
    additional_shred_destinations_leader = [ "233.84.178.1:7733", ]
    ```

2. Restart your validator.
3. Connect to the DoubleZero multicast group `bebop` as a publisher: `doublezero connect ibrl && doublezero connect multicast --publish bebop`

## 2. Confirm you're publishing leader shreds

Once you are connected you may check [this dashboard](https://data.malbeclabs.com/dz/publisher-check) to confirm you are publishing shreds. You will not see confirmation until after you have published leader shreds for at least one slot.

## 3. Set up an Associated Token Account (ATA) for 2Z Token

Ensure there is a DoubleZero "2Z" token ATA linked to your validator identity.

For refrence, the 2Z token mint address is: `J6pQQ3FAcJQeWPPGppWRb4nM8jU3wLyYbRrLh7feMfvd`

First, intall SPL with `cargo install spl-token-cli`

Run the following command, replacing `VALIDATOR_IDENTITY_PUBKEY` with your validator identity public key:

```bash
spl-token create-account J6pQQ3FAcJQeWPPGppWRb4nM8jU3wLyYbRrLh7feMfvd --owner VALIDATOR_IDENTITY_PUBKEY --fee-payer <path/to/payer.json>
```
You may replace `--fee-payer <path/to/payer.json>` with the default keypair which could be found somewhere like `~/.config/solana/id.json`. Any wallet which has Sol to pay the transaction may be placed in this argument.

This command may be run on your validator, or another machine.

## 4. Validator Rewards

For each epoch where validators publish leader shreds, they will be proportionately rewarded for their contribution based on subscriptions. Rewards are automatically distributed to the ATA roughly 10 epochs later.

## 5. Retransmit troubleshooting

1. A common cause of shred retramsission is a simple config. You may have the flag enabled to send retransmit shreds in your startup script; you will need to disable it. 

    The flag to remove is: `--shred-retransmit-receiver-address`.

1. Check the [publisher dashboard](https://data.malbeclabs.com/dz/publisher-check) and see if you have any retransmitted shreds. In the table, look at the **No Retransmit Shreds** column—a red X means you are retransmitting.

    ![Publisher check dashboard](images/publisher-check-dashboard.png)

2. Find your client IP and look up your user in [DoubleZero Data](https://data.malbeclabs.com/dz/users).

    ![DoubleZero Data users](images/doublezero-data-users.png)

3. Click on **Multicast** to open your multicast view.

    **Retransmitting** (undesirable): steady outbound traffic with no leader-slot pattern.

    ![User multicast view — retransmit example](images/user-multicast-view-retransmit.png)

    **Healthy** (publishing only leader shreds): outbound traffic in spikes that line up with your leader slots.

    ![User multicast view — healthy publisher example](images/user-multicast-view-healthy.png)

The chart shows whether you are sending only leader shreds. Traffic spikes should line up with when you have a leader slot. When you have no leader slot there should be no traffic. If you are retransmitting, you will see a steady flow of traffic instead of slot-aligned spikes.

!!! note "Current epoch view"
    In the **current epoch** view, the publisher dashboard shows retransmit status for the full epoch. If you fix your retransmit issue during the current epoch, the dashboard will not change from the red X until the following epoch. In the **2-epoch** view, you must not have retransmitted for two full epochs for the status to clear.
