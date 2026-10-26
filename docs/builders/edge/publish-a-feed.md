---
description: "Deploy a bonded feed on DoubleZero Edge testnet: post a bond, create a multicast group and a feed, and connect a publisher."
---

# Publish a feed on testnet

This guide deploys a feed on DoubleZero testnet, starting from a host that is not yet connected to DoubleZero. See the [Overview](index.md) for what each component is.

The bond is posted on Solana devnet. The multicast group and the feed are created on the DoubleZero testnet ledger. Use the same keypair for both, because the ledger checks that the bond belongs to the key creating the group and the feed.

Run every command on your publishing host unless a step says otherwise.

!!! info "Testnet only"
    The bond amounts and hold period in this guide apply to testnet only. Mainnet-beta will use different values.

!!! warning "By connecting to DoubleZero I agree to the [DoubleZero Terms of Use](https://doublezero.xyz/terms-protocol)"

## CLI or API

You can run Steps 3 to 6 with the DoubleZero CLI or with the DoubleZero builder API. Each command block has a tab for each. Choosing a tab switches every block on the page. Connecting and publishing use the `doublezero` CLI either way.

The API never holds your key. A request that changes state returns an unsigned instruction:

```json
{
  "program_id": "DZtnuQ839pSaDMFG5q1ad2V95G82S5EC4RrB3Ndw2Heb",
  "accounts": [{"pubkey": "HTt...", "is_signer": true, "is_writable": true}],
  "data": "<base64>",
  "signers": ["HTt..."]
}
```

You sign the instruction with your key and send it in a transaction. Step 1 sets up a script that does both. Bond instructions go to Solana devnet, and the rest go to the DoubleZero ledger.

The API accepts 10 requests per 10 seconds from each IP address. See the [Builder API reference](api.md) for every endpoint and the signing steps in detail.

## Step 1: Install the tools and create a keypair

Follow [Setup](../../setup.md) to install the testnet `doublezero` package and configure your firewall for GRE and BGP.

=== "CLI"

    Install `doublezero-solana`, which manages the bond:

    ```bash
    sudo apt update && sudo apt install doublezero doublezero-solana
    ```

