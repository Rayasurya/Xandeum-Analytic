export interface ComputeMarketplace {
  id: number;
  name: string;
  deleted_at: string | null;
  infrastructure_id: string;
  owner_id: number;
  author_id: number;
  catalog_id: number;
  ip_address: string;
  port: string;
  config: string;
  is_using_cpu: boolean;
  compute_type: string;
  status: string;
  type: string;
  file: string | null;
  cpu_price: Price | null;
  compute_time_working: ComputeTimeWorking;
}

export interface Price {
  id: number;
  token_symbol: string;
  price: number;
  unit: string;
  type: string;
  compute_gpu_id?: number;
  compute_marketplace_id: number;
  model_marketplace_id: null;
}

export interface ComputeTimeWorking {
  id: number;
  day_range: DayRange[];
  status: string;
  time_start: string;
  time_end: string;
}

export interface DayRange {
  end_day: string;
  start_day: string;
}

export interface ComputeGPU {
  id: number;
  compute_marketplace: ComputeMarketplace;
  prices: Price[];
  gpu_name: string;
  power_consumption: string;
  memory_usage: null;
  power_usage: null;
  gpu_index: number;
  gpu_memory: string;
  gpu_tflops: null;
  branch_name: string;
  batch_size: number;
  gpu_id: string;
  serialno: null;
  created_at: string;
  updated_at: string;
  deleted_at: null;
  quantity_used: number;
  status: string;
  owner_id: null;
  renter_id: null;
  infrastructure_id: string;
}

export interface ComputeCPU {
  gpu_name: string;
  id: number;
  name: string;
  deleted_at: null;
  infrastructure_id: string;
  owner_id: number;
  author_id: number;
  catalog_id: number;
  ip_address: string;
  port: string;
  config: string;
  is_using_cpu: boolean;
  compute_type: string;
  status: string;
  type: string;
  file: null;
  cpu_price: Price;
  compute_time_working: ComputeTimeWorking;
}

export interface ListRentCard {
  compute: { [key: string]: ComputeGPU[] }[];
  compute_cpu: ComputeCPU[];
}

export interface ComputeListResponse {
  count: number;
  next: boolean | null;
  previous: boolean | null;
  results: ListRentCard[];
}
