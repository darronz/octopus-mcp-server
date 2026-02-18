export interface OctopusConfig {
  apiKey: string;
  electricityMpan?: string;
  electricitySerialNumber?: string;
  gasMprn?: string;
  gasSerialNumber?: string;
}

export interface ConsumptionParams {
  mpan?: string;
  mprn?: string;
  serialNumber?: string;
  periodFrom?: string;
  periodTo?: string;
  pageSize?: number;
  orderBy?: string;
  groupBy?: "day" | "week" | "month" | "quarter";
}

export interface ConsumptionResult {
  consumption: number;
  interval_start: string;
  interval_end: string;
}

export interface ConsumptionResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: ConsumptionResult[];
}
