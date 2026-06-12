# User Guide: Sopan Impact Measurement Dashboard

Welcome to the Sopan Learning Initiative Impact Measurement Dashboard. This guide is written in plain English, with no technical terminology or coding jargon, to help program managers, M&E officers, and field coordinators use the dashboard to make data-driven decisions.

---

## 📋 1. What This Dashboard Tells You (In Plain Words)

This dashboard is designed to answer four essential questions every Monday morning:
* **Are the children actually learning?** Instead of just counting how many children attend, it tracks if children are moving up in their reading and math abilities (e.g., from reading letters to reading whole words).
* **Where do we need to focus our efforts?** It shows which centers are doing well and which ones need additional teaching support or visits.
* **Are we using our donor funds effectively?** It calculates the exact cost incurred to help one child progress by one learning level.
* **Can we trust our numbers?** It automatically flags errors in data collection (such as duplicate child profiles, extreme delays in uploading files, or impossible test scores) so we can fix them.

---

## 🔍 2. How to Read Each of the 5 Views

### View 1: ED Monday View (निदेशक सोमवार दृश्य)
* **Who it is for**: Executive Director and Board Members.
* **What it shows**: The **Weekly Learning Transition Rate (WLTR)**—our single most important number. This represents the percentage of children who progressed by at least one ASER reading or math level in the last 30 days. It also shows a colored **Status Banner** (Green, Amber, or Red) that tells you exactly what action to take.
* **How to read it**:
  1. Look at the large percentage on the left. If it is **70% or higher (Green)**, our teaching program is healthy.
  2. If it is **50% to 69% (Amber)**, the program manager must immediately conduct spot-checks at low-performing centers.
  3. If it is **below 50% (Red)**, we must stop program expansion, audit our training, and review centers.

### View 2: Program Progress (कार्यक्रम प्रगति)
* **Who it is for**: Program Managers.
* **What it shows**: The number of remedial classes completed compared to our target (60 sessions per cohort), the learning velocity (average level jumps per student), and the projected end date of the current batch.
* **How to read it**:
  1. The bar chart compares the target number of classes (60) against what each center has actually completed.
  2. The leaderboard lists the centers whose students are learning the fastest, allowing you to identify which teachers to praise and learn from.
  3. Check the **Projected End Date** to know if center timelines are slipping.

### View 3: Demographic Reach (जनसांख्यिकीय पहुँच)
* **Who it is for**: M&E Officers and Donor Auditors.
* **What it shows**: The breakdown of enrolled children by gender (girls vs. boys), caste categories (SC, ST, OBC, General), and geography.
* **How to read it**:
  1. The pie and bar charts show if we are complying with our target to serve marginalized groups (e.g., target: at least 60% SC/ST/OBC).
  2. The **M&E Gap Analysis Box** automatically calculates which groups are falling behind in their learning. For example: *"SC/ST girls are matching targets, but General category boys in Patna show a 12% lower transition rate."*

### View 4: Cost-Per-Impact (लागत-प्रभाव विश्लेषण)
* **Who it is for**: Finance Officers and Fundraising Teams.
* **What it shows**: The overall spending of the cohort, the average monthly cost spent per enrolled child, and the **Cost per ASER Level Transition** (total budget divided by the sum of level improvements).
* **How to read it**:
  1. Track the **Cost per Transition** to see if we are getting more cost-effective over time. A lower number means we are delivering learning gains at a cheaper cost.
  2. Use the **Efficiency Index** (Level Jumps achieved per ₹10,000 spent) in donor funding proposals to prove our high performance.

### View 5: Center Data Health (केंद्र डेटा स्वास्थ्य)
* **Who it is for**: M&E Officers and Data Managers.
* **What it shows**: Seeded data quality anomalies aggregated by **Center ID & Village** (to protect worker privacy). It lists average reporting delays (lag in days) and missing profile fields.
* **How to read it**:
  1. Look at the **Average Submission Lag by Center** bar chart. Centers showing an average delay of $>3$ days need support.
  2. The **Diagnostic Table** at the bottom lists specific child IDs that have errors (e.g., "Out-of-bound level" or "Duplicate profile").
  3. Check the Action column to know how to resolve each error (e.g., "Retake reading assessment", "Deduplicate profiles").

---

## ⚡ 3. Decision Tree: What to Do When Something Looks Wrong

If you spot an anomaly in the metrics, follow this step-by-step response plan:

```
                  [IS THERE AN ANOMALY IN THE METRICS?]
                                    |
      +-----------------------------+-----------------------------+
      |                                                           |
[WLTR Drops Below 50%]                               [Cost-Per-Transition Rises >20%]
      |                                                           |
1. Open "Program Progress" tab.                       1. Open "Cost-Per-Impact" tab.
2. Check center session completion rates.             2. Check if total enrollment dropped 
3. Identify low-velocity centers.                     3. Check Snack and Teaching Kit invoices.
4. Escalate to Sanjay (Prog. Manager)                 4. Escalate to Asha (ED) to audit spend.
5. PM conducts onsite spot check.                     5. Shift to shared teaching kits.
```

* **If WLTR drops below 50%**:
  * *Step 1*: Go to the **Program Progress** view and check if the centers with low transition rates have completed fewer sessions.
  * *Step 2*: Open the **Center Data Health** view and check if these centers have a high submission lag (delay in logging attendance).
  * *Step 3*: Escalate to the Program Manager (Sanjay Kumar) to run an onsite evaluation of the teaching assistants (Shiksha Mitras).
* **If Cost-per-Transition rises by more than 20%**:
  * *Step 1*: Check if child attendance has dropped. If kids do not attend, costs remain the same but level transitions decrease, driving the cost-per-transition up.
  * *Step 2*: Escalate to the Finance Officer to check snack budget invoices and travel reimbursements.
* **If Center Reporting Lag exceeds 5 days**:
  * *Step 1*: Do not penalize or shame the worker.
  * *Step 2*: Contact the field supervisor to check if there are 3G/4G connectivity drops in that village.
  * *Step 3*: Deliver paper-based logging sheets as a fallback and plan a digital refresher training session.

---

## 📊 4. How to Update the Data (Using Google Sheets)

To update the dashboard with new field data, follow these simple steps:

1. **Access the Sheet**: Open the Sopan Master Ledger Google Sheet on your browser.
2. **Enter New Weekly Records**:
   * Go to the **Weekly Assessments** tab.
   * Enter the student's ID, Name, age, caste, and select their latest reading and math levels from the drop-down list (0 to 4).
   * Enter the assessment date. The Google Sheet will automatically record the timestamp of entry.
3. **Publish the CSV (One-time Setup)**:
   * Go to `File > Share > Publish to web`.
   * Under Link, select the **Beneficiary Activity** tab and choose **Comma-separated values (.csv)**.
   * Click **Publish** and copy the generated link.
4. **Paste the Link in Config**:
   * Open the dashboard application.
   * Click the settings icon in the top header.
   * Paste your copied Google Sheets CSV link into the URL field and click **Connect**.
5. **Auto-Refresh**:
   * The dashboard will read directly from the Google Sheets CSV link on page load.
   * Data is cached in your browser for 10 minutes to save mobile data. To force an immediate update, click the **Refresh** icon next to the dashboard filters.
