---
description: Model Context Protocol(MCP)을 통해 자체 AI 어시스턴트에서 DoubleZero Data를 사용하는 방법 — 엔드포인트, 도구, 연결 방법.
---

# 자체 AI 연결하기

!!! info
    호스트에서 Edge 데이터를 수신하려면 먼저 [doublezero.xyz/edge/subscribe](https://doublezero.xyz/edge/subscribe)에서 피드를 구매하세요. 이후 MCP가 연결 과정을 안내해 줍니다.

[Model Context Protocol(MCP)](https://modelcontextprotocol.io)을 통해 자체 AI 어시스턴트에서 DoubleZero Data를 사용할 수 있습니다. 동일한 서버가 데이터 앱 [data.doublezero.xyz/docs/mcp](https://data.doublezero.xyz/docs/mcp)에 문서화되어 있습니다.

## MCP란 무엇인가요? {#whats-an-mcp}

MCP는 AI 에이전트가 외부 서비스의 도구를 호출할 수 있게 해주는 개방형 표준입니다. MCP 없이는 모델이 채팅에 붙여넣은 내용만 알 수 있습니다. MCP를 사용하면 에이전트가 DoubleZero 문서를 읽고, 온보딩 런북을 로드하고, 사용자를 대신하여 공개 네트워크 데이터를 조회할 수 있습니다.

DoubleZero는 **하나의** MCP를 운영합니다. 호환되는 모든 클라이언트를 아래 엔드포인트에 연결하세요.

## 엔드포인트 {#endpoint}

```
https://data.doublezero.xyz/api/mcp
```

로그인이 필요하지 않습니다. 서버는 [Streamable HTTP](https://modelcontextprotocol.io/docs/concepts/transports#streamable-http) 전송 방식을 사용합니다.

## 사용 가능한 도구 {#available-tools}

| 도구 | 설명 |
|------|------|
| `execute_sql` | ClickHouse에서 메트릭, 검증자, 네트워크 데이터를 조회 |
| `execute_cypher` | Neo4j에서 토폴로지, 경로, 연결성을 조회 (메인넷만 해당) |
| `get_schema` | 데이터베이스 스키마(테이블, 컬럼, 타입) 조회 |
| `read_docs` | DoubleZero 문서 읽기 |
| `get_onboarding_runbook` | 가이드형 온보딩 워크스루. 서비스를 생략하면 사용 가능한 항목을 나열합니다. |
| `check_edge_access` | ID 공개키가 수신 IP에 대한 액세스 패스를 보유하고 있는지 확인 (정확한 일치 또는 `0.0.0.0`). 에이전트가 온보딩 중에 이를 호출합니다. |

이 도구들을 직접 호출할 필요는 없습니다. 클라이언트가 연결된 후 자연어로 질문하면 됩니다. 예시:

- "이 Linux 호스트에서 시장 데이터 피드를 연결하는 과정을 안내해 주세요."
- "DoubleZero가 무엇인가요?" / "Edge Connect는 어떻게 작동하나요?"
- "DoubleZero에 얼마나 많은 Solana 검증자가 있나요?"
- "뉴욕에서 암스테르담까지의 경로는 어떻게 되나요?"
- "터널에서 Network Unreachable이 표시됩니다 — 런북을 확인해 주세요."

가이드형 설정의 경우 에이전트는 `read_docs`가 아닌 `get_onboarding_runbook`을 호출해야 합니다. SQL이나 Cypher의 경우 먼저 `get_schema`를 호출해야 합니다.

모든 도구는 읽기 전용입니다: 거래를 실행하거나, 자금을 이동하거나, 키쌍 / `DZ_SECRET`을 열람할 수 없습니다.

## AI 에이전트 연결하기 {#connect-your-ai-agent}

모든 플랫폼에서 `https://data.doublezero.xyz/api/mcp`를 사용하세요.

### Claude Desktop & Codex Desktop {#claude-desktop-codex-desktop}

1. **Settings**로 이동
2. **Manage Connectors** 클릭
3. **Add Custom Connector** 클릭
4. 위의 엔드포인트 URL 입력

### 코드 편집기 & IDE {#code-editors-ides}

Claude Code, Cursor, Windsurf, Continue 및 기타 MCP 호환 도구에서 사용할 수 있습니다. 프로젝트 루트에 `.mcp.json` 파일을 추가하세요:

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

    그런 다음 `/mcp`를 입력하고 **doublezero**를 선택한 후 연결되었는지 확인합니다.

=== "Cursor"

    1. **Settings** → **Cursor Settings** → **Tools & MCPs**.
    2. 엔드포인트 URL을 사용하여 연결하거나 위의 `.mcp.json`을 사용합니다.

=== "ChatGPT"

    1. **Developer Mode**를 켭니다.
    2. **Settings** → **Apps** → **Create app** (또는 커넥터 추가).
    3. `https://data.doublezero.xyz/api/mcp`를 붙여넣습니다.

=== "Codex CLI"

    ```bash
    codex mcp add doublezero --url https://data.doublezero.xyz/api/mcp
    ```

    그런 다음 `/mcp`를 입력하고 **doublezero**를 선택합니다.

=== "Other"

    모든 MCP 호환 클라이언트에서 엔드포인트 URL(Streamable HTTP)을 사용할 수 있습니다. 서버 이름을 `doublezero`로 지정하세요.

## 속도 제한 {#rate-limits}

도구 호출은 IP당 분당 100개 요청으로 제한됩니다. 제한에 도달하면 호출 시 오류가 반환됩니다 — 잠시 기다린 후 다시 시도하세요.

## 문제 해결 {#troubleshooting}

- 클라이언트에서 **doublezero**가 연결됨으로 표시되는지 확인하세요. 표시되지 않으면 연결을 해제하고 URL을 다시 추가하세요.
- URL은 정확히 `https://data.doublezero.xyz/api/mcp`여야 합니다 (`/api/mcp` 포함).
- MCP는 사용자의 머신에 SSH 접속할 수 없습니다. 로컬 명령은 사용자가 직접 실행하거나 승인해야 합니다.
- 피드 / Edge Connect 설정의 경우 MCP를 연결하고 온보딩 워크스루를 요청하세요. 기타 문제는 [지원](support.md)을 참조하세요.