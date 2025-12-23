import {TModelMarketplace} from "./modelMarketplace";

export type THistoryRentedModel = {
  id: number;
  model_marketplace: TModelMarketplace;
  model_id: number;
  model_new_id: string;
  project_id: number;
  user_id: number;
  model_usage: number;
  time_start: string;
  time_end: string;
  created_at: string;
  updated_at: string;
  deleted_at: string;
  status: "renting" | "completed";
  type: "add" | "rent";
  version?: string;
}
