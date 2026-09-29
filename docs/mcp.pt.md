---
description: Use os dados da DoubleZero com seu próprio assistente de IA via Model Context Protocol (MCP) — endpoint, ferramentas e como conectar.
---

# Conecte sua própria IA

!!! info
    Para receber dados Edge no seu host, primeiro adquira um feed em [doublezero.xyz/edge/subscribe](https://doublezero.xyz/edge/subscribe). O MCP pode então guiá-lo no processo de conexão.

Use os dados da DoubleZero com seu próprio assistente de IA via [Model Context Protocol (MCP)](https://modelcontextprotocol.io). O mesmo servidor está documentado no aplicativo de dados em [data.doublezero.xyz/docs/mcp](https://data.doublezero.xyz/docs/mcp).

## O que é um MCP?

MCP é um padrão aberto que permite a um agente de IA chamar ferramentas em um serviço externo. Sem ele, o modelo só conhece o que você cola no chat. Com ele, o agente pode ler a documentação da DoubleZero, carregar um runbook de onboarding e consultar dados públicos da rede em seu nome.

A DoubleZero roda **um** MCP. Aponte qualquer cliente compatível para o endpoint abaixo.

## Endpoint

```
https://data.doublezero.xyz/api/mcp
```

Não é necessário login. O servidor usa transporte [Streamable HTTP](https://modelcontextprotocol.io/docs/concepts/transports#streamable-http).

## Ferramentas disponíveis

| Ferramenta | Descrição |
|------|-------------|
| `execute_sql` | Consulta o ClickHouse para métricas, validadores e dados de rede |
| `execute_cypher` | Consulta o Neo4j para topologia, caminhos e conectividade (apenas mainnet) |
| `get_schema` | Obtém o esquema do banco de dados (tabelas, colunas, tipos) |
| `read_docs` | Lê a documentação da DoubleZero |
| `get_onboarding_runbook` | Passo a passo guiado de onboarding. Omita o serviço para listar o que está disponível. |
| `check_edge_access` | Verifica se uma chave pública de identidade possui um passe de acesso para um IP de recebimento (correspondência exata ou `0.0.0.0`). O agente chama isso durante o onboarding. |

Você não chama essas ferramentas diretamente. Depois que o cliente estiver conectado, pergunte em linguagem natural, por exemplo:

- "Me guie na conexão de um feed de dados de mercado neste host Linux."
- "O que é a DoubleZero?" / "Como o Edge Connect funciona?"
- "Quantos validadores Solana estão na DoubleZero?"
- "Qual é o caminho de NYC até Amsterdã?"
- "Meu túnel mostra Network Unreachable — verifique o runbook."

Para uma configuração guiada, o agente deve chamar `get_onboarding_runbook` (não apenas `read_docs`). Para SQL ou Cypher, ele deve chamar `get_schema` primeiro.

Todas as ferramentas são somente leitura: não podem realizar negociações, mover fundos ou ver seu keypair / `DZ_SECRET`.

## Conecte seu agente de IA {#connect-your-ai-agent}

Use `https://data.doublezero.xyz/api/mcp` em todas as plataformas.

### Claude Desktop & Codex Desktop

1. Vá em **Settings**
2. Clique em **Manage Connectors**
3. Clique em **Add Custom Connector**
4. Insira a URL do endpoint acima

### Editores de código e IDEs

Funciona com Claude Code, Cursor, Windsurf, Continue e outras ferramentas compatíveis com MCP. Adicione um arquivo `.mcp.json` na raiz do seu projeto:

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

    Em seguida, digite `/mcp`, selecione **doublezero** e confirme que está conectado.

=== "Cursor"

    1. **Settings** → **Cursor Settings** → **Tools & MCPs**.
    2. Conecte usando a URL do endpoint ou use o `.mcp.json` acima.

=== "ChatGPT"

    1. Ative o **Developer Mode**.
    2. **Settings** → **Apps** → **Create app** (ou adicione um conector).
    3. Cole `https://data.doublezero.xyz/api/mcp`.

=== "Codex CLI"

    ```bash
    codex mcp add doublezero --url https://data.doublezero.xyz/api/mcp
    ```

    Em seguida, `/mcp` e selecione **doublezero**.

=== "Outros"

    Qualquer cliente compatível com MCP pode usar a URL do endpoint (Streamable HTTP). Nomeie o servidor como `doublezero`.

## Limites de taxa

As chamadas de ferramentas são limitadas a 100 requisições por minuto por IP. Se você atingir o limite, as chamadas retornam um erro — aguarde um momento e tente novamente.

## Solução de problemas

- Confirme que o cliente mostra **doublezero** como conectado. Desconecte e adicione a URL novamente se não mostrar.
- A URL deve ser exatamente `https://data.doublezero.xyz/api/mcp` (inclua `/api/mcp`).
- O MCP não pode fazer SSH na sua máquina. Você ainda executa (ou aprova) comandos locais.
- Para configuração de feed / Edge Connect, conecte o MCP e peça um passo a passo de onboarding. Para outros problemas, consulte [Suporte](support.md).