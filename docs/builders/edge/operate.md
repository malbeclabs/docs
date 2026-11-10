---
description: "Manage a deployed feed on DoubleZero Edge testnet: halt, resume, and retire it, add multicast groups and feeds, change tier, and withdraw from a bond."
---

# Operate your feed

This page covers managing a feed on testnet after it is deployed. The examples use the variables and, for the API, the signing script set up in [Publish a feed on testnet](publish-a-feed.md).

!!! info "Testnet only"
    The hold and notice periods on this page apply to testnet only. Mainnet-beta will use different values.

The CLI identifies a feed by its code and its metro, so the feed commands take both `--code` and `--exchange`. The API identifies it by its address, `$FEED_KEY`.

## Halt and resume

Halting a feed stops it from admitting subscribers. Subscribers already connected stay connected, but anyone who connects again is refused, including seat holders. Halt a feed during maintenance, or when your upstream data is unreliable.

=== "CLI"

    ```bash
    doublezero feed halt --code $FEED --exchange $METRO
    doublezero feed resume --code $FEED --exchange $METRO
    ```

=== "API"

    ```bash
    curl -sS -X POST $API/builders/$BUILDER/feeds/$FEED_KEY/halt | node ~/dz-sign/sign.mjs $LEDGER_RPC $KEY
    curl -sS -X POST $API/builders/$BUILDER/feeds/$FEED_KEY/resume | node ~/dz-sign/sign.mjs $LEDGER_RPC $KEY
    ```

Resuming returns the feed to `Active`. If the DoubleZero Foundation halted the feed, `doublezero feed list` shows the Foundation's key in `halted_by`, and only the Foundation can resume it. Check the current status:

=== "CLI"

    ```bash
    doublezero feed list --code $FEED
    ```

=== "API"

    ```bash
    curl -sS $API/builders/$BUILDER/feeds | jq -r '.feeds[] | select(.code == env.FEED) | .status'
    ```

## Retire

Retiring a feed is permanent. It starts a 30-day notice period so that subscribers can move to another feed. The feed keeps publishing during the notice period and is retired automatically at the end of it.

=== "CLI"

    ```bash
    doublezero feed retire --code $FEED --exchange $METRO
    ```

=== "API"

    ```bash
    curl -sS -X POST $API/builders/$BUILDER/feeds/$FEED_KEY/retire | node ~/dz-sign/sign.mjs $LEDGER_RPC $KEY
    ```

## Add a multicast group

A feed can use more than one multicast group, for example one per metro or one per set of instruments. A bond can create at most four multicast groups, including the one from Step 4. Deleting a group does not free its place. Create the new group against the same bond and grant your host publish access:

=== "CLI"

    ```bash
    doublezero multicast group create --code acme-tob-ams --max-bandwidth $RATE --bond-ref $BOND --wait
    doublezero multicast group allowlist publisher add --code acme-tob-ams --client-ip $HOST_IP --user-payer me
    ```

=== "API"

    ```bash
    curl -sS -X POST $API/builders/$BUILDER/multicast-groups \
      -H 'content-type: application/json' \
      -d "{\"code\": \"acme-tob-ams\", \"max_bandwidth_bits_per_sec\": $RATE_BPS, \"bond_index\": 0}" \
      | node ~/dz-sign/sign.mjs $LEDGER_RPC $KEY
    # If the ledger refuses this because another account was created first, run it again.
    export GROUP2_KEY=$(curl -sS $API/builders/$BUILDER/feeds \
      | jq -r '.multicast_groups[] | select(.code == "acme-tob-ams") | .multicast_group')
    curl -sS -X POST $API/builders/$BUILDER/multicast-groups/$GROUP2_KEY/publishers \
      -H 'content-type: application/json' \
      -d "{\"client_ip\": \"$HOST_IP\", \"user_payer\": \"$BUILDER\"}" \
      | node ~/dz-sign/sign.mjs $LEDGER_RPC $KEY
    ```

Then add it to the feed. You can add groups to a feed but not remove them, so `--group` must list every current group plus the new one. The API has no request for this yet, so use the CLI either way:

```bash
doublezero feed update --code $FEED --exchange $METRO --group $GROUP --group acme-tob-ams
```

Then start publishing to the new group from the connected host:

```bash
doublezero multicast publish acme-tob-ams
```

## Add a feed

A bond supports one feed. To deploy another feed, create a second bond at bond index 1 and set `BOND` to its address from `bond show --bond-index 1`. Choose new `GROUP` and `FEED` codes, then repeat Steps 4 to 6 of [Publish a feed on testnet](publish-a-feed.md) using that bond.

=== "CLI"

    ```bash
    doublezero-solana bond init -u devnet -k $KEY --committed-rate $RATE --bond-index 1
    doublezero-solana bond post -u devnet -k $KEY --amount 1 --bond-index 1
    doublezero-solana bond show -u devnet --builder $BUILDER --bond-index 1
    ```

=== "API"

    ```bash
    curl -sS -X POST $API/builders/$BUILDER/bonds \
      -H 'content-type: application/json' \
      -d "{\"bond_index\": 1, \"committed_rate_bits_per_sec\": $RATE_BPS}" \
      | node ~/dz-sign/sign.mjs $SOLANA_RPC $KEY
    curl -sS -X POST $API/builders/$BUILDER/bonds/1/post \
      -H 'content-type: application/json' \
      -d '{"amount": 100000000}' \
      | node ~/dz-sign/sign.mjs $SOLANA_RPC $KEY
    curl -sS $API/builders/$BUILDER/bonds | jq '.[] | select(.bond_index == 1)'
    ```

    In the API requests for the new group and feed, set `bond_index` to 1.

## Change tier

A bond's committed rate is set when the bond is created and cannot be changed. To move to a higher tier, create a new bond at the next bond index with the new committed rate, and deploy a new feed against it.

## Withdraw from a bond

After the hold, which is 180 days on testnet, you can withdraw any 2Z in the bond above what its tier requires.

=== "CLI"

    `bond show` reports this amount as `Withdrawable`. `--amount` is in 2Z and takes only the decimal number, such as `0.5`.

    ```bash
    doublezero-solana bond show -u devnet --builder $BUILDER
    doublezero-solana bond withdraw -u devnet -k $KEY --amount <Withdrawable>
    ```

=== "API"

    The amount is `bonded_2z_amount` minus `required_2z_amount`, in base units. The hold ends at `hold_expires_at`, in Unix seconds.

    ```bash
    curl -sS $API/builders/$BUILDER/bonds | jq '.[] | select(.bond_index == 0)'
    curl -sS -X POST $API/builders/$BUILDER/bonds/0/withdraw \
      -H 'content-type: application/json' \
      -d '{"amount": <base units>}' \
      | node ~/dz-sign/sign.mjs $SOLANA_RPC $KEY
    ```

!!! info "Planned"
    Withdrawing the required amount after a feed is retired is not supported yet.
