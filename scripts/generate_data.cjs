const fs = require('fs');
const path = require('path');

// Seeded random helper to keep data consistent
function createRandom(seed) {
  let x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

const firstNames = [
  'Aarav', 'Vihaan', 'Vivaan', 'Ananya', 'Diya', 'Priya', 'Pooja', 'Amit', 'Rajesh', 'Sanjay',
  'Sunita', 'Neha', 'Karan', 'Rahul', 'Jyoti', 'Kajal', 'Aditya', 'Rohan', 'Sneha', 'Riya',
  'Mohammad', 'Fatima', 'Arjun', 'Vikram', 'Divya', 'Nisha', 'Aisha', 'Abhishek', 'Manish', 'Kiran'
];

const lastNames = [
  'Kumar', 'Kumari', 'Devi', 'Yadav', 'Paswan', 'Singh', 'Sharma', 'Ansari', 'Choudhary', 'Manjhi',
  'Gupta', 'Prasad', 'Mishra', 'Tiwari', 'Verma', 'Khan', 'Das', 'Paswan', 'Rajak', 'Sinha'
];

const districts = ['Gaya', 'Patna'];
const villages = {
  'Gaya': ['Bodh Gaya', 'Dobhi', 'Sherghati', 'Wazirganj', 'Mohanpur'],
  'Patna': ['Danapur', 'Maner', 'Phulwari Sharif', 'Bakhtiyarpur', 'Fatuha']
};

const casteCategories = ['SC', 'ST', 'OBC', 'General'];
const casteWeights = [0.22, 0.03, 0.55, 0.20]; // Bihar-like weights for rural areas

const centers = [
  { id: 'CTR-001', name: 'Bodh Gaya Center A', fwName: 'Pooja Kumari', fwId: 'FW-001', district: 'Gaya', village: 'Bodh Gaya' },
  { id: 'CTR-002', name: 'Dobhi Center A', fwName: 'Ramesh Paswan', fwId: 'FW-002', district: 'Gaya', village: 'Dobhi' },
  { id: 'CTR-003', name: 'Sherghati Center A', fwName: 'Sanjay Kumar', fwId: 'FW-003', district: 'Gaya', village: 'Sherghati' },
  { id: 'CTR-004', name: 'Wazirganj Center A', fwName: 'Anita Devi', fwId: 'FW-004', district: 'Gaya', village: 'Wazirganj' },
  { id: 'CTR-005', name: 'Mohanpur Center A', fwName: 'Sunil Yadav', fwId: 'FW-005', district: 'Gaya', village: 'Mohanpur' },
  { id: 'CTR-006', name: 'Danapur Center A', fwName: 'Amit Sharma', fwId: 'FW-006', district: 'Patna', village: 'Danapur' },
  { id: 'CTR-007', name: 'Maner Center A', fwName: 'Kiran Devi', fwId: 'FW-007', district: 'Patna', village: 'Maner' },
  { id: 'CTR-008', name: 'Phulwari Center A', fwName: 'Mohammad Ali', fwId: 'FW-008', district: 'Patna', village: 'Phulwari Sharif' },
  { id: 'CTR-009', name: 'Bakhtiyarpur Center A', fwName: 'Rahul Prasad', fwId: 'FW-009', district: 'Patna', village: 'Bakhtiyarpur' },
  { id: 'CTR-010', name: 'Fatuha Center A', fwName: 'Sneha Singh', fwId: 'FW-010', district: 'Patna', village: 'Fatuha' }
];

function selectWeighted(items, weights, randomVal) {
  let sum = 0;
  for (let i = 0; i < items.length; i++) {
    sum += weights[i];
    if (randomVal <= sum) return items[i];
  }
  return items[items.length - 1];
}

function generateDataset() {
  const dataset = [];
  let seed = 42;

  // Generate 540 unique base child records (which will go up to 550 with duplicates/modifications)
  for (let i = 1; i <= 540; i++) {
    const rand = () => {
      const r = createRandom(seed);
      seed++;
      return r;
    };

    const firstName = firstNames[Math.floor(rand() * firstNames.length)];
    const lastName = lastNames[Math.floor(rand() * lastNames.length)];
    const name = `${firstName} ${lastName}`;
    const age = Math.floor(rand() * 9) + 6; // 6 to 14
    const gender = rand() < 0.49 ? 'Female' : (rand() < 0.98 ? 'Male' : 'Other');
    
    // Weighted caste selection
    const caste_category = selectWeighted(casteCategories, casteWeights, rand());

    // Center assignment
    const center = centers[Math.floor(rand() * centers.length)];
    const district = center.district;
    const village = center.village;

    // Dates (between Jan 1 2026 and May 30 2026)
    const enrollDaysAgo = Math.floor(rand() * 120) + 30; // 30 to 150 days ago
    const enrollDate = new Date(2026, 5, 12); // current date in script metadata is June 12 2026
    enrollDate.setDate(enrollDate.getDate() - enrollDaysAgo);
    const enrollment_date = enrollDate.toISOString().split('T')[0];

    // Activity costs
    // Snacking + Kit + Field Worker allocation cost per beneficiary per month
    const monthly_cost_inr = Math.floor(rand() * 400) + 600; // 600 to 1000 INR

    // Baseline Levels (remedial tutoring kids start low)
    const baseline_reading_level = Math.floor(rand() * 3); // 0 (Beginner), 1 (Letter), or 2 (Word)
    const baseline_math_level = Math.floor(rand() * 3);    // 0, 1, or 2

    // Progress calculations
    // Older children with high attendance jump more
    const attendance_rate = Math.round((0.65 + rand() * 0.35) * 100) / 100; // 65% to 100%
    
    let readJump = 0;
    let mathJump = 0;

    if (attendance_rate > 0.85) {
      readJump = rand() < 0.7 ? (rand() < 0.3 ? 2 : 1) : 0;
      mathJump = rand() < 0.7 ? (rand() < 0.3 ? 2 : 1) : 0;
    } else if (attendance_rate > 0.75) {
      readJump = rand() < 0.4 ? 1 : 0;
      mathJump = rand() < 0.4 ? 1 : 0;
    }

    const latest_reading_level = Math.min(4, baseline_reading_level + readJump);
    const latest_math_level = Math.min(4, baseline_math_level + mathJump);

    // Latest assessment date (sometime in last 7 days)
    const assessDaysAgo = Math.floor(rand() * 7);
    const assessDate = new Date(2026, 5, 12);
    assessDate.setDate(assessDate.getDate() - assessDaysAgo);
    const assessment_date = assessDate.toISOString().split('T')[0];

    // Submission timestamp (normal submission lag is 0-2 days)
    const lagDays = Math.floor(rand() * 3);
    const submitDate = new Date(assessDate);
    submitDate.setDate(submitDate.getDate() + lagDays);
    const submission_timestamp = submitDate.toISOString().split('T')[0] + 'T18:00:00Z';

    const child = {
      beneficiary_id: `SOP-${district.substring(0, 3).toUpperCase()}-${String(1000 + i).substring(1)}`,
      name,
      age,
      gender,
      caste_category,
      district,
      village,
      enrollment_date,
      center_id: center.id,
      center_name: center.name,
      field_worker_id: center.fwId,
      field_worker_name: center.fwName,
      monthly_cost_inr,
      attendance_rate,
      baseline_reading_level,
      baseline_math_level,
      latest_reading_level,
      latest_math_level,
      assessment_date,
      submission_timestamp,
      is_duplicate: false
    };

    dataset.push(child);
  }

  // --- SEED DATA QUALITY FLAWS ---
  let errorCount = 0;

  // 1. Duplicates: Duplicate 5 existing entries
  for (let i = 0; i < 5; i++) {
    const original = dataset[i * 20 + 10]; // select some spaced children
    const duplicate = JSON.parse(JSON.stringify(original));
    duplicate.is_duplicate = true;
    // Keep ID same but insert duplicate record
    dataset.push(duplicate);
    errorCount++;
  }

  // 2. Impossibly Perfect Progress: 6 children jump > 2 levels in one week
  let jumpedCount = 0;
  for (let i = 100; i < dataset.length && jumpedCount < 6; i++) {
    if (dataset[i].baseline_reading_level === 0 && !dataset[i].is_duplicate) {
      dataset[i].latest_reading_level = 4; // Beginner (0) -> Story (4)
      dataset[i].latest_math_level = 4;
      dataset[i].attendance_rate = 0.98; // Very high attendance to seem plausible
      dataset[i].notes = "Assessment jump anomaly";
      jumpedCount++;
      errorCount++;
    }
  }

  // 3. Missing Demographic Fields: 10 records with null/empty caste_category or gender
  for (let i = 50; i < 60; i++) {
    if (i % 2 === 0) {
      dataset[i].caste_category = null;
    } else {
      dataset[i].gender = "";
    }
    errorCount++;
  }

  // 4. Extreme Submission Lag: 15 records with lag > 7 days
  let lagCount = 0;
  for (let i = 200; i < dataset.length && lagCount < 15; i++) {
    if (!dataset[i].is_duplicate) {
      const originalAssessDate = new Date(dataset[i].assessment_date);
      const fakeSubmitDate = new Date(originalAssessDate);
      fakeSubmitDate.setDate(fakeSubmitDate.getDate() + 9 + (i % 5)); // 9 to 13 days lag
      dataset[i].submission_timestamp = fakeSubmitDate.toISOString().split('T')[0] + 'T19:30:00Z';
      lagCount++;
      errorCount++;
    }
  }

  // 5. Out-of-Bound Levels: 3 records with reading/math levels outside 0-4
  let oobCount = 0;
  for (let i = 350; i < dataset.length && oobCount < 3; i++) {
    if (!dataset[i].is_duplicate) {
      if (oobCount === 0) {
        dataset[i].latest_reading_level = 5; // invalid high
      } else if (oobCount === 1) {
        dataset[i].latest_math_level = -1; // invalid low
      } else {
        dataset[i].latest_reading_level = 6;
      }
      oobCount++;
      errorCount++;
    }
  }

  console.log(`Generated dataset: ${dataset.length} records. Seeded flaws count: ${errorCount}`);
  return dataset;
}

// Convert JSON array to CSV string
function convertToCSV(data) {
  const headers = Object.keys(data[0]);
  const rows = data.map(row => 
    headers.map(fieldName => {
      let val = row[fieldName];
      if (val === null || val === undefined) {
        return '';
      }
      if (typeof val === 'string' && val.includes(',')) {
        return `"${val.replace(/"/g, '""')}"`;
      }
      return val;
    }).join(',')
  );
  return [headers.join(','), ...rows].join('\n');
}

const finalData = generateDataset();

// Ensure output directories exist
const dataDir = path.join(__dirname, '../src/data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Write JSON
fs.writeFileSync(
  path.join(dataDir, 'beneficiaries.json'),
  JSON.stringify(finalData, null, 2),
  'utf8'
);

// Write CSV
fs.writeFileSync(
  path.join(dataDir, 'beneficiaries.csv'),
  convertToCSV(finalData),
  'utf8'
);

console.log('Successfully wrote beneficiaries.json and beneficiaries.csv to src/data/');
