---
description: "Choose the edge-feed-spec wire format for a DoubleZero Edge feed, set the feed's spec ID, and check the feed with dz-conformance."
---

# Choose a spec

Every feed on DoubleZero Edge publishes a wire format defined in [edge-feed-spec](https://github.com/malbeclabs/edge-feed-spec){target=_blank rel=noopener}. Specs are maintained in that repository, not by individual builders, so a subscriber can decode any feed that uses a given spec with the same decoder, and every feed can be checked against the same standard.

## Supported specs

| Spec | Contents | Spec ID |
|------|----------|---------|
| [Top-of-Book & Trades](https://github.com/malbeclabs/edge-feed-spec/blob/main/top-of-book/spec.md){target=_blank rel=noopener} | Best bid and offer, and trades | `top-of-book@v3` |
| [Midpoint](https://github.com/malbeclabs/edge-feed-spec/blob/main/midpoint/spec.md){target=_blank rel=noopener} | One derived price per instrument, such as the mid or VWAP | `midpoint@v3` |
| [Market-by-Price](https://github.com/malbeclabs/edge-feed-spec/blob/main/market-by-price/spec.md){target=_blank rel=noopener} | Full-depth order book aggregated by price level | `market-by-price@v3` |
| [Market-by-Order](https://github.com/malbeclabs/edge-feed-spec/blob/main/market-by-order/spec.md){target=_blank rel=noopener} | Every resting order in the book | `market-by-order@v3` |
| [Order-Intent](https://github.com/malbeclabs/edge-feed-spec/blob/main/order-intent/spec.md){target=_blank rel=noopener} | Order, cancel, and modify submissions observed before the venue confirms them | `order-intent@v3` |
| [Perp Stats](https://github.com/malbeclabs/edge-feed-spec/blob/main/perp-stats/spec.md){target=_blank rel=noopener} | Funding and other per-perpetual values the venue publishes | `perp-stats@v3` |

Every spec also uses the [Reference Data](https://github.com/malbeclabs/edge-feed-spec/blob/main/reference-data/spec.md){target=_blank rel=noopener} supplement, which sends instrument definitions on a separate UDP port so that a subscriber who joins late can still decode the feed. Each message identifies its venue by a `Source ID` from the [Source ID Registry](https://github.com/malbeclabs/edge-feed-spec/blob/main/sources/spec.md){target=_blank rel=noopener}. If your venue is not listed, open a pull request to add it.

A feed publishes one spec. To publish two specs for the same venue, deploy two feeds, each with its own bond.

## Spec ID

The `--spec-id` flag on `doublezero feed create` takes the form `<spec>@v<major>`. The major version matches the `Schema Version` byte in every datagram header, which is the part of the version a subscriber's decoder depends on. Minor and patch releases only add fields and message types that existing decoders ignore, so the spec ID does not change when they are released. See [VERSIONING.md](https://github.com/malbeclabs/edge-feed-spec/blob/main/VERSIONING.md){target=_blank rel=noopener} for the full policy.

## Check your feed

`dz-conformance` checks a feed against its spec, either live on the multicast group or from a packet capture. It exits with `0` on a pass, `1` on a violation, and `2` on an error, so it can run in CI. It supports Top-of-Book, Midpoint, Market-by-Price, and Market-by-Order. Order-Intent and Perp Stats are not supported yet.

Check a packet capture:

```bash
./dz-conformance --feed tob --pcap capture.pcapng \
  --mktdata-port 7001 --refdata-port 7002
```

Check the live feed from a subscribing host:

```bash
./dz-conformance --feed tob --group <multicast_ip> \
  --mktdata-port 7001 --refdata-port 7002 --interface doublezero1
```

The [dz-conformance README](https://github.com/malbeclabs/edge-feed-spec/tree/main/tools/conformance){target=_blank rel=noopener} covers building the tool, every flag, and the full list of rules.

Reference designs for publishers are in [edge-multicast-ref](https://github.com/malbeclabs/edge-multicast-ref){target=_blank rel=noopener}.

## Service level

A service level is the update cadence, completeness, and availability the builder commits to, and any public feed it can be compared against.

!!! info "Planned"
    A standard format for the service level, a way to record it on the feed, and a way for subscribers to read it are planned. A feed does not need one to start publishing.
