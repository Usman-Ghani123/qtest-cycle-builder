# qTest Cycle Builder

A web app that automates the creation of qTest test cycles — saving QA engineers from repetitive manual work in the qTest UI.

---

## What it does

qTest Cycle Builder lets you create a fully structured test cycle in seconds by filling out a simple form. No more manually browsing folders, selecting test cases one by one, or setting up suites inside qTest.

---

## Who it's for

QA engineers who manage qTest projects and need to build test cycles repeatedly — such as at the start of every sprint — and want to avoid doing it manually through the qTest UI each time.

---

## Features

### Live Project Selection
The Project dropdown is populated in real time from your connected qTest account. No need to look up or type in project IDs — just pick from the list.

### Test Case Filtering
Choose which test cases to include based on type. The available filter options are defined in `config/typeFilters.json` — edit that file to add, remove, or rename types and they will automatically appear in the UI dropdown. No code changes needed.

### Folder-Based Sourcing
Specify a Test Design folder by name. The app finds that folder in your project and pulls all matching test cases from it.

### Automated Cycle Creation
The app creates the full structure in Test Execution for you:
- Creates the test cycle under your chosen execution folder
- Creates a test suite mirroring your source folder
- Adds all matching test runs into the suite

### Real-Time Progress Log
A live progress panel updates as each step completes — so you always know what's happening and can spot issues immediately.

### Connection Status Badge
A status indicator on the home page shows whether the app is connected to your qTest account:
- **Connected** — ready to use
- **Disconnected** — credentials need attention
- **Checking...** — verifying connection on page load

---

## Configuration

Before running the app, create a `.vscode/mcp.json` file in the project root using the provided example as a reference:

```bash
cp mcp.example.json .vscode/mcp.json
```

Then fill in your qTest domain and Personal Access Token (PAT):

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

> `.vscode/mcp.json` must be gitignored — your credentials should never be committed.

---

## Running Locally

```bash
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

---
