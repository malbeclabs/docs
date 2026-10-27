---
description: "Reference for the DoubleZero Edge builder API on testnet: every endpoint, its request and response, and how to sign the instructions it returns."
---

# Builder API reference

This page lists every endpoint of the DoubleZero builder API on testnet, and explains how to sign the instructions it returns. For a walkthrough that uses these endpoints, see [Publish a feed on testnet](publish-a-feed.md).

## Basics

| | |
|---|---|
| Base URL | `https://subscription-api-testnet.malbeclabs.com` |
| Authentication | None |
| Rate limit | 10 requests per 10 seconds from each IP address |
| Request and response format | JSON. Send `content-type: application/json` with a body. |
| `{builder}` in a path | Your builder key, the public key of your keypair |
| 2Z amounts | Base units. 1 2Z is 100000000. |
| Rates and bandwidth | Bits per second |

Read endpoints return public chain data, so they answer for any builder key. Write endpoints never change state. Each one returns an unsigned instruction that you sign and send yourself. The API never holds your key.

### Errors

A refused request returns an HTTP error status and a JSON body that names the problem:

```json
{"error": "bond 9Qx... holds 0 and its rate requires 100000000"}
```

| Status | Meaning |
|--------|---------|
| `404` | The path or the account it names does not exist. No body. |
| `422` | A field is missing or malformed, or the request breaks a ledger rule, such as a code already in use. |
| `429` | Rate limited. Wait for the next 10-second window. The body is not JSON. |
| `502` | The API could not read Solana or the DoubleZero ledger. Retry. |
| `503` | The request is valid but must wait, such as a bond the ledger has not mirrored yet. Retry in a minute. |

The API applies the ledger's rules before it builds an instruction, so most refusals arrive here rather than from the chain. Some checks only the chain can make, so a signed transaction can still fail.

## Signing

Every write endpoint returns the same four fields, plus the addresses of the accounts it creates or changes:

```json
{
  "program_id": "DZtnuQ839pSaDMFG5q1ad2V95G82S5EC4RrB3Ndw2Heb",
  "accounts": [
    {"pubkey": "HTt...", "is_signer": true, "is_writable": true},
    {"pubkey": "7Gm...", "is_signer": false, "is_writable": true}
  ],
  "data": "AQIDBA==",
  "signers": ["HTt..."]
}
```

| Field | Meaning |
|-------|---------|
| `program_id` | The program the instruction calls |
| `accounts` | The instruction's accounts, in order, with whether each signs and whether it is written |
| `data` | The instruction data, base64 |
| `signers` | Who must sign. Always your builder key alone. |

To complete a write:

1. Check that `signers` holds your builder key and nothing else.
2. Build an instruction from `program_id`, `accounts`, and the decoded `data`.
3. Put it in a transaction with your key as the fee payer and a recent blockhash from the right chain.
4. Sign with your key and send.

The API returns an instruction rather than a transaction because a blockhash expires in about a minute. You fetch the blockhash when you are ready to sign, and you can add instructions of your own, such as a priority fee.

| Endpoints | Send to |
|-----------|---------|
| `/bonds` and below | Solana devnet, `https://api.devnet.solana.com` |
| Everything else | DoubleZero testnet ledger, `https://doublezerolocalnet.rpcpool.com/8a4fd3f4-0977-449f-88c7-63d4b0f10f16` |

### Signing script

This script follows the steps above with `@solana/web3.js`. Install Node.js 20 or later, then:

```bash
mkdir -p ~/dz-sign && cd ~/dz-sign
npm init -y && npm install @solana/web3.js@1
```

Save the script as `~/dz-sign/sign.mjs`:

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

Pipe a write endpoint's response into it:

```bash
curl -sS -X POST $API/builders/$BUILDER/feeds/$FEED_KEY/halt \
  | node ~/dz-sign/sign.mjs $LEDGER_RPC ~/.config/doublezero/id.json
```

It prints the transaction signature. If the API refused the request, it prints the API's error and sends nothing. Any Solana SDK works the same way if you prefer another language.

## Reads

### `GET /builders/requirements`

What a bond must hold at each tier.

```json
{
  "tiers": [
    {"name": "up-to-1gbps", "max_rate_bits_per_sec": 1000000000, "required_2z_amount": 100000000},
    {"name": "up-to-5gbps", "max_rate_bits_per_sec": 5000000000, "required_2z_amount": 200000000},
    {"name": "unmetered", "max_rate_bits_per_sec": null, "required_2z_amount": 500000000}
  ]
}
```

`max_rate_bits_per_sec` is `null` for the unmetered tier. A `required_2z_amount` of 0 means the tier is not priced yet, and a bond at that tier cannot be posted.

### `GET /builders/{builder}/bonds`

Every bond the builder has created, with what each holds and needs.

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

| Field | Meaning |
|-------|---------|
| `bond_index` | The index you chose when you created the bond. Other endpoints take it to name the bond. |
| `hold_expires_at` | When the hold ends, in Unix seconds. `null` before the first post. |
| `funded` | Whether the bond holds what its committed rate requires. A bond that is not funded backs no feed. |

### `GET /builders/{builder}/feeds`

The builder's feeds and the multicast groups it created on its bonds, as the DoubleZero ledger holds them.

