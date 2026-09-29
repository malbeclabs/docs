---
description: Usa i dati di DoubleZero con il tuo assistente AI tramite il Model Context Protocol (MCP) — endpoint, strumenti e come connettersi.
---

# Collega la tua AI

!!! info
    Per ricevere dati Edge sul tuo host, acquista prima un feed su [doublezero.xyz/edge/subscribe](https://doublezero.xyz/edge/subscribe). L'MCP può poi guidarti nella connessione.

Usa i dati di DoubleZero con il tuo assistente AI tramite il [Model Context Protocol (MCP)](https://modelcontextprotocol.io). Lo stesso server è documentato nella data app su [data.doublezero.xyz/docs/mcp](https://data.doublezero.xyz/docs/mcp).

## Cos'è un MCP? {#whats-an-mcp}

MCP è uno standard aperto che consente a un agente AI di chiamare strumenti su un servizio esterno. Senza di esso, il modello conosce solo ciò che incolli nella chat. Con esso, l'agente può leggere la documentazione di DoubleZero, caricare un runbook di onboarding e interrogare i dati pubblici della rete per tuo conto.

DoubleZero gestisce **un solo** MCP. Punta qualsiasi client compatibile all'endpoint indicato di seguito.

## Endpoint {#endpoint}

```
https://data.doublezero.xyz/api/mcp
```

Non è richiesto alcun login. Il server utilizza il trasporto [Streamable HTTP](https://modelcontextprotocol.io/docs/concepts/transports#streamable-http).

## Strumenti disponibili {#available-tools}

| Strumento | Descrizione |
|-----------|-------------|
| `execute_sql` | Interroga ClickHouse per metriche, validatori e dati di rete |
| `execute_cypher` | Interroga Neo4j per topologia, percorsi e connettività (solo mainnet) |
| `get_schema` | Ottieni lo schema del database (tabelle, colonne, tipi) |
| `read_docs` | Leggi la documentazione di DoubleZero |
| `get_onboarding_runbook` | Procedura guidata di onboarding. Ometti il servizio per elencare quelli disponibili. |
| `check_edge_access` | Verifica se una chiave pubblica di identità ha un pass di accesso per un IP ricevente (corrispondenza esatta o `0.0.0.0`). L'agente chiama questo strumento durante l'onboarding. |

Non devi chiamare questi strumenti direttamente. Dopo che il client è connesso, chiedi in linguaggio naturale, ad esempio:

- "Guidami nella connessione di un feed di dati di mercato su questo host Linux."
- "Cos'è DoubleZero?" / "Come funziona Edge Connect?"
- "Quanti validatori Solana sono su DoubleZero?"
- "Qual è il percorso da New York ad Amsterdam?"
- "Il mio tunnel mostra Network Unreachable — controlla il runbook."

Per una configurazione guidata, l'agente dovrebbe chiamare `get_onboarding_runbook` (non solo `read_docs`). Per SQL o Cypher, dovrebbe chiamare prima `get_schema`.

Ogni strumento è in sola lettura: non può effettuare operazioni di trading, spostare fondi o vedere la tua keypair / `DZ_SECRET`.

## Collega il tuo agente AI {#connect-your-ai-agent}

Usa `https://data.doublezero.xyz/api/mcp` su ogni piattaforma.

### Claude Desktop e Codex Desktop {#claude-desktop-codex-desktop}

1. Vai su **Settings**
2. Clicca su **Manage Connectors**
3. Clicca su **Add Custom Connector**
4. Inserisci l'URL dell'endpoint indicato sopra

### Editor di codice e IDE {#code-editors-ides}

Funziona con Claude Code, Cursor, Windsurf, Continue e altri strumenti compatibili con MCP. Aggiungi un file `.mcp.json` nella root del tuo progetto:

```json
{
  "mcpServers": {
    "doublezero": {
      "type": "http",
      "url": "https://data.doublezero.xyz/api/mcp"
    }
  }
}
```

=== "Claude Code"

    ```bash
    claude mcp add doublezero --transport http https://data.doublezero.xyz/api/mcp
    ```

    Poi digita `/mcp`, seleziona **doublezero** e conferma che è connesso.

=== "Cursor"

    1. **Settings** → **Cursor Settings** → **Tools & MCPs**.
    2. Connettiti usando l'URL dell'endpoint, oppure usa il file `.mcp.json` indicato sopra.

=== "ChatGPT"

    1. Attiva la **Developer Mode**.
    2. **Settings** → **Apps** → **Create app** (o aggiungi un connettore).
    3. Incolla `https://data.doublezero.xyz/api/mcp`.

=== "Codex CLI"

    ```bash
    codex mcp add doublezero --url https://data.doublezero.xyz/api/mcp
    ```

    Poi `/mcp` e seleziona **doublezero**.

=== "Altro"

    Qualsiasi client compatibile con MCP può utilizzare l'URL dell'endpoint (Streamable HTTP). Nomina il server `doublezero`.

## Limiti di frequenza {#rate-limits}

Le chiamate agli strumenti sono limitate a 100 richieste al minuto per IP. Se raggiungi il limite, le chiamate restituiscono un errore — attendi un momento e riprova.

## Risoluzione dei problemi {#troubleshooting}

- Verifica che il client mostri **doublezero** come connesso. Disconnetti e aggiungi nuovamente l'URL se non appare.
- L'URL deve essere esattamente `https://data.doublezero.xyz/api/mcp` (includi `/api/mcp`).
- L'MCP non può connettersi via SSH alla tua macchina. Sei tu a eseguire (o approvare) i comandi locali.
- Per la configurazione di feed / Edge Connect, collega l'MCP e chiedi una procedura guidata di onboarding. Per altri problemi, consulta [Supporto](support.md).