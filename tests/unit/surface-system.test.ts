import { describe, expect, it } from "vitest";
import { questionPath } from "@/content/surface-system";
import { explorerReducer, initialExplorerState, type ExplorerAction, type ExplorerState } from "@/lib/surface-system";

const run = (actions: ExplorerAction[], from: ExplorerState = initialExplorerState) =>
  actions.reduce((state, action) => explorerReducer(state, action, questionPath), from);

describe("Surface / System explorer", () => {
  it("starts on the product view with no question running", () => {
    expect(initialExplorerState).toEqual({ view: "product", layer: "client", step: null });
  });

  it("choosing a layer opens the system view on that layer", () => {
    expect(run([{ type: "layer", layer: "reporting" }])).toEqual({ view: "system", layer: "reporting", step: null });
  });

  it("following a question starts at step one on its layer, in system view", () => {
    const state = run([{ type: "follow" }]);
    expect(state).toEqual({ view: "system", layer: questionPath[0].layer, step: 0 });
  });

  it("each step selects the layer it belongs to", () => {
    let state = run([{ type: "follow" }]);
    for (let i = 1; i < questionPath.length; i++) {
      state = explorerReducer(state, { type: "next" }, questionPath);
      expect(state.step).toBe(i);
      expect(state.layer).toBe(questionPath[i].layer);
    }
  });

  it("next stops at the last step and previous stops at the first", () => {
    const end = run([{ type: "follow" }, ...Array.from({ length: questionPath.length + 3 }, () => ({ type: "next" }) as const)]);
    expect(end.step).toBe(questionPath.length - 1);

    const start = run([{ type: "prev" }, { type: "prev" }], { ...end, step: 1, layer: questionPath[1].layer });
    expect(start.step).toBe(0);
  });

  it("next and previous do nothing when no question is running", () => {
    const state = run([{ type: "layer", layer: "rules" }]);
    expect(run([{ type: "next" }], state)).toBe(state);
    expect(run([{ type: "prev" }], state)).toBe(state);
  });

  it("switching to the product view ends the question", () => {
    expect(run([{ type: "follow" }, { type: "next" }, { type: "view", view: "product" }]).step).toBeNull();
  });

  it("switching to the system view keeps a running question", () => {
    const running = run([{ type: "follow" }, { type: "next" }]);
    expect(run([{ type: "view", view: "system" }], running)).toBe(running);
  });

  it("stop keeps the current layer selected", () => {
    const state = run([{ type: "follow" }, { type: "next" }, { type: "next" }, { type: "stop" }]);
    expect(state).toEqual({ view: "system", layer: questionPath[2].layer, step: null });
  });

  it("follow restarts from the first step", () => {
    const state = run([{ type: "follow" }, { type: "next" }, { type: "next" }, { type: "follow" }]);
    expect(state.step).toBe(0);
  });
});
