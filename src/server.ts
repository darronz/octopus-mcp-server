import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import type { OctopusConfig } from "./types.js";
import { handleConsumption, getToolDefinitions } from "./handlers.js";

export function createServer(config: OctopusConfig): Server {
  const server = new Server(
    { name: "octopus-energy-server", version: "1.0.0" },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return { tools: getToolDefinitions() };
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
      if (!args) {
        throw new Error("No arguments provided");
      }

      if (name === "get_electricity_consumption") {
        return await handleConsumption(config, "electricity", args as Record<string, unknown>);
      } else if (name === "get_gas_consumption") {
        return await handleConsumption(config, "gas", args as Record<string, unknown>);
      } else {
        throw new Error(`Unknown tool: ${name}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        content: [{ type: "text", text: `Error: ${errorMessage}` }],
        isError: true,
      };
    }
  });

  return server;
}
