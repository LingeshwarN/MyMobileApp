/**
 * Reconstructs a [rows][cols] 2D matrix from a flat seat array.
 * Empty/aisle positions with no seat remain `null`.
 */
function buildMatrix(seats, rows, cols) {
  const matrix = Array.from({ length: rows }, () => new Array(cols).fill(null));
  for (const seat of seats) {
    matrix[seat.row][seat.col] = seat;
  }
  return matrix;
}

/** Flattens the matrix back into a plain array for saving to Mongo. */
function flattenMatrix(matrix) {
  const seats = [];
  for (const row of matrix) {
    for (const seat of row) {
      if (seat) seats.push(seat);
    }
  }
  return seats;
}

/**
 * BEST VIEW (gold): the sweet-spot band — not so close the screen dominates
 * the field of view, not so far the picture is small, and centered
 * horizontally so the viewing angle isn't distorted.
 *
 * rowStart/rowEnd take the middle ~30% of rows (40%–70% depth).
 * colStart/colEnd take the middle ~50% of columns (25%–75% width).
 */
function tagBestView(matrix, rows, cols) {
  const rowStart = Math.floor(rows * 0.4);
  const rowEnd = Math.ceil(rows * 0.7);
  const colStart = Math.floor(cols * 0.25);
  const colEnd = Math.ceil(cols * 0.75);

  for (let r = rowStart; r < rowEnd; r++) {
    for (let c = colStart; c < colEnd; c++) {
      const seat = matrix[r][c];
      if (seat && seat.type !== 'aisle' && !seat.tags.includes('best-view')) {
        seat.tags.push('best-view');
      }
    }
  }
  return matrix;
}

/**
 * FAMILY BOOKING (blue): scans the four corner regions of the grid for
 * horizontally contiguous runs of 3–4 untagged standard seats.
 *
 * A "corner region" is the outer 2 rows × 5 cols block at each corner.
 * Within each row of a region, a sliding scan finds runs of eligible
 * seats; any run ≥3 long gets its first 4 seats (or fewer, if the run
 * is exactly 3) tagged as a family cluster.
 */
function getCornerRegions(rows, cols) {
  const bandRows = Math.min(2, rows);
  const bandCols = Math.min(5, cols);
  return [
    { rStart: 0, rEnd: bandRows, cStart: 0, cEnd: bandCols },                     // top-left
    { rStart: 0, rEnd: bandRows, cStart: cols - bandCols, cEnd: cols },           // top-right
    { rStart: rows - bandRows, rEnd: rows, cStart: 0, cEnd: bandCols },           // bottom-left
    { rStart: rows - bandRows, rEnd: rows, cStart: cols - bandCols, cEnd: cols }, // bottom-right
  ];
}

function tagFamilyClusters(matrix, rows, cols) {
  const regions = getCornerRegions(rows, cols);

  for (const region of regions) {
    for (let r = region.rStart; r < region.rEnd; r++) {
      let runStart = null;

      for (let c = region.cStart; c <= region.cEnd; c++) {
        const seat = c < region.cEnd ? matrix[r][c] : null;
        const isEligible = seat && seat.type === 'standard' && seat.tags.length === 0;

        if (isEligible) {
          if (runStart === null) runStart = c;
        } else {
          if (runStart !== null) {
            const runLength = c - runStart;
            if (runLength >= 3) {
              const clusterEnd = Math.min(runStart + 4, c);
              for (let cc = runStart; cc < clusterEnd; cc++) {
                matrix[r][cc].tags.push('family');
              }
            }
          }
          runStart = null;
        }
      }
    }
  }
  return matrix;
}

/** Public entry point: takes a flat seat array, returns it re-tagged. */
function generateSeatTags(seats, rows, cols) {
  const matrix = buildMatrix(seats, rows, cols);
  tagBestView(matrix, rows, cols);
  tagFamilyClusters(matrix, rows, cols);
  return flattenMatrix(matrix);
}

module.exports = {
  buildMatrix,
  flattenMatrix,
  tagBestView,
  tagFamilyClusters,
  generateSeatTags,
};