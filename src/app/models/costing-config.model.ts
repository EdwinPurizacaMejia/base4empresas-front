export type CostingMethod = 'PP' | 'FIFO' | 'STANDARD';

export interface CostingConfigResponse {
  warehouse_id: string;
  method: CostingMethod;
}

export interface CostingConfigUpdate {
  method: CostingMethod;
}
