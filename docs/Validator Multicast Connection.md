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

## 4. Validator Rewards

For each epoch where validators publish leader shreds, they will be proportionately rewarded for their contribution based on subscriptions. The specifics of this system will be announced, and detailed at a later date.

## Troubleshooting


### Retransmiting:

1. A common cause of shred retransmission is a simple config. You may have the flag enabled to send retransmit shreds in your startup script; you will need to disable it. 

    The flag to remove in Jito-Agave is: `--shred-retransmit-receiver-address`.

1. Check the [publisher dashboard](https://data.malbeclabs.com/dz/publisher-check) and see if you have any retransmitted shreds. In the table, look at the **No Retransmit Shreds** column—a red X means you are retransmitting.

    !!! note "epoch view"
        Note that there are different time windows to view the publisher dashboard. If you see retransmit in the **2 epoch view**, but have made a recent change, try switching to the **recent slot** view.


    ![Publisher check dashboard](images/publisher-check-dashboard.png)

2. Find your client IP and look up your user in [DoubleZero Data](https://data.malbeclabs.com/dz/users).

    ![DoubleZero Data users](images/doublezero-data-users.png)

3. Click on **Multicast** to open your multicast view.

    The screenshot below shows: **Retransmitting** (undesirable) steady outbound traffic with no leader-slot pattern.

    ![User multicast view — retransmit example](images/user-multicast-view-retransmit.png)

    The screenshot below shows: **Healthy** (publishing only leader shreds) outbound traffic in spikes, known as a sawtooth pattern, which line up with your leader slots.

    ![User multicast view — healthy publisher example](images/user-multicast-view-healthy.png)

The chart shows whether you are sending only leader shreds. Traffic spikes should line up with when you have a leader slot. When you have no leader slot there should be no traffic. If you are retransmitting, you will see a steady flow of traffic instead of slot-aligned spikes.


