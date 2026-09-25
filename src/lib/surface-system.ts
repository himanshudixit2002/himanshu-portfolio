import type { LayerId, QuestionStep } from "@/content/types";

export type View = "product" | "system";

export type ExplorerState = {
  view: View;
  layer: LayerId;
  /** Index into the question path while "Follow a question" is running. */
  step: number | null;
};

export type ExplorerAction =
  | { type: "view"; view: View }
  | { type: "layer"; layer: LayerId }
  | { type: "follow" }
  | { type: "next" }
  | { type: "prev" }
  | { type: "stop" };

export const initialExplorerState: ExplorerState = {
  view: "product",
  layer: "client",
  step: null,
};

/**
 * Deterministic state for the Surface / System explorer. Kept free of React
 * so the homepage section and the lab version share it, and so it can be
 * tested directly.
 */
export function explorerReducer(
  state: ExplorerState,
  action: ExplorerAction,
  steps: readonly QuestionStep[],
): ExplorerState {
  switch (action.type) {
    case "view":
      if (action.view === state.view) return state;
      return { ...state, view: action.view, step: action.view === "product" ? null : state.step };

    case "layer":
      return { view: "system", layer: action.layer, step: null };

    case "follow":
      if (steps.length === 0) return state;
      return { view: "system", layer: steps[0].layer, step: 0 };

    case "next": {
      if (state.step === null || state.step >= steps.length - 1) return state;
      const step = state.step + 1;
      return { ...state, step, layer: steps[step].layer };
    }

    case "prev": {
      if (state.step === null || state.step === 0) return state;
      const step = state.step - 1;
      return { ...state, step, layer: steps[step].layer };
    }

    case "stop":
      return state.step === null ? state : { ...state, step: null };
  }
}
