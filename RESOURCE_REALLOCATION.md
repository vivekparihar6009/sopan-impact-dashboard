# Resource Reallocation Model
**Organization**: Sopan Learning Initiative  
**Associated Ledger**: [src/data/resource_reallocation_model.csv](./src/data/resource_reallocation_model.csv)  
**Author**: Senior Full-Stack Data Engineer & M&E Officer  

---

## 📈 1. Center Efficiency Rankings (Based on Field Data)

By dividing the total monthly cost of each center (snacks + kits + tutor wages) by the total ASER level jumps achieved in that center, we rank our 10 centers from most efficient (lowest cost per transition) to least efficient:

| Rank | Center Name | District | Field Worker | Enrolled Kids | Total Monthly Spend (₹) | Total Jumps | Cost/Transition (₹) | Jumps/Student |
|---|---|---|---|---|---|---|---|---|
| 1 | **Maner Center A** | Patna | Kiran Devi | 53 | ₹40,551 | 59 | **₹687** | 1.1 |
| 2 | **Fatuha Center A** | Patna | Sneha Singh | 51 | ₹40,111 | 56 | **₹716** | 1.1 |
| 3 | **Wazirganj Center A** | Gaya | Anita Devi | 56 | ₹45,809 | 56 | **₹818** | 1.0 |
| 4 | **Phulwari Center A** | Patna | Mohammad Ali | 53 | ₹43,099 | 52 | **₹829** | 1.0 |
| 5 | **Dobhi Center A** | Gaya | Ramesh Paswan | 53 | ₹41,472 | 48 | **₹864** | 0.9 |
| 6 | **Bakhtiyarpur Center A** | Patna | Rahul Prasad | 52 | ₹41,353 | 47 | **₹880** | 0.9 |
| 7 | **Bodh Gaya Center A** | Gaya | Pooja Kumari | 53 | ₹43,433 | 49 | **₹886** | 0.9 |
| 8 | **Sherghati Center A** | Gaya | Sanjay Kumar | 53 | ₹43,267 | 48 | **₹901** | 0.9 |
| 9 | **Danapur Center A** | Patna | Amit Sharma | 54 | ₹41,833 | 43 | **₹973** | 0.8 |
| 10 | **Mohanpur Center A** | Gaya | Sunil Yadav | 53 | ₹40,683 | 40 | **₹1,017** | 0.8 |

---

## 🔍 2. The Reallocation Narrative & Action Plan

Our overall average cost per transition is **₹847**. However, there is a **48% cost gap** between our most efficient center (Maner: ₹687) and our least efficient center (Mohanpur: ₹1,017). 

To maximize learning outcomes under our ₹2 crore budget ceiling, we will implement the following reallocation rules starting next month:

### Phase 1: Reallocating Snacking & SnackBarsnack Budgets (15% Shift)
* **Action**: We will reduce the snacks and travel budget allocation by **15%** for the lowest-performing centers: **Mohanpur Center A** (Tutor: Sunil Yadav) and **Danapur Center A** (Tutor: Amit Sharma).
* **Destination**: This surplus (approx. ₹12,300 monthly) will be transferred directly to **Maner Center A** (Kiran Devi) and **Fatuha Center A** (Sneha Singh) to expand their capacity by enrolling 10 additional out-of-school children each.
* **Justification**: Maner and Fatuha deliver 1.1 learning level jumps per student, meaning every rupee spent there is converted to literacy at 1.48x the speed of Mohanpur.

### Phase 2: Targeted Coaching Instead of Sanctions
* **Analysis**: Mohanpur is located in a highly remote area of Gaya with frequent network drops (reflected in their high submission lag). Sunil Yadav, the Shiksha Mitra, has reported difficulties logging data and lacks mentoring.
* **Action**: Rather than firing low-performing tutors, we will take **10%** of our training travel budget and deploy our Gaya **Master Trainer** (Anita Devi from the top-performing Wazirganj center) to spend 3 days at Mohanpur Center.
* **Objective**: Train Sunil in student grouping techniques and deliver a local 4G booster card to bring their average lag down from 9 days to 2 days, boosting their transition velocity.

### Phase 3: Kit Re-sharing
* **Action**: When cohorts finish, we will retrieve unused teaching kits from **Danapur Center A** and ship them to **Wazirganj Center A** which has a waiting list of 15 children. This avoids purchasing new kits (saving ₹8,000 in capital expenditures).
