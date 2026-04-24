const express = require('express');
const router = express.Router();

const { validateEntries, deduplicateEdges } = require('../utils/validator');
const { buildGraph, findRoots, findComponents } = require('../utils/graphBuilder');
const { hasCycle } = require('../utils/cycleDetector');
const { buildTree } = require('../utils/treeBuilder');

// User metadata
const USER_ID = 'priyanshu_24042026';
const EMAIL_ID = 'priyanshu@example.com';
const COLLEGE_ROLL = 'SRMXXXXXX';

router.post('/', (req, res) => {
  try {
    const { data } = req.body;

    // Input validation
    if (!data || !Array.isArray(data)) {
      return res.status(400).json({
        error: 'Invalid input. Expected { "data": ["X->Y", ...] }',
      });
    }

    if (data.length === 0) {
      return res.json({
        user_id: USER_ID,
        email_id: EMAIL_ID,
        college_roll_number: COLLEGE_ROLL,
        hierarchies: [],
        invalid_entries: [],
        duplicate_edges: [],
        summary: {
          total_trees: 0,
          total_cycles: 0,
          largest_tree_root: null,
        },
      });
    }

    // Step 1: Validate entries
    const { validEdges, invalidEntries } = validateEntries(data);

    // Step 2: Deduplicate
    const { uniqueEdges, duplicateEdges } = deduplicateEdges(validEdges);

    // Step 3: Build graph
    const { adjacency, allNodes, childNodes } = buildGraph(uniqueEdges);

    // Step 4: Find connected components
    const components = findComponents(adjacency, allNodes);

    // Step 5: Process each component
    const hierarchies = [];
    let totalTrees = 0;
    let totalCycles = 0;
    let largestTreeRoot = null;
    let maxDepth = 0;

    for (const component of components) {
      // Find root(s) for this component
      const componentRoots = [];
      for (const node of component) {
        if (!childNodes.has(node)) {
          componentRoots.push(node);
        }
      }
      componentRoots.sort();

      // Determine root
      let root;
      if (componentRoots.length > 0) {
        root = componentRoots[0];
      } else {
        // No root found (cycle) → pick lexicographically smallest
        root = Array.from(component).sort()[0];
      }

      // Check for cycles
      const cycleDetected = hasCycle(adjacency, component);

      if (cycleDetected) {
        totalCycles++;
        hierarchies.push({
          root,
          tree: {},
          has_cycle: true,
        });
      } else {
        // Build tree for each root in the component
        // (Typically one root per tree component)
        for (const r of componentRoots.length > 0 ? componentRoots : [root]) {
          const { tree, depth } = buildTree(r, adjacency);
          totalTrees++;
          hierarchies.push({
            root: r,
            tree,
            depth,
          });

          // Track largest tree
          if (depth > maxDepth || (depth === maxDepth && (largestTreeRoot === null || r < largestTreeRoot))) {
            maxDepth = depth;
            largestTreeRoot = r;
          }
        }
      }
    }

    // Sort hierarchies: trees first (by root), then cycles (by root)
    hierarchies.sort((a, b) => {
      if (a.has_cycle && !b.has_cycle) return 1;
      if (!a.has_cycle && b.has_cycle) return -1;
      return a.root.localeCompare(b.root);
    });

    return res.json({
      user_id: USER_ID,
      email_id: EMAIL_ID,
      college_roll_number: COLLEGE_ROLL,
      hierarchies,
      invalid_entries: invalidEntries,
      duplicate_edges: duplicateEdges,
      summary: {
        total_trees: totalTrees,
        total_cycles: totalCycles,
        largest_tree_root: largestTreeRoot,
      },
    });
  } catch (err) {
    console.error('Error processing /bfhl:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
