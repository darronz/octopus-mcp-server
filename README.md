# Octopus Energy MCP Server

An MCP (Model Context Protocol) server for interacting with the Octopus Energy API to retrieve electricity and gas consumption data.

## Features

- Get electricity consumption data (kWh with 0.045 kWh precision)
- Get gas consumption data (kWh for SMETS1 meters, cubic meters for SMETS2 meters)
- Support for date range filtering
- Pagination support
- Group by day, week, month, or quarter
- Order by period (ascending or descending)

## Prerequisites

- Node.js (v18 or higher recommended)
- An Octopus Energy API key
- Your meter details (MPAN/MPRN and serial number)

## Getting Your API Key and Meter Details

1. **API Key**: Log into your Octopus Energy account at <https://octopus.energy/dashboard/new/accounts/personal-details/api-access>
2. **Meter Details**: You can find your MPAN (electricity) or MPRN (gas) and meter serial numbers:
   - On your energy bill
   - In your Octopus Energy account dashboard
   - Via the Octopus Energy account API endpoint

## Installation

1. Clone or download this repository
2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file from the example:

```bash
cp .env.example .env
```

4. Edit `.env` and add your Octopus Energy credentials:

```env
OCTOPUS_API_KEY=your_api_key_here
ELECTRICITY_MPAN=1234567890123
ELECTRICITY_SERIAL_NUMBER=12A3456789
GAS_MPRN=9876543210
GAS_SERIAL_NUMBER=G4A1234567
```

5. Build the project:

```bash
npm run build
```

## Configuration

The server loads environment variables from a `.env` file in the project root. This file should contain:

- **OCTOPUS_API_KEY** (required): Your API key for authentication
- **ELECTRICITY_MPAN** (optional): Your 13-digit electricity meter point number
- **ELECTRICITY_SERIAL_NUMBER** (optional): Your electricity meter serial number
- **GAS_MPRN** (optional): Your 10-digit gas meter point reference number
- **GAS_SERIAL_NUMBER** (optional): Your gas meter serial number

If you configure the meter details in `.env`, you won't need to provide them when calling the tools. You can still override them by passing parameters to the tools if needed.

**Note**: The `.env` file is ignored by git to keep your credentials secure.

## Usage with Claude Desktop

Add this to your Claude Desktop configuration file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "octopus-energy": {
      "command": "node",
      "args": ["/absolute/path/to/octopus-mcp-server/dist/index.js"]
    }
  }
}
```

Replace `/absolute/path/to/octopus-mcp-server` with the actual path to this project directory.

**Note**: The server will automatically load your API key from the `.env` file in the project directory. Alternatively, you can override it by adding an `env` section to the config:

```json
{
  "mcpServers": {
    "octopus-energy": {
      "command": "node",
      "args": ["/absolute/path/to/octopus-mcp-server/dist/index.js"],
      "env": {
        "OCTOPUS_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

## Available Tools

### get_electricity_consumption

Retrieves electricity consumption data.

**Parameters:**

- `mpan` (string, optional): The MPAN (Meter Point Administration Number). Uses `ELECTRICITY_MPAN` from .env if not provided.
- `serial_number` (string, optional): The meter serial number. Uses `ELECTRICITY_SERIAL_NUMBER` from .env if not provided.
- `period_from` (string, optional): Start date/time in ISO 8601 format (e.g., "2024-01-01T00:00:00Z")
- `period_to` (string, optional): End date/time in ISO 8601 format (e.g., "2024-01-31T23:59:59Z")
- `page_size` (number, optional): Number of results per page (default: 100, max: 25000)
- `order_by` (string, optional): Set to "period" to return earliest records first (default: latest first)
- `group_by` (string, optional): Group results by "day", "week", "month", or "quarter"

**Example with meter details in .env:**

```json
{
  "period_from": "2024-01-01T00:00:00Z",
  "period_to": "2024-01-31T23:59:59Z",
  "group_by": "day"
}
```

**Example with explicit parameters:**

```json
{
  "mpan": "1234567890123",
  "serial_number": "12A3456789",
  "period_from": "2024-01-01T00:00:00Z",
  "period_to": "2024-01-31T23:59:59Z",
  "group_by": "day"
}
```

### get_gas_consumption

Retrieves gas consumption data.

**Parameters:**

- `mprn` (string, optional): The MPRN (Meter Point Reference Number). Uses `GAS_MPRN` from .env if not provided.
- `serial_number` (string, optional): The meter serial number. Uses `GAS_SERIAL_NUMBER` from .env if not provided.
- `period_from` (string, optional): Start date/time in ISO 8601 format (e.g., "2024-01-01T00:00:00Z")
- `period_to` (string, optional): End date/time in ISO 8601 format (e.g., "2024-01-31T23:59:59Z")
- `page_size` (number, optional): Number of results per page (default: 100, max: 25000)
- `order_by` (string, optional): Set to "period" to return earliest records first (default: latest first)
- `group_by` (string, optional): Group results by "day", "week", "month", or "quarter"

**Example with meter details in .env:**

```json
{
  "period_from": "2024-11-01T00:00:00Z",
  "period_to": "2024-11-30T23:59:59Z",
  "group_by": "week"
}
```

**Example with explicit parameters:**

```json
{
  "mprn": "9876543210",
  "serial_number": "G4A1234567",
  "period_from": "2024-11-01T00:00:00Z",
  "period_to": "2024-11-30T23:59:59Z",
  "group_by": "week"
}
```

## Response Format

Both tools return consumption data in the following format:

```json
{
  "count": 100,
  "next": "https://api.octopus.energy/v1/...",
  "previous": null,
  "results": [
    {
      "consumption": 1.234,
      "interval_start": "2024-01-01T00:00:00Z",
      "interval_end": "2024-01-01T00:30:00Z"
    }
  ]
}
```

## Development

**Build the project:**

```bash
npm run build
```

**Run in development mode:**

```bash
npm run dev
```

**Watch for changes:**

```bash
npm run watch
```

## API Documentation

For more information about the Octopus Energy API:

- [Consumption Endpoints Documentation](https://developer.octopus.energy/guides/rest/api-endpoints/#consumption-endpoints)
- [Octopus Energy Developer Portal](https://developer.octopus.energy/)

## Troubleshooting

### "OCTOPUS_API_KEY environment variable is not set"

Make sure you've set the API key in your environment or in the Claude Desktop configuration.

### Authentication errors (401)

Verify your API key is correct and active.

### Invalid MPAN/MPRN or serial number

Double-check your meter details from your Octopus Energy account or bill.

### Date format errors

Ensure dates are in ISO 8601 format with UTC indicator (Z suffix), e.g., "2024-01-01T00:00:00Z"

## License

ISC
