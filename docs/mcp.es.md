---
description: Usa DoubleZero Data con tu propio asistente de IA a través del Model Context Protocol (MCP) — endpoint, herramientas y cómo conectar.
---

# Conecta tu propia IA

!!! info
    Para recibir datos de Edge en tu host, primero compra un feed en [doublezero.xyz/edge/subscribe](https://doublezero.xyz/edge/subscribe). El MCP puede guiarte luego en el proceso de conexión.

Usa DoubleZero Data con tu propio asistente de IA a través del [Model Context Protocol (MCP)](https://modelcontextprotocol.io). El mismo servidor está documentado en la aplicación de datos en [data.doublezero.xyz/docs/mcp](https://data.doublezero.xyz/docs/mcp).

## ¿Qué es un MCP? {#whats-an-mcp}

MCP es un estándar abierto que permite a un agente de IA invocar herramientas en un servicio externo. Sin él, el modelo solo conoce lo que pegas en el chat. Con él, el agente puede leer la documentación de DoubleZero, cargar un runbook de incorporación y consultar datos públicos de la red en tu nombre.

DoubleZero ejecuta **un** MCP. Apunta cualquier cliente compatible al endpoint que aparece a continuación.

## Endpoint {#endpoint}

```
https://data.doublezero.xyz/api/mcp
```

No se requiere inicio de sesión. El servidor utiliza transporte [Streamable HTTP](https://modelcontextprotocol.io/docs/concepts/transports#streamable-http).

## Herramientas disponibles {#available-tools}

| Herramienta | Descripción |
|-------------|-------------|
| `execute_sql` | Consulta ClickHouse para métricas, validadores y datos de red |
| `execute_cypher` | Consulta Neo4j para topología, rutas y conectividad (solo mainnet) |
| `get_schema` | Obtiene el esquema de la base de datos (tablas, columnas, tipos) |
| `read_docs` | Lee la documentación de DoubleZero |
| `get_onboarding_runbook` | Guía paso a paso de incorporación. Omite el servicio para listar lo que está disponible. |
| `check_edge_access` | Verifica si una clave pública de identidad tiene un pase de acceso para una IP receptora (coincidencia exacta o `0.0.0.0`). El agente invoca esto durante la incorporación. |

No necesitas invocar estas herramientas tú mismo. Una vez que el cliente esté conectado, pregunta en lenguaje natural, por ejemplo:

- "Guíame para conectar un feed de datos de mercado en este host Linux."
- "¿Qué es DoubleZero?" / "¿Cómo funciona Edge Connect?"
- "¿Cuántos validadores de Solana están en DoubleZero?"
- "¿Cuál es la ruta de NYC a Ámsterdam?"
- "Mi túnel muestra Network Unreachable — revisa el runbook."

Para una configuración guiada, el agente debe invocar `get_onboarding_runbook` (no solo `read_docs`). Para SQL o Cypher, debe invocar `get_schema` primero.

Todas las herramientas son de solo lectura: no pueden realizar operaciones de trading, mover fondos ni ver tu keypair / `DZ_SECRET`.

## Conecta tu agente de IA {#connect-your-ai-agent}

Usa `https://data.doublezero.xyz/api/mcp` en todas las plataformas.

### Claude Desktop y Codex Desktop {#claude-desktop-codex-desktop}

1. Ve a **Settings**
2. Haz clic en **Manage Connectors**
3. Haz clic en **Add Custom Connector**
4. Ingresa la URL del endpoint indicada arriba

### Editores de código e IDEs {#code-editors-ides}

Funciona con Claude Code, Cursor, Windsurf, Continue y otras herramientas compatibles con MCP. Añade un archivo `.mcp.json` en la raíz de tu proyecto:

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

    Luego escribe `/mcp`, selecciona **doublezero** y confirma que está conectado.

=== "Cursor"

    1. **Settings** → **Cursor Settings** → **Tools & MCPs**.
    2. Conéctate usando la URL del endpoint, o usa el `.mcp.json` indicado arriba.

=== "ChatGPT"

    1. Activa **Developer Mode**.
    2. **Settings** → **Apps** → **Create app** (o añade un conector).
    3. Pega `https://data.doublezero.xyz/api/mcp`.

=== "Codex CLI"

    ```bash
    codex mcp add doublezero --url https://data.doublezero.xyz/api/mcp
    ```

    Luego `/mcp` y selecciona **doublezero**.

=== "Otros"

    Cualquier cliente compatible con MCP puede usar la URL del endpoint (Streamable HTTP). Nombra el servidor `doublezero`.

## Límites de tasa {#rate-limits}

Las invocaciones de herramientas están limitadas a 100 solicitudes por minuto por IP. Si alcanzas el límite, las llamadas devuelven un error — espera un momento y reintenta.

## Solución de problemas {#troubleshooting}

- Confirma que el cliente muestra **doublezero** como conectado. Desconéctalo y añade la URL nuevamente si no aparece.
- La URL debe ser exactamente `https://data.doublezero.xyz/api/mcp` (incluye `/api/mcp`).
- El MCP no puede hacer SSH a tu máquina. Tú sigues ejecutando (o aprobando) los comandos locales.
- Para la configuración de feed / Edge Connect, conecta el MCP y solicita una guía de incorporación. Para otros problemas, consulta [Soporte](support.md).