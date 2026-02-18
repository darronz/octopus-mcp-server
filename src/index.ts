#!/usr/bin/env node

import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { readFileSync } from "fs";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import type { OctopusConfig } from "./types.js";
import { createServer } from "./server.js";

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

// Build config from environment
const config: OctopusConfig = {
  apiKey: process.env.OCTOPUS_API_KEY || "",
  electricityMpan: process.env.ELECTRICITY_MPAN,
  electricitySerialNumber: process.env.ELECTRICITY_SERIAL_NUMBER,
  gasMprn: process.env.GAS_MPRN,
  gasSerialNumber: process.env.GAS_SERIAL_NUMBER,
};

// Create and start the MCP server
const server = createServer(config);

async function run(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);

  // Log configuration status after connection (to stderr, won't interfere with MCP protocol)
  console.error("Octopus Energy MCP Server running on stdio");
  console.error("Configuration:");
  console.error(`  API Key: ${config.apiKey ? "✓ Set" : "✗ Not set"}`);
  console.error(`  Electricity MPAN: ${config.electricityMpan ? "✓ Set" : "○ Not set"}`);
  console.error(`  Electricity Serial: ${config.electricitySerialNumber ? "✓ Set" : "○ Not set"}`);
  console.error(`  Gas MPRN: ${config.gasMprn ? "✓ Set" : "○ Not set"}`);
  console.error(`  Gas Serial: ${config.gasSerialNumber ? "✓ Set" : "○ Not set"}`);
}

run().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
