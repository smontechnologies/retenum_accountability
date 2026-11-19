import type { ActionType, Condition, StepParams, TriggerParams, TriggerType } from "@/domain/workflow";

/** Serialisable data the editor's client components need (no bigint, no functions). */
export interface Option {
  id: string;
  label: string;
}

export interface EditorOptions {
  engagementId: string;
  payerName: string;
  payeeName: string;
  deliverables: Option[];
  obligations: Option[];
  payments: Option[];
  workflows: Option[];
}

export interface EditableStep {
  id: string;
  workflowId: string;
  actionType: ActionType;
  params: StepParams;
  onlyWhen: Condition | null;
  commitment: null | {
    title: string;
    price: string | null;
    definitionOfDone: string | null;
    quantity: string | null;
    unit: string | null;
    dueDate: string | null;
    exclusions: string | null;
    description: string | null;
    termsDays: number | null;
    owedBySide: "payer" | "payee";
  };
}

export interface EditableTrigger {
  workflowId: string;
  triggerType: TriggerType;
  triggerParams: TriggerParams;
  onlyWhen: Condition | null;
}