=== "API"

    Install `jq` and [Node.js](https://nodejs.org/) 20 or later, then the signing script's one dependency:

    ```bash
    sudo apt update && sudo apt install doublezero jq
    mkdir -p ~/dz-sign && cd ~/dz-sign
    npm init -y && npm install @solana/web3.js@1
    ```

    Save this script as `~/dz-sign/sign.mjs`:

    ```js
    // Signs an instruction from the DoubleZero builder API and sends it.
    // Usage: curl ... | node sign.mjs <rpc-url> <keypair-file>
    import { readFileSync } from "node:fs";
    import {
      Connection,
      Keypair,
      PublicKey,
      Transaction,
      TransactionInstruction,
      sendAndConfirmTransaction,
    } from "@solana/web3.js";

    const [rpcUrl, keypairFile] = process.argv.slice(2);
    const body = readFileSync(0, "utf8");

    let answer = {};
    try {
      answer = JSON.parse(body);
    } catch {}
    if (!answer.program_id) {
      console.error(`The API refused the request: ${body}`);
      process.exit(1);
    }

    const signer = Keypair.fromSecretKey(
      Uint8Array.from(JSON.parse(readFileSync(keypairFile, "utf8"))),
    );
    const builder = signer.publicKey.toBase58();
    if (answer.signers.length !== 1 || answer.signers[0] !== builder) {
      console.error(`The API built this for ${answer.signers}, but the keypair is ${builder}`);
      process.exit(1);
    }

    const instruction = new TransactionInstruction({
      programId: new PublicKey(answer.program_id),
      keys: answer.accounts.map((account) => ({
        pubkey: new PublicKey(account.pubkey),
        isSigner: account.is_signer,
        isWritable: account.is_writable,
      })),
      data: Buffer.from(answer.data, "base64"),
    });

    const connection = new Connection(rpcUrl, "confirmed");
    try {
      const signature = await sendAndConfirmTransaction(
        connection,
        new Transaction().add(instruction),
        [signer],
      );
      console.log(signature);
    } catch (err) {
      console.error(err.message);
      process.exit(1);
    }
    ```

    The script reads the API's response on standard input. It checks that your key is the instruction's only signer, then builds a transaction with a recent blockhash, signs it as the fee payer, sends it, and prints the transaction signature. If the API refused the request, the script prints the API's error and sends nothing.

    Any Solana SDK can do the same if you prefer another language.

Create a keypair:

```bash
doublezero keygen
```

The keypair is saved to `~/.config/doublezero/id.json`. Back it up. Whoever holds it controls your bond and your feed.

The commands below use these variables. Group and feed codes must be unique across the network, so prefix them with your organization's name.

=== "CLI"

    ```bash
    export KEY=~/.config/doublezero/id.json
    export BUILDER=$(doublezero address)
    export GROUP=acme-tob-fra        # multicast group code
    export FEED=acme-tob             # feed code
    export METRO=xfra                # metro code
    export RATE=1Gbps                # committed rate
    ```

=== "API"

    ```bash
    export KEY=~/.config/doublezero/id.json
    export BUILDER=$(doublezero address)
    export GROUP=acme-tob-fra        # multicast group code
    export FEED=acme-tob             # feed code
    export METRO=xfra                # metro code
    export RATE_BPS=1000000000       # committed rate, bits per second
    export API=https://subscription-api-testnet.malbeclabs.com
    export SOLANA_RPC=https://api.devnet.solana.com
    export LEDGER_RPC=https://doublezerolocalnet.rpcpool.com/8a4fd3f4-0977-449f-88c7-63d4b0f10f16
    ```

`doublezero exchange list` lists the metros. Choose the one closest to your upstream data. `doublezero latency` shows the latency from your host to each DoubleZero device.

## Step 2: Get devnet 2Z and SOL

The DoubleZero devnet faucet sends 10 devnet 2Z and 0.1 devnet SOL to your key. That covers a bond at any tier and the Solana transaction fees.

```bash
curl -sS -X POST https://<FAUCET_HOST>/fund \
  -H 'content-type: application/json' \
  -d "{\"pubkey\": \"$BUILDER\"}"
```

The faucet responds after the transfer confirms:

```json
{"signature": "5x...", "amount_2z": "10", "amount_sol": "0.1"}
```

The faucet makes one payout per IP address and one per key every 24 hours, with a daily limit across all requests. Other responses:

| Response | Meaning |
|----------|---------|
| `429 ip limited` | Your IP address received a payout in the last 24 hours. |
| `429 pubkey limited` | Your key received a payout in the last 24 hours. |
| `429 daily cap reached` | The faucet reached its daily limit. Retry after `retry_after_secs`. |
| `504 not confirmed` | The transfer was sent but not yet confirmed. Check the returned signature before requesting again. |

## Step 3: Post a bond

Create a bond for your committed rate, then post 2Z to it. The bond is on Solana devnet.

=== "CLI"

    Pass `-u devnet` to every `bond` command. `--amount` is in 2Z.

    ```bash
    doublezero-solana bond init -u devnet -k $KEY --committed-rate $RATE
    doublezero-solana bond post -u devnet -k $KEY --amount 1
    ```

=== "API"

    Send both transactions to Solana devnet. `amount` is in base units: 1 2Z is 100000000.

    ```bash
    curl -sS -X POST $API/builders/$BUILDER/bonds \
      -H 'content-type: application/json' \
      -d "{\"bond_index\": 0, \"committed_rate_bits_per_sec\": $RATE_BPS}" \
      | node ~/dz-sign/sign.mjs $SOLANA_RPC $KEY
    curl -sS -X POST $API/builders/$BUILDER/bonds/0/post \
      -H 'content-type: application/json' \
      -d '{"amount": 100000000}' \
      | node ~/dz-sign/sign.mjs $SOLANA_RPC $KEY
    ```

Post at least the amount your tier requires. See [Bond](index.md#bond).

Check the bond:

=== "CLI"

    ```bash
    doublezero-solana bond show -u devnet --builder $BUILDER
    ```

    ```text
    Address:      9Qx...
    Builder:      HTt...
    Bond index:   0
    Committed:    1000000000 bits/sec
    Bonded:       1
    Required:     1
    Covers:       true
    Hold expires: 2027-04-24T15:00:00+00:00
    Withdrawable: 0
    ```

=== "API"

    ```bash
    curl -sS $API/builders/$BUILDER/bonds | jq
    ```

    ```json
    [
      {
        "bond_key": "9Qx...",
        "bond_index": 0,
        "bonded_2z_amount": 100000000,
        "required_2z_amount": 100000000,
        "committed_rate_bits_per_sec": 1000000000,
        "hold_expires_at": 1808578800,
        "funded": true
      }
    ]
    ```

`Covers: true` in the CLI, or `"funded": true` in the API, means the bond holds enough for its tier. Save the bond's address:

=== "CLI"

    ```bash
    export BOND=<Address>
    ```

=== "API"

    ```bash
    export BOND=$(curl -sS $API/builders/$BUILDER/bonds | jq -r '.[] | select(.bond_index == 0) | .bond_key')
    ```

## Step 4: Create a multicast group

The protocol copies each funded bond to the DoubleZero ledger. Until the copy exists, creating a multicast group against the bond fails. The CLI reports `BondMirrorMissing` (custom program error 119), and the API answers `bond <address> has no mirror on the ledger yet`. Wait a minute and run the command again.

=== "CLI"

    ```bash
    doublezero multicast group create --code $GROUP --max-bandwidth $RATE --bond-ref $BOND --wait
    ```

=== "API"

    ```bash
    curl -sS -X POST $API/builders/$BUILDER/multicast-groups \
      -H 'content-type: application/json' \
      -d "{\"code\": \"$GROUP\", \"max_bandwidth_bits_per_sec\": $RATE_BPS, \"bond_index\": 0}" \
      | node ~/dz-sign/sign.mjs $LEDGER_RPC $KEY
    ```

    The group's address depends on how many accounts the ledger holds. If another account is created between your request and your transaction, the ledger refuses the transaction. Run the command again.

Your key owns the group. View it:

=== "CLI"

    ```bash
    doublezero multicast group get --code $GROUP
    ```

=== "API"

    ```bash
    curl -sS $API/builders/$BUILDER/feeds | jq '.multicast_groups[] | select(.code == env.GROUP)'
    export GROUP_KEY=$(curl -sS $API/builders/$BUILDER/feeds \
      | jq -r '.multicast_groups[] | select(.code == env.GROUP) | .multicast_group')
    ```

The `multicast_ip` field is the address your publisher sends to.

## Step 5: Create the feed

The feed records the multicast group, the bond, the wire spec, and the committed rate. The spec ID names the wire spec your data follows. See [Choose a spec](choose-a-spec.md).

=== "CLI"

    ```bash
    doublezero feed create \
      --code $FEED --name "Acme top of book" --exchange $METRO --group $GROUP \
      --bond-ref $BOND --spec-id top-of-book@v3 --committed-rate $RATE
    ```

=== "API"

    The API takes the metro's address, not its code.

    ```bash
    export METRO_KEY=$(doublezero exchange list | awk -v code=$METRO '$3 == code { print $1 }')
    curl -sS -X POST $API/builders/$BUILDER/feeds \
      -H 'content-type: application/json' \
      -d "$(jq -nc --arg code $FEED --arg exchange $METRO_KEY --arg group $GROUP_KEY --argjson rate $RATE_BPS \
        '{code: $code, name: "Acme top of book", exchange: $exchange, groups: [$group],
          spec_id: "top-of-book@v3", committed_rate_bits_per_sec: $rate, bond_index: 0}')" \
      | node ~/dz-sign/sign.mjs $LEDGER_RPC $KEY
    ```

The feed is created with status `Active`. Check it:

=== "CLI"

    ```bash
    doublezero feed list --code $FEED
    ```

=== "API"

    ```bash
    curl -sS $API/builders/$BUILDER/feeds | jq '.feeds[] | select(.code == env.FEED)'
    export FEED_KEY=$(curl -sS $API/builders/$BUILDER/feeds | jq -r '.feeds[] | select(.code == env.FEED) | .feed_key')
    ```

## Step 6: Grant your host publish access

Add your host's public IP address to the group's publisher allowlist:

=== "CLI"

    ```bash
    export HOST_IP=$(curl -4 -s https://ifconfig.me)
    doublezero multicast group allowlist publisher add --code $GROUP --client-ip $HOST_IP --user-payer me
    ```

=== "API"

    ```bash
    export HOST_IP=$(curl -4 -s https://ifconfig.me)
    curl -sS -X POST $API/builders/$BUILDER/multicast-groups/$GROUP_KEY/publishers \
      -H 'content-type: application/json' \
      -d "{\"client_ip\": \"$HOST_IP\", \"user_payer\": \"$BUILDER\"}" \
      | node ~/dz-sign/sign.mjs $LEDGER_RPC $KEY
    ```

## Step 7: Connect as a publisher

```bash
doublezero connect multicast --publish $GROUP
```

After about 60 seconds, check the connection:

```bash
doublezero status
```

The output should show `BGP Session Up` with a `User Type` of `Multicast`. For a publisher, `Doublezero IP` differs from `Tunnel Src`. See [Other multicast](../../reference/other-multicast.md) for example output.

## Step 8: Publish

Configure your application to send to the group's `multicast_ip` from Step 4. Each wire spec uses two UDP ports, one for market data and one for reference data. You choose the ports and publish them for your subscribers. DoubleZero routes multicast traffic through the tunnel, so no other configuration is needed on the host.

The group now shows one publisher:

=== "CLI"

    ```bash
    doublezero multicast group get --code $GROUP
    ```

=== "API"

    ```bash
    curl -sS $API/builders/$BUILDER/feeds | jq '.multicast_groups[] | select(.code == env.GROUP) | .publishers'
    ```

## Step 9: Confirm delivery

On a second host that has completed [Setup](../../setup.md), subscribe to the group and capture traffic on the tunnel interface:

```bash
doublezero connect multicast --subscribe acme-tob-fra
sudo tcpdump -ni doublezero1 udp and dst host <multicast_ip>
```

Before announcing the feed, check it against its spec with `dz-conformance`. See [Check your feed](choose-a-spec.md#check-your-feed).

## Next steps

See [Operate your feed](operate.md) to halt, resume, or retire the feed, add multicast groups, and withdraw from the bond.
