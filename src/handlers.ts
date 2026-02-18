import type { OctopusConfig, ConsumptionParams } from "./types.js";
import { fetchConsumption } from "./api-client.js";
import type { Tool } from "@modelcontextprotocol/sdk/types.js";

export function getToolDefinitions(): Tool[] {
  return [
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
}

export async function handleConsumption(
  config: OctopusConfig,
  type: "electricity" | "gas",
  args: Record<string, unknown>
): Promise<{ content: Array<{ type: "text"; text: string }>; isError?: boolean }> {
  const params: ConsumptionParams = {
    mpan: type === "electricity" ? (args.mpan as string | undefined) : undefined,
    mprn: type === "gas" ? (args.mprn as string | undefined) : undefined,
    serialNumber: args.serial_number as string | undefined,
    periodFrom: args.period_from as string | undefined,
    periodTo: args.period_to as string | undefined,
    pageSize: args.page_size as number | undefined,
    orderBy: args.order_by as string | undefined,
    groupBy: args.group_by as "day" | "week" | "month" | "quarter" | undefined,
  };

  const data = await fetchConsumption(config, type, params);

  return {
    content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
  };
}
