/**
 * Builds an adjacency list from validated edges.
 * If a node has multiple parents, only the first parent edge is kept.
 *
 * @param {Array<{from: string, to: string}>} edges
 * @returns {{ adjacency: Map<string, string[]>, allNodes: Set<string>, childNodes: Set<string> }}
 */
function buildGraph(edges) {
  const adjacency = new Map();
  const parentMap = new Map(); // child -> first parent
  const allNodes = new Set();
  const childNodes = new Set();

  for (const edge of edges) {
    allNodes.add(edge.from);
    allNodes.add(edge.to);

    // If this child already has a parent, skip (keep first parent only)
    if (parentMap.has(edge.to)) {
      continue;
    }

    parentMap.set(edge.to, edge.from);
    childNodes.add(edge.to);

    if (!adjacency.has(edge.from)) {
      adjacency.set(edge.from, []);
    }
    adjacency.get(edge.from).push(edge.to);
  }

  // Sort children alphabetically for consistent output
  for (const [node, children] of adjacency) {
    children.sort();
  }

  return { adjacency, allNodes, childNodes };
}

/**
 * Identifies root nodes (nodes that never appear as a child).
 *
 * @param {Set<string>} allNodes
 * @param {Set<string>} childNodes
 * @returns {string[]}
 */
function findRoots(allNodes, childNodes) {
  const roots = [];
  for (const node of allNodes) {
    if (!childNodes.has(node)) {
      roots.push(node);
    }
  }
  roots.sort();
  return roots;
}

/**
 * Finds connected components in the graph.
 *
 * @param {Map<string, string[]>} adjacency
 * @param {Set<string>} allNodes
 * @returns {Array<Set<string>>} Array of node sets, each representing a component
 */
function findComponents(adjacency, allNodes) {
  const visited = new Set();
  const components = [];

  // Build undirected version for component detection
  const undirected = new Map();
  for (const node of allNodes) {
    undirected.set(node, new Set());
  }
  for (const [parent, children] of adjacency) {
    for (const child of children) {
      undirected.get(parent).add(child);
      undirected.get(child).add(parent);
    }
  }

  for (const node of allNodes) {
    if (visited.has(node)) continue;

    const component = new Set();
    const stack = [node];

    while (stack.length > 0) {
      const current = stack.pop();
      if (visited.has(current)) continue;
      visited.add(current);
      component.add(current);

      for (const neighbor of (undirected.get(current) || [])) {
        if (!visited.has(neighbor)) {
          stack.push(neighbor);
        }
      }
    }

    components.push(component);
  }

  return components;
}

module.exports = { buildGraph, findRoots, findComponents };
