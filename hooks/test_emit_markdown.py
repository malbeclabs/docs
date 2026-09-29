"""The llms index follows the English nav, including pages added after the
original hand-maintained list."""

import unittest

from hooks.emit_markdown import nav_sections


class NavSectionsTest(unittest.TestCase):
    def test_groups_and_nested_pages_stay_in_nav_order(self):
        nav = [
            {"Welcome": "index.md"},
            {
                "Solana": [
                    {"Connect validator (IBRL)": "DZ Mainnet-beta Connection.md"},
                    {"Subscribe to shreds (CLI legacy)": "Edge Subscriber CLI.md"},
                ]
            },
            {
                "Hyperliquid": [
                    "hyperliquid/index.md",
                    {"Subscribe to Hyperliquid (Edge)": "hyperliquid/edge.md"},
                    {"Peering Access": "hyperliquid/peering.md"},
                ]
            },
            {"Support": "support.md"},
        ]

        self.assertEqual(
            nav_sections(nav),
            [
                ("Welcome", ["index.md"]),
                (
                    "Solana",
                    ["DZ Mainnet-beta Connection.md", "Edge Subscriber CLI.md"],
                ),
                (
                    "Hyperliquid",
                    [
                        "hyperliquid/index.md",
                        "hyperliquid/edge.md",
                        "hyperliquid/peering.md",
                    ],
                ),
                ("Support", ["support.md"]),
            ],
        )

    def test_a_page_left_out_of_the_nav_is_not_invented(self):
        sections = nav_sections([{"Welcome": "index.md"}])
        paths = [path for _title, pages in sections for path in pages]
        self.assertNotIn("DZ Testnet Connection.md", paths)


if __name__ == "__main__":
    unittest.main()
