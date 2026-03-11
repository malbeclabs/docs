# Validator Multicast Connection
!!! warning "By connecting to DoubleZero I agree to the [DoubleZero Terms of Service](https://doublezero.xyz/terms-protocol)"

!!! note inline end "Trading firms and businesses"
    If you operate a trading firm or business looking to subscribe to the feed, more details will be shared soon. Please register interest to get more information [here](https://doublezero.xyz/edge-form).

If you are not already connected to DoubleZero please complete [Setup](https://docs.malbeclabs.com/setup/), and [Mainnet-Beta](https://docs.malbeclabs.com/DZ%20Mainnet-beta%20Connection/) validator connection documentation.

If you are a validator who is already connected to DoubleZero you may continue this guide.


### **Jito-Agave (v3.1.9+)**

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

### **Frankendancer**

1. In `config.toml`, add:

    ```toml
    [tiles.shred]
    additional_shred_destinations_leader = [ "233.84.178.1:7733", ]
    ```

2. Restart your validator.
3. Connect to the DoubleZero multicast group `bebop` as a publisher: `doublezero connect ibrl && doublezero connect multicast --publish bebop`

### Confirm you're publishing leader shreds

Once you are connected you may check [this dashboard](https://data.malbeclabs.com/dz/publisher-check) to confirm you are publishing shreds. You will not see confirmation until after you have published leader shreds for at least one slot.

### Set up an Associated Token Account (ATA) for 2Z Token

Ensure there is a DoubleZero "2Z" token ATA linked to your validator identity.

For refrence, the 2Z token mint address is: `J6pQQ3FAcJQeWPPGppWRb4nM8jU3wLyYbRrLh7feMfvd`

Run the following command, replacing `VALIDATOR_IDENTITY_PUBKEY` with your validator identity public key:

```bash
spl-token create-account J6pQQ3FAcJQeWPPGppWRb4nM8jU3wLyYbRrLh7feMfvd --owner VALIDATOR_IDENTITY_PUBKEY --fee-payer <path/to/payer.json>
```
You may replace `--fee-payer <path/to/payer.json>` with the default keypair which could be found somewhere like `~/.config/solana/id.json`. Any wallet which has Sol to pay the transaction may be placed in this argument.

This command may be run on your validator, or another machine.

### Validator Rewards

For each epoch where validators publish leader shreds, they will be proportionately rewarded for their contribution based on subscriptions. Rewards are automatically distributed to the ATA roughly 10 epochs later.
