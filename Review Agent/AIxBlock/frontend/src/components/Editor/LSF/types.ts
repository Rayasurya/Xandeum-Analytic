export type TLsfStore = {
  annotationStore: {
    annotations: ILsfAnnotation[],
    createAnnotation: () => TLsfAnnotation,
    selectAnnotation: (annotationID: number) => void,
    addAnnotation: (o: Object) => ILsfAnnotation,
  },
  setFlags: (flags: Object) => void,
  isApplyingRedact: boolean,
}

export type TLsfAnnotation = {
  id: number,
}

type TDateTime = string;

export interface IApiAnnotation {
  id: number;
  created_username?: string;
  created_ago: string;
  completed_by?: string;

  ground_truth?: string;
  result?: IApiResult[];

  was_cancelled?: boolean; // skipped

  created_at: TDateTime;
  updated_at?: TDateTime;

  /** How much time it took to annotate the task */
  lead_time?: number | null;

  task?: number | null;
}

export interface IApiPrediction {
  id: number;
  model_version: string;

  created_ago: string;

  result?: IApiResult;
  score?: number | null;
  cluster?: number | null;
  neighbors?: Array<number>;
  mislabeling?: number;

  created_at: TDateTime;
  updated_at?: TDateTime;
  task: number;
}

export interface IApiResult {
  id: string,
  from_name: string,
  to_name: string,
  type: string, // @todo enum
  value: Record<string, any>,
}

export interface IApiTask {
  id: number;
  data: Record<string, any>;
  meta?: any | null;

  created_at?: TDateTime;
  updated_at?: TDateTime;

  is_labeled?: boolean;
  overlap?: number;

  project?: number | null;

  file_upload?: number | null;
  annotations?: IApiAnnotation[];
  predictions?: IApiPrediction[];
}

export interface ILsfTaskData {
  id: number;
  data: any;
  createdAt?: TDateTime;
  annotations: ILsfAnnotationData[];
  predictions: ILsfAnnotationData[];
}

export interface ILsfTask extends ILsfTaskData {
  annotations: ILsfAnnotation[];
  predictions: ILsfAnnotation[];
}

export interface ILsfAnnotationData {
  id?: string;

  pk: string; // @todo oh, it's complicated

  createdDate: TDateTime;
  createdAgo: string;
  createdBy?: string;

  leadTime?: number;

  skipped?: boolean;

  versions?: {
    draft: Object[],
  };
}

export interface ILsfAnnotation extends ILsfAnnotationData {
  loadedDate: Date,
  draftId: number | null,
  parent_prediction?: number | null,
  parent_annotation?: number | null,
  userGenerate?: boolean;
  sentUserGenerate?: boolean;

  // editable: boolean;

  addVersions(v: {draft: Object[]}): void;
  serializeAnnotation(): IApiResult[];
  updatePersonalKey(id: number): void;
  setDraftId(id: number): void;
  deleteAllRegions(o: Object): void;
  deserializeResults(r: Object[]): void;
  setDraftSaved(d: string): void;

  history: {
    freeze: () => void,
    safeUnfreeze: () => void,
  };
}
