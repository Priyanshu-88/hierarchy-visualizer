/**
 * Validates edge entries from the input data array.
 * Valid format: "X->Y" where X and Y are single uppercase letters (A-Z),
 * no self-loops allowed.
 *
 * @param {string[]} data - Array of edge strings
 * @returns {{ validEdges: Array<{from: string, to: string, raw: string}>, invalidEntries: string[] }}
 */
function validateEntries(data) {
  const validEdges = [];
  const invalidEntries = [];
  const edgePattern = /^([A-Z])->([A-Z])$/;

  for (const rawEntry of data) {
    const entry = typeof rawEntry === 'string' ? rawEntry.trim() : String(rawEntry).trim();

    const match = entry.match(edgePattern);

    if (!match) {
      invalidEntries.push(entry);
      continue;
    }

    const [, from, to] = match;

    // Self-loop check
    if (from === to) {
      invalidEntries.push(entry);
      continue;
    }

    validEdges.push({ from, to, raw: entry });
  }

  return { validEdges, invalidEntries };
}

/**
 * Deduplicates edges, keeping only the first occurrence.
 *
 * @param {Array<{from: string, to: string, raw: string}>} edges
 * @returns {{ uniqueEdges: Array<{from: string, to: string, raw: string}>, duplicateEdges: string[] }}
 */
function deduplicateEdges(edges) {
  const seen = new Set();
  const uniqueEdges = [];
  const duplicateEdgesSet = new Set();

  for (const edge of edges) {
    const key = `${edge.from}->${edge.to}`;

    if (seen.has(key)) {
      duplicateEdgesSet.add(key);
    } else {
      seen.add(key);
      uniqueEdges.push(edge);
    }
  }

  return {
    uniqueEdges,
    duplicateEdges: Array.from(duplicateEdgesSet),
  };
}

module.exports = { validateEntries, deduplicateEdges };
