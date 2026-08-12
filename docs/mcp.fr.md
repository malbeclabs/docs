---
description: Utilisez les données DoubleZero avec votre propre assistant IA via le Model Context Protocol (MCP) — endpoint, outils et comment se connecter.
---

# Connecter votre propre IA

!!! info
    Pour recevoir des données Edge sur votre hôte, achetez d'abord un flux sur [doublezero.xyz/edge/subscribe](https://doublezero.xyz/edge/subscribe). Le MCP peut ensuite vous guider pour la connexion.

Utilisez les données DoubleZero avec votre propre assistant IA via le [Model Context Protocol (MCP)](https://modelcontextprotocol.io). Le même serveur est documenté dans l'application de données sur [data.doublezero.xyz/docs/mcp](https://data.doublezero.xyz/docs/mcp).

## Qu'est-ce qu'un MCP ?

Le MCP est un standard ouvert qui permet à un agent IA d'appeler des outils sur un service externe. Sans lui, le modèle ne connaît que ce que vous collez dans le chat. Avec lui, l'agent peut lire la documentation DoubleZero, charger un guide d'intégration et interroger les données publiques du réseau en votre nom.

DoubleZero exécute **un seul** MCP. Dirigez n'importe quel client compatible vers l'endpoint ci-dessous.

## Endpoint

```
https://data.doublezero.xyz/api/mcp
```

Aucune connexion n'est requise. Le serveur utilise le transport [Streamable HTTP](https://modelcontextprotocol.io/docs/concepts/transports#streamable-http).

## Outils disponibles

| Outil | Description |
|-------|-------------|
| `execute_sql` | Interroger ClickHouse pour les métriques, les validateurs et les données réseau |
| `execute_cypher` | Interroger Neo4j pour la topologie, les chemins et la connectivité (mainnet uniquement) |
| `get_schema` | Obtenir le schéma de la base de données (tables, colonnes, types) |
| `read_docs` | Lire la documentation DoubleZero |
| `get_onboarding_runbook` | Guide d'intégration pas à pas. Omettez le service pour lister ce qui est disponible. |
| `check_edge_access` | Vérifier si une clé publique d'identité dispose d'un pass d'accès pour une IP de réception (correspondance exacte ou `0.0.0.0`). L'agent appelle cet outil pendant l'intégration. |

Vous n'appelez pas ces outils vous-même. Une fois le client connecté, posez votre question en langage naturel, par exemple :

- « Guide-moi pour connecter un flux de données de marché sur cet hôte Linux. »
- « Qu'est-ce que DoubleZero ? » / « Comment fonctionne Edge Connect ? »
- « Combien de validateurs Solana sont sur DoubleZero ? »
- « Quel est le chemin de New York à Amsterdam ? »
- « Mon tunnel affiche Network Unreachable — vérifie le guide de dépannage. »

Pour une configuration guidée, l'agent devrait appeler `get_onboarding_runbook` (pas seulement `read_docs`). Pour SQL ou Cypher, il devrait appeler `get_schema` en premier.

Chaque outil est en lecture seule : il ne peut pas passer d'ordres, déplacer des fonds, ni voir votre paire de clés / `DZ_SECRET`.

## Connecter votre agent IA {#connect-your-ai-agent}

Utilisez `https://data.doublezero.xyz/api/mcp` sur toutes les plateformes.

### Claude Desktop & Codex Desktop

1. Allez dans **Settings**
2. Cliquez sur **Manage Connectors**
3. Cliquez sur **Add Custom Connector**
4. Entrez l'URL de l'endpoint ci-dessus

### Éditeurs de code & IDE

Fonctionne avec Claude Code, Cursor, Windsurf, Continue et d'autres outils compatibles MCP. Ajoutez un fichier `.mcp.json` à la racine de votre projet :

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

    Puis tapez `/mcp`, sélectionnez **doublezero** et confirmez que la connexion est établie.

=== "Cursor"

    1. **Settings** → **Cursor Settings** → **Tools & MCPs**.
    2. Connectez-vous en utilisant l'URL de l'endpoint, ou utilisez le `.mcp.json` ci-dessus.

=== "ChatGPT"

    1. Activez le **Developer Mode**.
    2. **Settings** → **Apps** → **Create app** (ou ajoutez un connecteur).
    3. Collez `https://data.doublezero.xyz/api/mcp`.

=== "Codex CLI"

    ```bash
    codex mcp add doublezero --url https://data.doublezero.xyz/api/mcp
    ```

    Puis `/mcp` et sélectionnez **doublezero**.

=== "Autre"

    Tout client compatible MCP peut utiliser l'URL de l'endpoint (Streamable HTTP). Nommez le serveur `doublezero`.

## Limites de débit

Les appels d'outils sont limités à 100 requêtes par minute par IP. Si vous atteignez la limite, les appels renvoient une erreur — attendez un instant et réessayez.

## Dépannage

- Confirmez que le client affiche **doublezero** comme connecté. Déconnectez et ajoutez l'URL à nouveau si ce n'est pas le cas.
- L'URL doit être exactement `https://data.doublezero.xyz/api/mcp` (incluez `/api/mcp`).
- Le MCP ne peut pas se connecter en SSH à votre machine. Vous exécutez (ou approuvez) toujours les commandes locales vous-même.
- Pour la configuration d'un flux / Edge Connect, connectez le MCP et demandez un guide d'intégration. Pour d'autres problèmes, consultez [Support](support.md).