```json
{
  "feeds": [
    {
      "feed_key": "965...",
      "code": "acme-tob",
      "name": "Acme top of book",
      "exchange": "4kF...",
      "exchange_code": "xfra",
      "exchange_name": "Frankfurt",
      "status": "active",
      "chain": "unspecified",
      "groups": ["EAm..."],
      "builder": "HTt...",
      "bond_ref": "9Qx..."
    }
  ],
  "multicast_groups": [
    {
      "multicast_group": "EAm...",
      "code": "acme-tob-fra",
      "multicast_ip": "233.84.178.10",
      "status": "activated",
      "publishers": 1,
      "subscribers": 0,
      "owner": "HTt...",
      "bond_ref": "9Qx..."
    }
  ]
}
```

A feed's `status` is `active`, `halted`, `retiring`, or `retired`. `groups` holds multicast group addresses.

## Bonds

Bond instructions go to Solana devnet. Each response is a [signing response](#signing) plus `bond_key`, the bond's address.

### `POST /builders/{builder}/bonds`

Creates a bond. The bond holds no 2Z until you post to it. You pay the rent for the bond and its token account.

| Field | Type | Meaning |
|-------|------|---------|
| `bond_index` | integer | Any index you have not used. Indexes need not be consecutive. |
| `committed_rate_bits_per_sec` | integer | The rate the bond commits to. It sets the tier. |

```json
{"bond_index": 0, "committed_rate_bits_per_sec": 1000000000}
```

Refused when the rate is 0, its tier is not priced, or you already have a bond at that index.

### `POST /builders/{builder}/bonds/{bond_index}/post`

Moves 2Z into a bond. The first post starts the bond's hold.

| Field | Type | Meaning |
|-------|------|---------|
| `amount` | integer | 2Z, in base units |
| `token_account` | string, optional | The token account to take the 2Z from. Defaults to your associated 2Z account. |

```json
{"amount": 100000000}
```

### `POST /builders/{builder}/bonds/{bond_index}/withdraw`

Moves 2Z out of a bond. Takes the same fields as `post`, with `token_account` as the destination. After the hold ends, you can withdraw what the bond holds above its requirement. A request in the last seconds of the hold can pass the API and still be refused by the chain.

## Multicast groups

Group instructions go to the DoubleZero ledger.

### `POST /builders/{builder}/multicast-groups`

Creates a multicast group on one of your bonds. You own the group.

| Field | Type | Meaning |
|-------|------|---------|
| `code` | string | The group code, unique across the network |
| `max_bandwidth_bits_per_sec` | integer | The group's bandwidth. The bond's tier must cover it. |
| `bond_index` | integer | The bond the group is created on |

```json
{"code": "acme-tob-fra", "max_bandwidth_bits_per_sec": 1000000000, "bond_index": 0}
```

The response adds `multicast_group_key` and `bond_key`. The group's address depends on how many accounts the ledger holds, so send the transaction promptly. If the ledger refuses it because another account was created first, request it again.

Returns `503` until the protocol has copied a newly funded bond to the ledger, which takes about a minute.

### `POST /builders/{builder}/multicast-groups/{multicast_group}/publishers`

Lets a host publish to your group. If the publisher has no access pass, this creates one that you own. You also pay the publisher's connect credits.

| Field | Type | Meaning |
|-------|------|---------|
| `client_ip` | string | The publishing host's public IPv4 address |
| `user_payer` | string | The key that pays for the publisher's access pass. Usually your builder key. |

```json
{"client_ip": "203.0.113.10", "user_payer": "HTt..."}
```

The response adds `multicast_group_key`, `access_pass_key`, and `creates_access_pass`, which is `true` when this request creates the pass.

### `DELETE /builders/{builder}/multicast-groups/{multicast_group}/publishers`

Removes a publisher from your group. Takes `client_ip` and `user_payer` as query parameters:

```bash
curl -sS -X DELETE "$API/builders/$BUILDER/multicast-groups/$GROUP_KEY/publishers?client_ip=$HOST_IP&user_payer=$BUILDER"
```

## Feeds

Feed instructions go to the DoubleZero ledger.

### `POST /builders/{builder}/feeds`

Creates a feed backed by one of your bonds. The feed is `active` once the transaction lands. A bond backs one feed.

| Field | Type | Meaning |
|-------|------|---------|
| `code` | string | The feed code |
| `name` | string | The feed's display name |
| `exchange` | string | The metro's address, from `doublezero exchange list` |
| `groups` | array of strings | Multicast group addresses |
| `spec_id` | string | The wire spec, as `<spec>@<version>`. See [Choose a spec](choose-a-spec.md). |
| `committed_rate_bits_per_sec` | integer | The feed's committed rate. The bond's tier must cover it. |
| `bond_index` | integer | The bond that backs the feed |

```json
{
  "code": "acme-tob",
  "name": "Acme top of book",
  "exchange": "4kF...",
  "groups": ["EAm..."],
  "spec_id": "top-of-book@v3",
  "committed_rate_bits_per_sec": 1000000000,
  "bond_index": 0
}
```

The response adds `feed_key` and `bond_key`.

### `POST /builders/{builder}/feeds/{feed_key}/halt`

Stops a feed from admitting new subscribers. Existing subscribers stay connected. Only an `active` feed can be halted. No body.

### `POST /builders/{builder}/feeds/{feed_key}/resume`

Returns a halted feed to `active`. A feed that the DoubleZero Foundation halted can only be resumed by the DoubleZero Foundation. No body.

### `POST /builders/{builder}/feeds/{feed_key}/retire`

Starts the feed's 30-day retirement notice. The feed keeps publishing during the notice and is retired when it ends. Retiring is permanent. No body.

Each feed response adds `feed_key`.
