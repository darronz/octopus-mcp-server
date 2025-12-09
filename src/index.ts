#!/usr/bin/env node

import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { readFileSync } from "fs";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";

// Load .env from the project root directory (silently)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, "..");
const envPath = join(projectRoot, ".env");

// Read and parse .env file manually to avoid dotenv's verbose output
try {
  const envFile = readFileSync(envPath, "utf-8");
  const envVars = envFile.split("\n").filter(line => line.trim() && !line.startsWith("#"));
  envVars.forEach(line => {
    const [key, ...valueParts] = line.split("=");
    const value = valueParts.join("=").trim();
    if (key && !process.env[key]) {
      process.env[key] = value;
    }
  });
} catch (error) {
  // .env file doesn't exist or can't be read - this is okay
}

// Octopus Energy API configuration
const OCTOPUS_API_BASE = "https://api.octopus.energy/v1";

interface OctopusConfig {
  apiKey: string;
  electricityMpan?: string;
  electricitySerialNumber?: string;
  gasMprn?: string;
  gasSerialNumber?: string;
}

interface ConsumptionParams {
  mpan?: string;
  mprn?: string;
  serialNumber?: string;
  periodFrom?: string;
  periodTo?: string;
  pageSize?: number;
  orderBy?: string;
  groupBy?: "day" | "week" | "month" | "quarter";
}

interface ConsumptionResult {
  consumption: number;
  interval_start: string;
  interval_end: string;
}

interface ConsumptionResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: ConsumptionResult[];
}

// Server implementation
class OctopusEnergyServer {
  private server: Server;
  private config: OctopusConfig;

  constructor() {
    this.config = {
      apiKey: process.env.OCTOPUS_API_KEY || "",
      electricityMpan: process.env.ELECTRICITY_MPAN,
      electricitySerialNumber: process.env.ELECTRICITY_SERIAL_NUMBER,
      gasMprn: process.env.GAS_MPRN,
      gasSerialNumber: process.env.GAS_SERIAL_NUMBER,
    };

    this.server = new Server(
      {
        name: "octopus-energy-server",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
  }

  private async fetchConsumption(
    type: "electricity" | "gas",
    params: ConsumptionParams
  ): Promise<ConsumptionResponse> {
    if (!this.config.apiKey) {
      throw new Error("OCTOPUS_API_KEY environment variable is not set");
    }

    // Use provided values or fall back to config
    const identifier = type === "electricity"
      ? (params.mpan || this.config.electricityMpan)
      : (params.mprn || this.config.gasMprn);

    const serialNumber = params.serialNumber ||
      (type === "electricity" ? this.config.electricitySerialNumber : this.config.gasSerialNumber);

    if (!identifier) {
      throw new Error(
        `${type === "electricity" ? "MPAN" : "MPRN"} is required for ${type} consumption. ` +
        `Provide it as a parameter or set ${type === "electricity" ? "ELECTRICITY_MPAN" : "GAS_MPRN"} in your .env file.`
      );
    }

    if (!serialNumber) {
      throw new Error(
        `Serial number is required for ${type} consumption. ` +
        `Provide it as a parameter or set ${type === "electricity" ? "ELECTRICITY_SERIAL_NUMBER" : "GAS_SERIAL_NUMBER"} in your .env file.`
      );
    }

    const endpoint =
      type === "electricity"
        ? `${OCTOPUS_API_BASE}/electricity-meter-points/${identifier}/meters/${serialNumber}/consumption/`
        : `${OCTOPUS_API_BASE}/gas-meter-points/${identifier}/meters/${serialNumber}/consumption/`;

    // Build query parameters
    const queryParams = new URLSearchParams();
    if (params.periodFrom) queryParams.append("period_from", params.periodFrom);
    if (params.periodTo) queryParams.append("period_to", params.periodTo);
    if (params.pageSize) queryParams.append("page_size", params.pageSize.toString());
    if (params.orderBy) queryParams.append("order_by", params.orderBy);
    if (params.groupBy) queryParams.append("group_by", params.groupBy);

    const url = `${endpoint}${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;

    // Use Basic Auth with API key as username
    const auth = Buffer.from(`${this.config.apiKey}:`).toString("base64");

    const response = await fetch(url, {
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Octopus Energy API error (${response.status}): ${errorText}`
      );
    }

    return await response.json();
  }

