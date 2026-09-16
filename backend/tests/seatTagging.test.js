const { generateSeatTags } = require('../utils/seatTagging');

function buildFlatGrid(rows, cols) {
  const seats = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      seats.push({ row: r, col: c, label: `${r}-${c}`, type: 'standard', tags: [] });
    }
  }
  return seats;
}

describe('seatTagging algorithm', () => {
  it('tags a non-zero, bounded number of best-view seats', () => {
    const seats = buildFlatGrid(10, 12);
    const tagged = generateSeatTags(seats, 10, 12);
    const bestView = tagged.filter((s) => s.tags.includes('best-view'));
    expect(bestView.length).toBeGreaterThan(0);
    expect(bestView.length).toBeLessThan(tagged.length);
  });

  it('only tags family clusters in corner regions', () => {
    const seats = buildFlatGrid(10, 12);
    const tagged = generateSeatTags(seats, 10, 12);
    const family = tagged.filter((s) => s.tags.includes('family'));
    for (const seat of family) {
      const inTopBand = seat.row < 2;
      const inBottomBand = seat.row >= 8;
      expect(inTopBand || inBottomBand).toBe(true);
    }
  });

  it('never double-tags a seat as both best-view and family', () => {
    const seats = buildFlatGrid(10, 12);
    const tagged = generateSeatTags(seats, 10, 12);
    const overlap = tagged.filter(
      (s) => s.tags.includes('best-view') && s.tags.includes('family')
    );
    expect(overlap.length).toBe(0);
  });
});