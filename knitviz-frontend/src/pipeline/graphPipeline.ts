import { KnitGraph } from "@/knitgraph";

export const codeToGraph = (code: string): KnitGraph => {
  const graph = new KnitGraph();
  graph.execute(code);
  return graph;
};
