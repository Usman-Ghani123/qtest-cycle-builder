# qTest Cycle Builder

A Next.js App Router application that automates the creation of qTest test cycles by reading test cases from Test Design folders and building structured test cycles in Test Execution.

## Prerequisites

- Node.js 18+
- A qTest account with API access
- A Personal Access Token (PAT) for qTest

## Setup

1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd qtest-cycle-builder
   ```

2. Create `.vscode/mcp.json` using the provided skeleton as a reference:
   ```bash
   cp mcp.example.json .vscode/mcp.json
   ```
   Then edit `.vscode/mcp.json` and replace the placeholders with your actual qTest domain and PAT token:
   ```json
   {
     "servers": {
       "qtest-mcp-server": {
         "url": "https://YOUR_DOMAIN.qtestnet.com/mcp",
         "type": "http",
         "headers": {
           "Authorization": "Bearer YOUR_PAT_TOKEN_HERE"
         }
       }
     }
   }
   ```
   > **Note:** `.vscode/mcp.json` is gitignored because it contains your personal credentials. The skeleton at `mcp.example.json` is committed as a reference only.

3. Install dependencies:
   ```bash
   npm install
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Finding Your qTest Project ID and PAT Token

**Project ID:**
- Log in to qTest Manager
- Navigate to your project
- The Project ID is visible in the URL: `https://yourcompany.qtestnet.com/p/<PROJECT_ID>/...`

**PAT Token:**
- In qTest Manager, click your avatar in the top-right corner
- Go to **Profile** → **API & SDK**
- Generate or copy your Personal Access Token

## MCP Debug

The home page at [http://localhost:3000](http://localhost:3000) displays a connection status badge showing whether the MCP server is reachable:

- 🟢 **Connected** — MCP server is configured and responding
- 🔴 **Disconnected** — MCP server is unreachable or not configured
- ⏳ **Checking...** — Connection check is in progress

If disconnected, verify your `.vscode/mcp.json` configuration and ensure your PAT token is valid.