  private setupHandlers(): void {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      const tools: Tool[] = [
        {
          name: "get_electricity_consumption",
          description:
            "Get electricity consumption data from Octopus Energy. Returns consumption in kWh with 0.045 kWh precision. " +
            "MPAN and serial number can be provided as parameters or will use values from ELECTRICITY_MPAN and ELECTRICITY_SERIAL_NUMBER environment variables.",
          inputSchema: {
            type: "object",
            properties: {
              mpan: {
                type: "string",
                description: "The MPAN (Meter Point Administration Number) for the electricity meter. Optional if ELECTRICITY_MPAN is set in .env",
              },
              serial_number: {
                type: "string",
                description: "The meter serial number. Optional if ELECTRICITY_SERIAL_NUMBER is set in .env",
              },
              period_from: {
                type: "string",
                description: "Start date/time in ISO 8601 format with UTC indicator (e.g., 2024-01-01T00:00:00Z)",
              },
              period_to: {
                type: "string",
                description: "End date/time in ISO 8601 format with UTC indicator (e.g., 2024-01-31T23:59:59Z)",
              },
              page_size: {
                type: "number",
                description: "Number of results per page (default: 100, max: 25000)",
              },
              order_by: {
                type: "string",
                description: "Set to 'period' to return earliest records first (default: latest first)",
              },
              group_by: {
                type: "string",
                description: "Group results by: day, week, month, or quarter",
                enum: ["day", "week", "month", "quarter"],
              },
            },
            required: [],
          },
        },
        {
          name: "get_gas_consumption",
          description:
            "Get gas consumption data from Octopus Energy. Returns consumption in kWh for SMETS1 meters or cubic meters for SMETS2 meters. " +
            "MPRN and serial number can be provided as parameters or will use values from GAS_MPRN and GAS_SERIAL_NUMBER environment variables.",
          inputSchema: {
            type: "object",
            properties: {
              mprn: {
                type: "string",
                description: "The MPRN (Meter Point Reference Number) for the gas meter. Optional if GAS_MPRN is set in .env",
              },
              serial_number: {
                type: "string",
                description: "The meter serial number. Optional if GAS_SERIAL_NUMBER is set in .env",
              },
              period_from: {
                type: "string",
                description: "Start date/time in ISO 8601 format with UTC indicator (e.g., 2024-01-01T00:00:00Z)",
              },
              period_to: {
                type: "string",
                description: "End date/time in ISO 8601 format with UTC indicator (e.g., 2024-01-31T23:59:59Z)",
              },
              page_size: {
                type: "number",
                description: "Number of results per page (default: 100, max: 25000)",
              },
              order_by: {
                type: "string",
                description: "Set to 'period' to return earliest records first (default: latest first)",
              },
              group_by: {
                type: "string",
                description: "Group results by: day, week, month, or quarter",
                enum: ["day", "week", "month", "quarter"],
              },
            },
            required: [],
          },
        },
      ];

      return { tools };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        if (!args) {
          throw new Error("No arguments provided");
        }

        if (name === "get_electricity_consumption") {
          const params: ConsumptionParams = {
            mpan: args.mpan as string,
            serialNumber: args.serial_number as string,
            periodFrom: args.period_from as string | undefined,
            periodTo: args.period_to as string | undefined,
            pageSize: args.page_size as number | undefined,
            orderBy: args.order_by as string | undefined,
            groupBy: args.group_by as "day" | "week" | "month" | "quarter" | undefined,
          };

          const data = await this.fetchConsumption("electricity", params);

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(data, null, 2),
              },
            ],
          };
        } else if (name === "get_gas_consumption") {
          const params: ConsumptionParams = {
            mprn: args.mprn as string,
            serialNumber: args.serial_number as string,
            periodFrom: args.period_from as string | undefined,
            periodTo: args.period_to as string | undefined,
            pageSize: args.page_size as number | undefined,
            orderBy: args.order_by as string | undefined,
            groupBy: args.group_by as "day" | "week" | "month" | "quarter" | undefined,
          };

          const data = await this.fetchConsumption("gas", params);

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(data, null, 2),
              },
            ],
          };
        } else {
          throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
          content: [
            {
              type: "text",
              text: `Error: ${errorMessage}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);

    // Log configuration status after connection (to stderr, won't interfere with MCP protocol)
    console.error("Octopus Energy MCP Server running on stdio");
    console.error("Configuration:");
    console.error(`  API Key: ${this.config.apiKey ? "✓ Set" : "✗ Not set"}`);
    console.error(`  Electricity MPAN: ${this.config.electricityMpan ? "✓ Set" : "○ Not set"}`);
    console.error(`  Electricity Serial: ${this.config.electricitySerialNumber ? "✓ Set" : "○ Not set"}`);
    console.error(`  Gas MPRN: ${this.config.gasMprn ? "✓ Set" : "○ Not set"}`);
    console.error(`  Gas Serial: ${this.config.gasSerialNumber ? "✓ Set" : "○ Not set"}`);
  }
}

// Start the server
const server = new OctopusEnergyServer();
server.run().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
