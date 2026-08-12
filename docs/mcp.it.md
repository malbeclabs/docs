---
description: Usa DoubleZero Data con il tuo assistente AI tramite il Model Context Protocol (MCP) — endpoint, strumenti e come connettersi.
---

# Connetti la tua AI

!!! info
    Per ricevere i dati Edge sul tuo host, acquista prima un feed su [doublezero.xyz/edge/subscribe](https://doublezero.xyz/edge/subscribe). L'MCP può quindi guidarti nella connessione.

Usa DoubleZero Data con il tuo assistente AI tramite il [Model Context Protocol (MCP)](https://modelcontextprotocol.io). Lo stesso server è documentato nella data app su [data.doublezero.xyz/docs/mcp](https://data.doublezero.xyz/docs/mcp).

## Cos'è un MCP?

MCP è uno standard aperto che consente a un agente AI di chiamare strumenti su un servizio esterno. Senza di esso, il modello conosce solo ciò che incolli nella chat. Con esso, l'agente può leggere la documentazione di DoubleZero, caricare un runbook di onboarding e interrogare i dati pubblici della rete per tuo conto.

DoubleZero esegue **un solo** MCP. Punta qualsiasi client compatibile all'endpoint indicato di seguito.

## Endpoint

```
https://data.doublezero.xyz/api/mcp
```

Non è richiesto alcun login. Il server utilizza il trasporto [Streamable HTTP](https://modelcontextprotocol.io/docs/concepts/transports#streamable-http).

## Strumenti disponibili

| Strumento | Descrizione |
|-----------|-------------|
| `execute_sql` | Interroga ClickHouse per metriche, validatori e dati di rete |
| `execute_cypher` | Interroga Neo4j per topologia, percorsi e connettività (solo mainnet) |
| `get_schema` | Ottieni lo schema del database (tabelle, colonne, tipi) |
| `read_docs` | Leggi la documentazione di DoubleZero |
| `get_onboarding_runbook` | Procedura guidata di onboarding. Ometti il servizio per elencare quelli disponibili. |
| `check_edge_access` | Verifica se una chiave pubblica di identità ha un pass di accesso per un IP di ricezione (corrispondenza esatta o `0.0.0.0`). L'agente lo chiama durante l'onboarding. |

Non devi chiamare questi strumenti direttamente. Una volta connesso il client, chiedi in linguaggio naturale, ad esempio:

- "Guidami nella connessione di un feed di dati di mercato su questo host Linux."
- "Cos'è DoubleZero?" / "Come funziona Edge Connect?"
- "Quanti validatori Solana sono su DoubleZero?"
- "Qual è il percorso da NYC ad Amsterdam?"
- "Il mio tunnel mostra Network Unreachable — controlla il runbook."

Per una configurazione guidata, l'agente dovrebbe chiamare `get_onboarding_runbook` (non solo `read_docs`). Per SQL o Cypher, dovrebbe chiamare prima `get_schema`.

Ogni strumento è in sola lettura: non può effettuare operazioni di trading, spostare fondi o vedere la tua keypair / `DZ_SECRET`.

## Connetti il tuo agente AI {#connect-your-ai-agent}

Usa `https://data.doublezero.xyz/api/mcp` su ogni piattaforma.

### Claude Desktop & Codex Desktop

1. Vai su **Impostazioni**
2. Clicca su **Gestisci connettori**
3. Clicca su **Aggiungi connettore personalizzato**
4. Inserisci l'URL dell'endpoint indicato sopra

### Editor di codice e IDE

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

    Quindi digita `/mcp`, seleziona **doublezero** e conferma che è connesso.

=== "Cursor"

    1. **Settings** → **Cursor Settings** → **Tools & MCPs**.
    2. Connettiti usando l'URL dell'endpoint, oppure usa il `.mcp.json` indicato sopra.

=== "ChatGPT"

    1. Attiva la **Modalità sviluppatore**.
    2. **Settings** → **Apps** → **Create app** (o aggiungi un connettore).
    3. Incolla `https://data.doublezero.xyz/api/mcp`.

=== "Codex CLI"

    ```bash
    codex mcp add doublezero --url https://data.doublezero.xyz/api/mcp
    ```

    Quindi `/mcp` e seleziona **doublezero**.

=== "Altro"

    Qualsiasi client compatibile con MCP può utilizzare l'URL dell'endpoint (Streamable HTTP). Nomina il server `doublezero`.

## Limiti di frequenza

Le chiamate agli strumenti sono limitate a 100 richieste al minuto per IP. Se raggiungi il limite, le chiamate restituiscono un errore — attendi un momento e riprova.

## Risoluzione dei problemi

- Verifica che il client mostri **doublezero** come connesso. Disconnetti e aggiungi nuovamente l'URL se non lo mostra.
- L'URL deve essere esattamente `https://data.doublezero.xyz/api/mcp` (includi `/api/mcp`).
- L'MCP non può connettersi via SSH alla tua macchina. Sei tu a eseguire (o approvare) i comandi locali.
- Per la configurazione di feed / Edge Connect, connetti l'MCP e chiedi una procedura guidata di onboarding. Per altri problemi, consulta [Supporto](support.md).