---
description: 通过模型上下文协议（MCP）将 DoubleZero Data 与您自己的 AI 助手配合使用 — 端点、工具及连接方式。
---

# 连接您自己的 AI

!!! info
    要在您的主机上接收 Edge 数据，请先在 [doublezero.xyz/edge/subscribe](https://doublezero.xyz/edge/subscribe) 购买数据源。然后 MCP 可以引导您完成连接。

通过[模型上下文协议（MCP）](https://modelcontextprotocol.io)将 DoubleZero Data 与您自己的 AI 助手配合使用。同一服务器的文档也可在数据应用中查看：[data.doublezero.xyz/docs/mcp](https://data.doublezero.xyz/docs/mcp)。

## 什么是 MCP？

MCP 是一种开放标准，允许 AI 代理调用外部服务上的工具。没有它，模型只能了解您粘贴到聊天中的内容。有了它，代理可以读取 DoubleZero 文档、加载入门指南，并代您查询公共网络数据。

DoubleZero 运行**一个** MCP。将任何兼容的客户端指向下方的端点即可。

## 端点

```
https://data.doublezero.xyz/api/mcp
```

无需登录。服务器使用 [Streamable HTTP](https://modelcontextprotocol.io/docs/concepts/transports#streamable-http) 传输方式。

## 可用工具

| 工具 | 描述 |
|------|-------------|
| `execute_sql` | 查询 ClickHouse 获取指标、验证者和网络数据 |
| `execute_cypher` | 查询 Neo4j 获取拓扑、路径和连接信息（仅限主网） |
| `get_schema` | 获取数据库架构（表、列、类型） |
| `read_docs` | 阅读 DoubleZero 文档 |
| `get_onboarding_runbook` | 引导式入门操作指南。省略服务参数可列出可用内容。 |
| `check_edge_access` | 检查某个身份公钥是否拥有接收 IP 的访问通行证（精确匹配或 `0.0.0.0`）。代理在入门流程中会调用此工具。 |

您无需自行调用这些工具。客户端连接后，用自然语言提问即可，例如：

- "引导我在这台 Linux 主机上连接市场数据源。"
- "什么是 DoubleZero？" / "Edge Connect 是如何工作的？"
- "有多少 Solana 验证者在使用 DoubleZero？"
- "从纽约到阿姆斯特丹的路径是什么？"
- "我的隧道显示 Network Unreachable — 查看操作指南。"

如需引导式设置，代理应调用 `get_onboarding_runbook`（而不仅仅是 `read_docs`）。对于 SQL 或 Cypher 查询，应先调用 `get_schema`。

所有工具均为只读：无法执行交易、转移资金或查看您的密钥对 / `DZ_SECRET`。

## 连接您的 AI 代理 {#connect-your-ai-agent}

在所有平台上使用 `https://data.doublezero.xyz/api/mcp`。

### Claude Desktop 和 Codex Desktop

1. 前往 **Settings**
2. 点击 **Manage Connectors**
3. 点击 **Add Custom Connector**
4. 输入上方的端点 URL

### 代码编辑器和 IDE

适用于 Claude Code、Cursor、Windsurf、Continue 及其他兼容 MCP 的工具。在项目根目录添加 `.mcp.json` 文件：

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

    然后输入 `/mcp`，选择 **doublezero**，并确认已连接。

=== "Cursor"

    1. **Settings** → **Cursor Settings** → **Tools & MCPs**。
    2. 使用端点 URL 连接，或使用上方的 `.mcp.json`。

=== "ChatGPT"

    1. 开启 **Developer Mode**。
    2. **Settings** → **Apps** → **Create app**（或添加连接器）。
    3. 粘贴 `https://data.doublezero.xyz/api/mcp`。

=== "Codex CLI"

    ```bash
    codex mcp add doublezero --url https://data.doublezero.xyz/api/mcp
    ```

    然后输入 `/mcp` 并选择 **doublezero**。

=== "Other"

    任何兼容 MCP 的客户端都可以使用该端点 URL（Streamable HTTP）。将服务器命名为 `doublezero`。

## 速率限制

工具调用的速率限制为每个 IP 每分钟 100 次请求。如果达到限制，调用将返回错误 — 请稍等片刻后重试。

## 故障排除

- 确认客户端显示 **doublezero** 为已连接状态。如果未显示，请断开连接并重新添加 URL。
- URL 必须严格为 `https://data.doublezero.xyz/api/mcp`（包含 `/api/mcp`）。
- MCP 无法 SSH 到您的机器。您仍需自行运行（或批准）本地命令。
- 如需数据源 / Edge Connect 设置，请连接 MCP 并请求入门引导。如有其他问题，请参阅[支持](support.md)。