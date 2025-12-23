import {ComputeGPU} from "./computeListCard";

export interface TDeployBackend {
  id: number
  state: string
  is_interactive: boolean
  url: string
  error_message?: string
  title: string
  description: string
  model_version: string
  timeout: number
  created_at: string
  updated_at: string
  deleted_at?: string
  auto_update: boolean
  is_deploy: boolean
  install_status: "installing" | "reinstalling" | "compleated" | "failed"
  ram: number
  config?: any
  project: number
  mlnetwork: number
  compute_gpu: ComputeGPU
  deploy_history: TDeployHistory
}

export interface TDeployHistory {
  id: number
  ml_network: TMlNetwork
  ml_id: number
  project_id: number
  model_id: number
  ml_gpu_id: number
  compute_gpu_id: number
  checkpoint_id: number
  status: string
  created_at: string
  updated_at: string
  deleted_at?: string
}

export interface TMlNetwork {
  id: number
  project_id: number
  name: string
  model_id: number
  created_at: string
  updated_at: string
  deleted_at?: string
}

export function getDeployBackendStatusText(status: TDeployBackend["install_status"]): string {
  switch (status) {
    case "failed":
      return "Failed";
    case "installing":
      return "Installing";
    case "reinstalling":
      return "Reinstalling";
    case "compleated":
      return "Completed";
  }
}
