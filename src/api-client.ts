import type { OctopusConfig, ConsumptionParams, ConsumptionResponse } from "./types.js";

const OCTOPUS_API_BASE = "https://api.octopus.energy/v1";

export async function fetchConsumption(
  config: OctopusConfig,
  type: "electricity" | "gas",
  params: ConsumptionParams
): Promise<ConsumptionResponse> {
  if (!config.apiKey) {
    throw new Error("OCTOPUS_API_KEY environment variable is not set");
  }

  // Use provided values or fall back to config
  const identifier = type === "electricity"
    ? (params.mpan || config.electricityMpan)
    : (params.mprn || config.gasMprn);

  const serialNumber = params.serialNumber ||
    (type === "electricity" ? config.electricitySerialNumber : config.gasSerialNumber);

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
  const auth = Buffer.from(`${config.apiKey}:`).toString("base64");

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
