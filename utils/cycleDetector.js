/**
 * Detects if a cycle exists in the directed graph starting from a set of nodes.
 * Uses DFS with three-color marking (white/gray/black).
 *
 * @param {Map<string, string[]>} adjacency
 * @param {Set<string>} componentNodes - nodes in this component
 * @returns {boolean} true if a cycle is detected
 */
function hasCycle(adjacency, componentNodes) {
  const WHITE = 0, GRAY = 1, BLACK = 2;
  const color = new Map();

  for (const node of componentNodes) {
    color.set(node, WHITE);
  }

  function dfs(node) {
    color.set(node, GRAY);

    const neighbors = adjacency.get(node) || [];
    for (const neighbor of neighbors) {
      if (!componentNodes.has(neighbor)) continue;

      if (color.get(neighbor) === GRAY) {
        return true; // Back edge → cycle
      }
      if (color.get(neighbor) === WHITE) {
        if (dfs(neighbor)) return true;
      }
    }

    color.set(node, BLACK);
    return false;
  }

  for (const node of componentNodes) {
    if (color.get(node) === WHITE) {
      if (dfs(node)) return true;
    }
  }

  return false;
}

module.exports = { hasCycle };
