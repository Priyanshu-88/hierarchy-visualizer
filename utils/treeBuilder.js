/**
 * Builds a nested JSON tree structure from a root node using the adjacency list.
 *
 * @param {string} root - The root node
 * @param {Map<string, string[]>} adjacency
 * @returns {{ tree: object, depth: number }}
 */
function buildTree(root, adjacency) {
  const tree = {};
  const depth = buildSubtree(root, adjacency, tree);
  return { tree, depth };
}

/**
 * Recursively builds a subtree and returns its depth.
 *
 * @param {string} node
 * @param {Map<string, string[]>} adjacency
 * @param {object} parent - The parent object to attach children to
 * @returns {number} depth (node count along longest path)
 */
function buildSubtree(node, adjacency, parent) {
  const children = adjacency.get(node) || [];
  parent[node] = {};

  if (children.length === 0) {
    return 1;
  }

  let maxChildDepth = 0;
  for (const child of children) {
    const childDepth = buildSubtree(child, adjacency, parent[node]);
    maxChildDepth = Math.max(maxChildDepth, childDepth);
  }

  return 1 + maxChildDepth;
}

module.exports = { buildTree };
