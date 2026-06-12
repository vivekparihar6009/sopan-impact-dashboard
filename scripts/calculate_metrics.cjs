const fs = require('fs');
const path = require('path');

const beneficiaries = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../src/data/beneficiaries.json'), 'utf8')
);

// Clean data (exclude duplicates, out of bounds, and impossible jumps)
const cleaned = beneficiaries.filter(c => {
  if (c.is_duplicate) return false;
  if (c.latest_reading_level < 0 || c.latest_reading_level > 4 || c.latest_math_level < 0 || c.latest_math_level > 4) return false;
  const readJump = c.latest_reading_level - c.baseline_reading_level;
  const mathJump = c.latest_math_level - c.baseline_math_level;
  if (readJump > 2 || mathJump > 2) return false;
  return true;
});

function mean(arr) {
  return arr.reduce((sum, val) => sum + val, 0) / arr.length;
}

function stdDev(arr, m) {
  const variance = arr.reduce((sum, val) => sum + Math.pow(val - m, 2), 0) / (arr.length - 1);
  return Math.sqrt(variance);
}

function cohensD(m1, m2, sd1, sd2) {
  const sdPooled = Math.sqrt((Math.pow(sd1, 2) + Math.pow(sd2, 2)) / 2);
  return (m2 - m1) / sdPooled;
}

function analyze(data, label) {
  const baselineRead = data.map(c => c.baseline_reading_level);
  const latestRead = data.map(c => c.latest_reading_level);
  const baselineMath = data.map(c => c.baseline_math_level);
  const latestMath = data.map(c => c.latest_math_level);

  const mBaseRead = mean(baselineRead);
  const mLateRead = mean(latestRead);
  const sdBaseRead = stdDev(baselineRead, mBaseRead);
  const sdLateRead = stdDev(latestRead, mLateRead);
  const dRead = cohensD(mBaseRead, mLateRead, sdBaseRead, sdLateRead);

  const mBaseMath = mean(baselineMath);
  const mLateMath = mean(latestMath);
  const sdBaseMath = stdDev(baselineMath, mBaseMath);
  const sdLateMath = stdDev(latestMath, mLateMath);
  const dMath = cohensD(mBaseMath, mLateMath, sdBaseMath, sdLateMath);

  console.log(`=== ANALYSIS FOR: ${label} (n = ${data.length}) ===`);
  console.log(`Reading: Baseline Mean = ${mBaseRead.toFixed(2)} (SD = ${sdBaseRead.toFixed(2)}), Latest Mean = ${mLateRead.toFixed(2)} (SD = ${sdLateRead.toFixed(2)})`);
  console.log(`         Cohen's d (Effect Size) = ${dRead.toFixed(3)}`);
  console.log(`Math:    Baseline Mean = ${mBaseMath.toFixed(2)} (SD = ${sdBaseMath.toFixed(2)}), Latest Mean = ${mLateMath.toFixed(2)} (SD = ${sdLateMath.toFixed(2)})`);
  console.log(`         Cohen's d (Effect Size) = ${dMath.toFixed(3)}`);
  console.log('----------------------------------------------------');
}

analyze(cleaned, 'OVERALL CLEANED DATASET');
analyze(cleaned.filter(c => c.district === 'Gaya'), 'GAYA DISTRICT');
analyze(cleaned.filter(c => c.district === 'Patna'), 'PATNA DISTRICT');
