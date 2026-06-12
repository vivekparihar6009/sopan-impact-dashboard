const fs = require('fs');
const path = require('path');

const beneficiaries = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../src/data/beneficiaries.json'), 'utf8')
);

// Clean data
const cleaned = beneficiaries.filter(c => {
  if (c.is_duplicate) return false;
  if (c.latest_reading_level < 0 || c.latest_reading_level > 4 || c.latest_math_level < 0 || c.latest_math_level > 4) return false;
  const readJump = c.latest_reading_level - c.baseline_reading_level;
  const mathJump = c.latest_math_level - c.baseline_math_level;
  if (readJump > 2 || mathJump > 2) return false;
  return true;
});

// Calculate metrics per center
const centerStats = {};

cleaned.forEach(c => {
  if (!centerStats[c.center_id]) {
    centerStats[c.center_id] = {
      center_id: c.center_id,
      center_name: c.center_name,
      district: c.district,
      field_worker_name: c.field_worker_name,
      student_count: 0,
      total_monthly_spend: 0,
      total_jumps: 0,
      transitioned_students: 0
    };
  }

  const stat = centerStats[c.center_id];
  stat.student_count++;
  stat.total_monthly_spend += c.monthly_cost_inr;

  const readJump = Math.max(0, c.latest_reading_level - c.baseline_reading_level);
  const mathJump = Math.max(0, c.latest_math_level - c.baseline_math_level);
  stat.total_jumps += (readJump + mathJump);

  if (readJump > 0 || mathJump > 0) {
    stat.transitioned_students++;
  }
});

// Compute averages
const centerRows = Object.values(centerStats).map(s => {
  const avg_cost_per_student = Math.round(s.total_monthly_spend / s.student_count);
  const cost_per_transition = s.total_jumps > 0 ? Math.round(s.total_monthly_spend / s.total_jumps) : 0;
  const wltr_rate = Math.round((s.transitioned_students / s.student_count) * 100);
  const jumps_per_student = Math.round((s.total_jumps / s.student_count) * 10) / 10;

  return {
    ...s,
    avg_cost_per_student,
    cost_per_transition,
    wltr_rate,
    jumps_per_student
  };
});

// Sort by cost per transition (most efficient first)
centerRows.sort((a, b) => a.cost_per_transition - b.cost_per_transition);

// Generate CSV string
const headers = [
  'Center ID', 'Center Name', 'District', 'Field Worker', 'Students', 
  'Total Monthly Spend (INR)', 'Total Jumps', 'Transitioned Students', 
  'WLTR (%)', 'Avg Cost/Student (INR)', 'Cost/Transition (INR)', 'Jumps/Student'
];

const csvRows = [
  headers.join(','),
  ...centerRows.map(r => [
    r.center_id,
    `"${r.center_name}"`,
    r.district,
    `"${r.field_worker_name}"`,
    r.student_count,
    r.total_monthly_spend,
    r.total_jumps,
    r.transitioned_students,
    r.wltr_rate,
    r.avg_cost_per_student,
    r.cost_per_transition,
    r.jumps_per_student
  ].join(','))
];

// Write file
const dataDir = path.join(__dirname, '../src/data');
fs.writeFileSync(
  path.join(dataDir, 'resource_reallocation_model.csv'),
  csvRows.join('\n'),
  'utf8'
);

console.log('Successfully wrote resource_reallocation_model.csv to src/data/');
console.log('RANKED CENTERS BY EFFICIENCY (Cost per transition):');
centerRows.forEach((r, idx) => {
  console.log(`${idx + 1}. ${r.center_name}: Cost/Transition = ₹${r.cost_per_transition}, WLTR = ${r.wltr_rate}%, Jumps/Student = ${r.jumps_per_student}`);
});
