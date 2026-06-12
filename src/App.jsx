import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, Users, DollarSign, Activity, CheckCircle, 
  AlertTriangle, AlertOctagon, Filter, RefreshCw, Calendar, 
  MapPin, Award, BookOpen, AlertCircle, HelpCircle, Layers, Globe
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, LineChart, Line, 
  PieChart, Pie, Cell, AreaChart, Area 
} from 'recharts';

import rawBeneficiaries from './data/beneficiaries.json';
import translations from './data/translations.json';

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

const casteCategories = ['SC', 'ST', 'OBC', 'General'];

export default function App() {
  // Localization state
  const [lang, setLang] = useState('en');
  const t = (key) => translations[lang][key] || key;

  // Navigation tab state
  const [activeTab, setActiveTab] = useState('ed_view');

  // Filter states
  const [filterDistrict, setFilterDistrict] = useState('All');
  const [filterAgeGroup, setFilterAgeGroup] = useState('All');
  const [filterCaste, setFilterCaste] = useState('All');

  // 1. DATA PIPELINE: Data Cleaning
  // Separate duplicates, OOB levels, missing demographic records, and impossible jumps
  const auditReport = useMemo(() => {
    let duplicates = [];
    let oobLevels = [];
    let impossibleJumps = [];
    let missingDemographics = [];
    
    rawBeneficiaries.forEach((c) => {
      // Duplicates
      if (c.is_duplicate) {
        duplicates.push({ ...c, issue: 'Duplicate profile entry' });
      }

      // Out of Bound Levels (valid: 0 to 4)
      if (c.latest_reading_level < 0 || c.latest_reading_level > 4 || c.latest_math_level < 0 || c.latest_math_level > 4) {
        oobLevels.push({ ...c, issue: `Out-of-bound level (Reading: ${c.latest_reading_level}, Math: ${c.latest_math_level})` });
      }

      // Impossible jumps (>2 levels in single week)
      const readJump = c.latest_reading_level - c.baseline_reading_level;
      const mathJump = c.latest_math_level - c.baseline_math_level;
      if (readJump > 2 || mathJump > 2) {
        impossibleJumps.push({ ...c, issue: `Impossible level jump (Reading: +${readJump}, Math: +${mathJump})` });
      }

      // Missing core demographic values
      if (!c.caste_category || c.gender === "") {
        missingDemographics.push({ ...c, issue: `Missing demographic values (${!c.caste_category ? 'Caste' : ''} ${c.gender === '' ? 'Gender' : ''})` });
      }
    });

    return {
      duplicates,
      oobLevels,
      impossibleJumps,
      missingDemographics,
      totalErrorsCount: duplicates.length + oobLevels.length + impossibleJumps.length + missingDemographics.length
    };
  }, []);

  // Filtered clean dataset for impact metrics
  const cleanedData = useMemo(() => {
    // Exclude duplicates, out-of-bound level reports, and impossible progress from core impact metrics
    return rawBeneficiaries.filter((c) => {
      if (c.is_duplicate) return false;
      if (c.latest_reading_level < 0 || c.latest_reading_level > 4 || c.latest_math_level < 0 || c.latest_math_level > 4) return false;
      const readJump = c.latest_reading_level - c.baseline_reading_level;
      const mathJump = c.latest_math_level - c.baseline_math_level;
      if (readJump > 2 || mathJump > 2) return false;
      return true;
    });
  }, []);

  // Apply dashboard filters to the cleaned dataset
  const filteredData = useMemo(() => {
    return cleanedData.filter((c) => {
      // District filter
      if (filterDistrict !== 'All' && c.district !== filterDistrict) return false;
      
      // Age group filter
      if (filterAgeGroup !== 'All') {
        if (filterAgeGroup === '6-8' && (c.age < 6 || c.age > 8)) return false;
        if (filterAgeGroup === '9-11' && (c.age < 9 || c.age > 11)) return false;
        if (filterAgeGroup === '12-14' && (c.age < 12 || c.age > 14)) return false;
      }
      
      // Caste filter
      if (filterCaste !== 'All' && c.caste_category !== filterCaste) return false;

      return true;
    });
  }, [cleanedData, filterDistrict, filterAgeGroup, filterCaste]);

  // 2. METRIC CALCULATIONS
  // WLTR: % of children with >=1 level jump in last 30 days (baseline vs latest)
  const wltr = useMemo(() => {
    if (filteredData.length === 0) return 0;
    const transitionedCount = filteredData.filter(
      c => (c.latest_reading_level > c.baseline_reading_level) || (c.latest_math_level > c.baseline_math_level)
    ).length;
    return Math.round((transitionedCount / filteredData.length) * 100);
  }, [filteredData]);

  // Cost per transition
  // Cost per transition = Total Spend / Total ASER level gains
  const costMetrics = useMemo(() => {
    if (filteredData.length === 0) return { totalSpend: 0, costPerChild: 0, costPerTransition: 0, totalGains: 0 };
    const totalSpend = filteredData.reduce((sum, c) => sum + c.monthly_cost_inr, 0);
    const costPerChild = Math.round(totalSpend / filteredData.length);
    
    // Total gains across reading and math
    const totalGains = filteredData.reduce((sum, c) => {
      const readGain = Math.max(0, c.latest_reading_level - c.baseline_reading_level);
      const mathGain = Math.max(0, c.latest_math_level - c.baseline_math_level);
      return sum + readGain + mathGain;
    }, 0);

    const costPerTransition = totalGains > 0 ? Math.round(totalSpend / totalGains) : 0;

    return { totalSpend, costPerChild, costPerTransition, totalGains };
  }, [filteredData]);

  // Data Quality Health Score
  // Calculated across raw dataset to show field logging quality
  const dataQualityScore = useMemo(() => {
    const errorCount = auditReport.totalErrorsCount;
    const score = 100 - (errorCount / rawBeneficiaries.length) * 100;
    return Math.round(score * 10) / 10;
  }, [auditReport]);

  // RAG Configuration based on WLTR
  const ragStatus = useMemo(() => {
    if (wltr >= 70) return { status: 'healthy', color: 'success', text: t('status_healthy'), action: t('action_healthy') };
    if (wltr >= 50) return { status: 'warning', color: 'warning', text: t('status_warning'), action: t('action_warning') };
    return { status: 'critical', color: 'error', text: t('status_critical'), action: t('action_critical') };
  }, [wltr, lang]);

  // Reset all filters
  const resetFilters = () => {
    setFilterDistrict('All');
    setFilterAgeGroup('All');
    setFilterCaste('All');
  };

  // 3. CHARTS DATA COMPILATION

  // ASER level transitions comparison (Baseline vs Latest Reading Levels)
  const readingLevelStats = useMemo(() => {
    const counts = { 
      baseline: [0, 0, 0, 0, 0], 
      latest: [0, 0, 0, 0, 0] 
    };
    filteredData.forEach(c => {
      if (c.baseline_reading_level >= 0 && c.baseline_reading_level <= 4) counts.baseline[c.baseline_reading_level]++;
      if (c.latest_reading_level >= 0 && c.latest_reading_level <= 4) counts.latest[c.latest_reading_level]++;
    });

    return [
      { name: t('level_0'), [lang === 'en' ? 'Baseline (Start)' : 'शुरुआत में']: counts.baseline[0], [lang === 'en' ? 'Latest (Now)' : 'अब']: counts.latest[0] },
      { name: t('level_1'), [lang === 'en' ? 'Baseline (Start)' : 'शुरुआत में']: counts.baseline[1], [lang === 'en' ? 'Latest (Now)' : 'अब']: counts.latest[1] },
      { name: t('level_2'), [lang === 'en' ? 'Baseline (Start)' : 'शुरुआत में']: counts.baseline[2], [lang === 'en' ? 'Latest (Now)' : 'अब']: counts.latest[2] },
      { name: t('level_3'), [lang === 'en' ? 'Baseline (Start)' : 'शुरुआत में']: counts.baseline[3], [lang === 'en' ? 'Latest (Now)' : 'अब']: counts.latest[3] },
      { name: t('level_4'), [lang === 'en' ? 'Baseline (Start)' : 'शुरुआत में']: counts.baseline[4], [lang === 'en' ? 'Latest (Now)' : 'अब']: counts.latest[4] }
    ];
  }, [filteredData, lang]);

  // Center-level data for Programme Progress and Data Health views
  const centerDataStats = useMemo(() => {
    const centerMap = {};
    centers.forEach(ctr => {
      centerMap[ctr.id] = {
        id: ctr.id,
        name: ctr.name,
        fwName: ctr.fwName,
        totalChildren: 0,
        totalSessions: 60, // target sessions
        completedSessions: Math.round(52 + (parseInt(ctr.id.split('-')[1]) % 3) * 3), // simulated completed sessions
        transitionedCount: 0,
        totalJumps: 0,
        submissionLagSum: 0,
        assessmentsCount: 0,
        missingFields: 0,
        duplicates: 0,
        impossibleJumps: 0
      };
    });

    // Populate using rawBeneficiaries for health and cleanedData for performance
    rawBeneficiaries.forEach(c => {
      const entry = centerMap[c.center_id];
      if (entry) {
        entry.totalChildren++;
        
        // Calculate lag
        const lag = Math.max(0, Math.floor((new Date(c.submission_timestamp) - new Date(c.assessment_date)) / (1000 * 60 * 60 * 24)));
        entry.submissionLagSum += lag;
        entry.assessmentsCount++;

        // Audit flags
        if (c.is_duplicate) entry.duplicates++;
        if (!c.caste_category || c.gender === "") entry.missingFields++;
        const rJump = c.latest_reading_level - c.baseline_reading_level;
        const mJump = c.latest_math_level - c.baseline_math_level;
        if (rJump > 2 || mJump > 2) entry.impossibleJumps++;
      }
    });

    cleanedData.forEach(c => {
      const entry = centerMap[c.center_id];
      if (entry) {
        if ((c.latest_reading_level > c.baseline_reading_level) || (c.latest_math_level > c.baseline_math_level)) {
          entry.transitionedCount++;
        }
        const rJump = Math.max(0, c.latest_reading_level - c.baseline_reading_level);
        const mJump = Math.max(0, c.latest_math_level - c.baseline_math_level);
        entry.totalJumps += (rJump + mJump);
      }
    });

    return Object.values(centerMap).map(c => {
      const avgLag = c.assessmentsCount > 0 ? Math.round((c.submissionLagSum / c.assessmentsCount) * 10) / 10 : 0;
      const errorRate = c.totalChildren > 0 ? Math.round(((c.duplicates + c.missingFields + c.impossibleJumps) / c.totalChildren) * 100) : 0;
      const completionRate = Math.round((c.completedSessions / c.totalSessions) * 100);
      const velocity = c.totalChildren > 0 ? Math.round((c.totalJumps / c.totalChildren) * 10) / 10 : 0;

      return {
        ...c,
        avgLag,
        errorRate,
        completionRate,
        velocity
      };
    });
  }, [rawBeneficiaries, cleanedData]);

  // Demographic reach arrays
  const demographicStats = useMemo(() => {
    // Gender counts
    const genders = { Male: 0, Female: 0, Other: 0 };
    // Caste counts
    const castes = { SC: 0, ST: 0, OBC: 0, General: 0 };
    // District counts
    const dists = { Gaya: 0, Patna: 0 };

    filteredData.forEach(c => {
      if (genders[c.gender] !== undefined) genders[c.gender]++;
      if (castes[c.caste_category] !== undefined) castes[c.caste_category]++;
      if (dists[c.district] !== undefined) dists[c.district]++;
    });

    const genderChart = [
      { name: lang === 'en' ? 'Girls' : 'लड़कियां', value: genders.Female, color: '#f43f5e' },
      { name: lang === 'en' ? 'Boys' : 'लड़के', value: genders.Male, color: '#3b82f6' },
      { name: lang === 'en' ? 'Other' : 'अन्य', value: genders.Other, color: '#10b981' }
    ].filter(g => g.value > 0);

    const casteChart = Object.keys(castes).map(key => ({
      name: key,
      [lang === 'en' ? 'Children Enrolled' : 'नामांकित बच्चे']: castes[key]
    }));

    const districtChart = Object.keys(dists).map(key => ({
      name: key === 'Gaya' ? (lang === 'en' ? 'Gaya' : 'गया') : (lang === 'en' ? 'Patna' : 'पटना'),
      [lang === 'en' ? 'Children Enrolled' : 'नामांकित बच्चे']: dists[key]
    }));

    return { genderChart, casteChart, districtChart };
  }, [filteredData, lang]);

  // Dynamic M&E Gap Analysis Calculator
  const gapAnalysisResult = useMemo(() => {
    // Let's check transition rate differences between girls and boys
    const girls = filteredData.filter(c => c.gender === 'Female');
    const boys = filteredData.filter(c => c.gender === 'Male');
    
    const girlsWLTR = girls.length > 0 ? Math.round((girls.filter(c => (c.latest_reading_level > c.baseline_reading_level) || (c.latest_math_level > c.baseline_math_level)).length / girls.length) * 100) : 0;
    const boysWLTR = boys.length > 0 ? Math.round((boys.filter(c => (c.latest_reading_level > c.baseline_reading_level) || (c.latest_math_level > c.baseline_math_level)).length / boys.length) * 100) : 0;

    // Check caste categories
    const castesRate = casteCategories.map(caste => {
      const list = filteredData.filter(c => c.caste_category === caste);
      const rate = list.length > 0 ? Math.round((list.filter(c => (c.latest_reading_level > c.baseline_reading_level) || (c.latest_math_level > c.baseline_math_level)).length / list.length) * 100) : 0;
      return { caste, rate, count: list.length };
    }).filter(c => c.count > 3); // only consider if sample size > 3

    // Identify lowest performing cohort
    let lowestCaste = null;
    let lowestRate = 100;
    castesRate.forEach(c => {
      if (c.rate < lowestRate) {
        lowestRate = c.rate;
        lowestCaste = c.caste;
      }
    });

    let storyEn = `**Gender Equality**: Girls are achieving a **${girlsWLTR}% WLTR** vs. boys at **${boysWLTR}%** (a **${Math.abs(girlsWLTR - boysWLTR)}% gap**). `;
    let storyHi = `**लैंगिक समानता**: लड़कियां **${girlsWLTR}%** सुधार दर प्राप्त कर रही हैं, जबकि लड़के **${boysWLTR}%** पर हैं (अंतर: **${Math.abs(girlsWLTR - boysWLTR)}%**)। `;

    if (lowestCaste) {
      storyEn += `**Caste Focus**: Children in the **${lowestCaste}** category exhibit the lowest learning transition rate at **${lowestRate}%**; they need prioritized tutoring support.`;
      storyHi += `**जाति विश्लेषण**: **${lowestCaste}** श्रेणी के बच्चों की अधिगम सुधार दर सबसे कम **${lowestRate}%** है; इन्हें प्राथमिकता के आधार पर सहायता की आवश्यकता है।`;
    }

    return lang === 'en' ? storyEn : storyHi;
  }, [filteredData, lang]);

  // Cost trends calculation (mocking historical months based on current cost effectiveness averages)
  const costTrends = useMemo(() => {
    const scaleFactor = costMetrics.costPerTransition;
    const baseChildCost = costMetrics.costPerChild;
    if (scaleFactor === 0) return [];

    return [
      { month: lang === 'en' ? 'Jan' : 'जनवरी', [lang === 'en' ? 'Cost per Transition' : 'प्रति सुधार लागत']: Math.round(scaleFactor * 1.08), [lang === 'en' ? 'Cost per Child' : 'प्रति छात्र लागत']: baseChildCost },
      { month: lang === 'en' ? 'Feb' : 'फरवरी', [lang === 'en' ? 'Cost per Transition' : 'प्रति सुधार लागत']: Math.round(scaleFactor * 1.05), [lang === 'en' ? 'Cost per Child' : 'प्रति छात्र लागत']: baseChildCost },
      { month: lang === 'en' ? 'Mar' : 'मार्च', [lang === 'en' ? 'Cost per Transition' : 'प्रति सुधार लागत']: Math.round(scaleFactor * 1.02), [lang === 'en' ? 'Cost per Child' : 'प्रति छात्र लागत']: baseChildCost },
      { month: lang === 'en' ? 'Apr' : 'अप्रैल', [lang === 'en' ? 'Cost per Transition' : 'प्रति सुधार लागत']: Math.round(scaleFactor * 0.99), [lang === 'en' ? 'Cost per Child' : 'प्रति छात्र लागत']: baseChildCost },
      { month: lang === 'en' ? 'May' : 'मई', [lang === 'en' ? 'Cost per Transition' : 'प्रति सुधार लागत']: scaleFactor, [lang === 'en' ? 'Cost per Child' : 'प्रति छात्र लागत']: baseChildCost }
    ];
  }, [costMetrics, lang]);

  return (
    <div className="min-h-screen text-slate-100 flex flex-col">
      {/* HEADER BAR */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400">
              <Award className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-300 bg-clip-text text-transparent">
                {t('title')}
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 font-medium">
                {t('subtitle')}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* HINDI / ENGLISH TOGGLE */}
            <button 
              id="btn-lang-toggle"
              onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
              className="glass-button flex items-center gap-2 border border-slate-700 hover:border-slate-500"
            >
              <Globe className="w-4 h-4 text-indigo-400" />
              <span className="text-sm font-bold uppercase tracking-wider text-slate-200">
                {lang === 'en' ? 'हिन्दी (Hindi)' : 'English'}
              </span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 w-full flex flex-col gap-6">
        
        {/* INTERACTIVE FILTERS CONTROLS */}
        <section className="glass-panel p-4 flex flex-wrap items-center gap-4 justify-between">
          <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm">
            <Filter className="w-4 h-4" />
            <span>{lang === 'en' ? 'DASHBOARD FILTERS' : 'डैशबोर्ड फ़िल्टर'}</span>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {/* District dropdown */}
            <div className="flex flex-col gap-1 w-full sm:w-40">
              <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">{t('district')}</label>
              <select 
                id="filter-district"
                value={filterDistrict} 
                onChange={(e) => setFilterDistrict(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-sm font-medium text-slate-100 focus:outline-none focus:border-indigo-500"
              >
                <option value="All">{t('all_districts')}</option>
                <option value="Gaya">Gaya (गया)</option>
                <option value="Patna">Patna (पटना)</option>
              </select>
            </div>

            {/* Age Group dropdown */}
            <div className="flex flex-col gap-1 w-full sm:w-36">
              <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">{t('age_group')}</label>
              <select 
                id="filter-age-group"
                value={filterAgeGroup} 
                onChange={(e) => setFilterAgeGroup(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-sm font-medium text-slate-100 focus:outline-none focus:border-indigo-500"
              >
                <option value="All">{t('all_ages')}</option>
                <option value="6-8">6 - 8 yrs</option>
                <option value="9-11">9 - 11 yrs</option>
                <option value="12-14">12 - 14 yrs</option>
              </select>
            </div>

            {/* Caste dropdown */}
            <div className="flex flex-col gap-1 w-full sm:w-36">
              <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">{t('caste')}</label>
              <select 
                id="filter-caste"
                value={filterCaste} 
                onChange={(e) => setFilterCaste(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-sm font-medium text-slate-100 focus:outline-none focus:border-indigo-500"
              >
                <option value="All">{t('all_castes')}</option>
                <option value="SC">SC (अनुसूचित जाति)</option>
                <option value="ST">ST (अनुसूचित जनजाति)</option>
                <option value="OBC">OBC (अन्य पिछड़ा वर्ग)</option>
                <option value="General">General (सामान्य)</option>
              </select>
            </div>

            {/* Reset filter button */}
            <button 
              id="btn-reset-filters"
              onClick={resetFilters}
              className="mt-5 p-2 bg-slate-900 border border-slate-800 rounded hover:bg-slate-800 hover:border-slate-600 text-slate-400 transition"
              title={lang === 'en' ? 'Reset Filters' : 'फ़िल्टर साफ़ करें'}
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </section>

        {/* TABS SELECTOR */}
        <nav className="flex overflow-x-auto border-b border-slate-800 gap-2 pb-1.5">
          <button 
            id="tab-btn-ed-view"
            onClick={() => setActiveTab('ed_view')}
            className={`px-4 py-2.5 text-sm font-bold border-b-2 whitespace-nowrap transition-all duration-200 ${
              activeTab === 'ed_view' 
                ? 'border-indigo-500 text-indigo-400 font-extrabold' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {t('tab_ed')}
          </button>
          <button 
            id="tab-btn-progress"
            onClick={() => setActiveTab('progress')}
            className={`px-4 py-2.5 text-sm font-bold border-b-2 whitespace-nowrap transition-all duration-200 ${
              activeTab === 'progress' 
                ? 'border-indigo-500 text-indigo-400 font-extrabold' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {t('tab_progress')}
          </button>
          <button 
            id="tab-btn-demographics"
            onClick={() => setActiveTab('demographics')}
            className={`px-4 py-2.5 text-sm font-bold border-b-2 whitespace-nowrap transition-all duration-200 ${
              activeTab === 'demographics' 
                ? 'border-indigo-500 text-indigo-400 font-extrabold' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {t('tab_demographics')}
          </button>
          <button 
            id="tab-btn-cost"
            onClick={() => setActiveTab('cost')}
            className={`px-4 py-2.5 text-sm font-bold border-b-2 whitespace-nowrap transition-all duration-200 ${
              activeTab === 'cost' 
                ? 'border-indigo-500 text-indigo-400 font-extrabold' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {t('tab_cost')}
          </button>
          <button 
            id="tab-btn-health"
            onClick={() => setActiveTab('health')}
            className={`px-4 py-2.5 text-sm font-bold border-b-2 whitespace-nowrap transition-all duration-200 ${
              activeTab === 'health' 
                ? 'border-indigo-500 text-indigo-400 font-extrabold' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {t('tab_health')}
          </button>
        </nav>

        {/* -------------------- VIEW 1: ED MONDAY VIEW -------------------- */}
        {activeTab === 'ed_view' && (
          <div className="flex flex-col gap-6">
            {/* Metrics cards grid */}
            <div className="grid-cols-layout">
              {/* Primary KPI Card: WLTR */}
              <div className="glass-panel p-5 flex flex-col justify-between border-t-4 border-t-indigo-500 relative overflow-hidden">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xs text-slate-400 font-bold uppercase tracking-wider">{t('wltr_title')}</h3>
                    <p className="text-xs text-slate-500 mt-1 leading-tight">{t('wltr_desc')}</p>
                  </div>
                  <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                    <Activity className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold text-white">{wltr}%</span>
                  <span className="text-xs text-emerald-400 font-bold flex items-center">
                    <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> +4.2%
                  </span>
                </div>
              </div>

              {/* Enrolled children card */}
              <div className="glass-panel p-5 flex flex-col justify-between border-t-4 border-t-emerald-500">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xs text-slate-400 font-bold uppercase tracking-wider">{t('total_children')}</h3>
                    <p className="text-xs text-slate-500 mt-1 leading-tight">{t('total_children_desc')}</p>
                  </div>
                  <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                    <Users className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-4xl font-extrabold text-white">{filteredData.length}</span>
                  <span className="text-xs text-slate-400 ml-2">({rawBeneficiaries.length} total raw)</span>
                </div>
              </div>

              {/* Cost per Transition card */}
              <div className="glass-panel p-5 flex flex-col justify-between border-t-4 border-t-amber-500">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xs text-slate-400 font-bold uppercase tracking-wider">{t('cost_per_transition')}</h3>
                    <p className="text-xs text-slate-500 mt-1 leading-tight">{t('cost_per_transition_desc')}</p>
                  </div>
                  <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400">
                    <DollarSign className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-4xl font-extrabold text-white">₹{costMetrics.costPerTransition}</span>
                </div>
              </div>

              {/* Data Quality Health Score card */}
              <div className="glass-panel p-5 flex flex-col justify-between border-t-4 border-t-rose-500">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xs text-slate-400 font-bold uppercase tracking-wider">{t('data_health_score')}</h3>
                    <p className="text-xs text-slate-500 mt-1 leading-tight">{t('data_health_score_desc')}</p>
                  </div>
                  <div className="p-2 bg-rose-500/10 rounded-lg text-rose-400">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-4xl font-extrabold text-white">{dataQualityScore}%</span>
                </div>
              </div>
            </div>

            {/* RAG Status named action box */}
            <div className={`p-5 rounded-xl border flex flex-col sm:flex-row gap-4 items-center justify-between ${
              ragStatus.status === 'healthy' 
                ? 'bg-emerald-950/40 border-emerald-800/60 glow-success' 
                : ragStatus.status === 'warning'
                ? 'bg-amber-950/40 border-amber-800/60 glow-warning'
                : 'bg-rose-950/40 border-rose-800/60 glow-error'
            }`}>
              <div className="flex items-center gap-3">
                {ragStatus.status === 'healthy' && <CheckCircle className="w-8 h-8 text-emerald-400 shrink-0" />}
                {ragStatus.status === 'warning' && <AlertTriangle className="w-8 h-8 text-amber-400 shrink-0" />}
                {ragStatus.status === 'critical' && <AlertOctagon className="w-8 h-8 text-rose-400 shrink-0" />}
                <div>
                  <h4 className="font-bold text-lg text-white">{ragStatus.text}</h4>
                  <p className="text-sm text-slate-300 mt-0.5 font-medium">{t('action')}: {ragStatus.action}</p>
                </div>
              </div>
              <div className="text-xs text-slate-400 bg-slate-900/60 border border-slate-800 px-3 py-1.5 rounded-lg shrink-0">
                {lang === 'en' ? 'Thresholds: Green ≥70%, Amber 50-69%, Red <50%' : 'सीमा: हरा ≥70%, पीला 50-69%, लाल <50%'}
              </div>
            </div>

            {/* Baseline vs Current learning progress charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="glass-panel p-5 lg:col-span-2 flex flex-col">
                <h3 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2 uppercase tracking-wide">
                  <BookOpen className="w-4 h-4 text-indigo-400" />
                  {lang === 'en' ? 'Literacy Progress: Baseline vs. Current Level' : 'अक्षर ज्ञान प्रगति: प्रारंभिक बनाम वर्तमान स्तर'}
                </h3>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={readingLevelStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }} />
                      <Legend verticalAlign="top" height={36} />
                      <Bar dataKey={lang === 'en' ? 'Baseline (Start)' : 'शुरुआत में'} fill="#64748b" radius={[4, 4, 0, 0]} />
                      <Bar dataKey={lang === 'en' ? 'Latest (Now)' : 'अब'} fill="#6366f1" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Simple Hindi explanatory panel with So What */}
              <div className="glass-panel p-5 flex flex-col justify-between bg-slate-900/40">
                <div>
                  <h4 className="text-xs text-indigo-400 font-extrabold uppercase tracking-widest">{lang === 'en' ? 'M&E ASSESSMENT EXPLAINED' : 'एमएंडई परीक्षण स्पष्टीकरण'}</h4>
                  <div className="mt-4 flex flex-col gap-3.5 text-sm leading-relaxed text-slate-300 font-medium">
                    <p>
                      {lang === 'en' 
                        ? 'Children are assessed weekly using the ASER model. Moving from "Letter" to "Word" marks a level jump.' 
                        : 'बच्चों का साप्ताहिक मूल्यांकन असर (ASER) पद्धति से किया जाता है। "अक्षर" से "शब्द" पढ़ना सीखने को स्तर में सुधार माना जाता है।'}
                    </p>
                    <p>
                      {lang === 'en'
                        ? 'This view validates that children in remedial centers are progressing through teaching at the right level.'
                        : 'यह दृश्य प्रमाणित करता है कि केंद्रों में नामांकित बच्चे सही स्तर की शिक्षण पद्धति से सीख रहे हैं।'}
                    </p>
                  </div>
                </div>

                <div className="mt-6 border-t border-slate-800 pt-4">
                  <h5 className="text-xs font-bold text-amber-400 mb-1.5 flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4" />
                    <span>{t('so_what')}</span>
                  </h5>
                  <p className="text-xs text-slate-300 italic font-medium leading-normal bg-slate-900/60 p-2.5 border border-slate-800/80 rounded-lg">
                    {t('ed_annotation')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* -------------------- VIEW 2: PROGRAM PROGRESS -------------------- */}
        {activeTab === 'progress' && (
          <div className="flex flex-col gap-6">
            <div className="grid-cols-layout">
              {/* Avg Completed sessions per center */}
              <div className="glass-panel p-5 flex flex-col border-l-4 border-l-indigo-500">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">{t('sessions_completed')}</span>
                <span className="text-3xl font-extrabold text-white mt-2">
                  {Math.round(centerDataStats.reduce((sum, c) => sum + c.completedSessions, 0) / centerDataStats.length)} / 60
                </span>
                <span className="text-xs text-slate-500 mt-1">{lang === 'en' ? 'Average sessions completed per center' : 'प्रति केंद्र पूर्ण की गईं औसत कक्षाएं'}</span>
              </div>

              {/* Completion Rate */}
              <div className="glass-panel p-5 flex flex-col border-l-4 border-l-emerald-500">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">{t('completion_rate')}</span>
                <span className="text-3xl font-extrabold text-white mt-2">
                  {Math.round((centerDataStats.reduce((sum, c) => sum + c.completedSessions, 0) / (centerDataStats.length * 60)) * 100)}%
                </span>
                <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div 
                    className="bg-emerald-500 h-full rounded-full" 
                    style={{ width: `${(centerDataStats.reduce((sum, c) => sum + c.completedSessions, 0) / (centerDataStats.length * 60)) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Velocity */}
              <div className="glass-panel p-5 flex flex-col border-l-4 border-l-amber-500">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">{t('velocity')}</span>
                <span className="text-3xl font-extrabold text-white mt-2">
                  {(centerDataStats.reduce((sum, c) => sum + c.velocity, 0) / centerDataStats.length).toFixed(1)} {lang === 'en' ? 'jumps' : 'सुधार'}
                </span>
                <span className="text-xs text-slate-500 mt-1">{lang === 'en' ? 'Average level transitions per child' : 'प्रति छात्र स्तर में औसत कुल सुधार'}</span>
              </div>

              {/* Projected cohort end date */}
              <div className="glass-panel p-5 flex flex-col border-l-4 border-l-rose-500">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">{t('projected_end')}</span>
                <span className="text-3xl font-extrabold text-white mt-2">{t('projected_end_val')}</span>
                <span className="text-xs text-slate-500 mt-1 font-semibold flex items-center gap-1 text-emerald-400">
                  <Calendar className="w-3.5 h-3.5" /> 8 {lang === 'en' ? 'weeks remaining' : 'सप्ताह शेष'}
                </span>
              </div>
            </div>

            {/* Target vs Completed Sessions per Center chart */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="glass-panel p-5 lg:col-span-2">
                <h3 className="text-sm font-bold text-slate-300 mb-4 uppercase tracking-wide">{t('target_vs_actual')}</h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={centerDataStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                      <Legend verticalAlign="top" height={36} />
                      <Bar dataKey="totalSessions" name={t('sessions_target')} fill="#1e293b" stroke="#475569" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="completedSessions" name={t('sessions_completed')} fill="#6366f1" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Curriculum velocity leaderboard */}
              <div className="glass-panel p-5 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-300 mb-3 uppercase tracking-wide">{lang === 'en' ? 'CURRICULUM VELOCITY LEADERBOARD' : 'पाठ्यक्रम गति लीडरबोर्ड'}</h3>
                  <div className="flex flex-col gap-3">
                    {centerDataStats.sort((a, b) => b.velocity - a.velocity).slice(0, 4).map((ctr, idx) => (
                      <div key={ctr.id} className="flex justify-between items-center bg-slate-950/30 p-2.5 rounded-lg border border-slate-800/80">
                        <div className="flex items-center gap-2.5">
                          <span className="w-5 h-5 flex items-center justify-center rounded-full bg-indigo-500/10 text-xs font-bold text-indigo-400">
                            {idx + 1}
                          </span>
                          <div>
                            <p className="text-xs font-bold text-white">{ctr.name}</p>
                            <p className="text-[10px] text-slate-400">{ctr.fwName}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-extrabold text-emerald-400">+{ctr.velocity} {lang === 'en' ? 'jumps' : 'सुधार'}</p>
                          <p className="text-[9px] text-slate-500">{ctr.completionRate}% {lang === 'en' ? 'sessions' : 'कक्षाएं'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 border-t border-slate-800 pt-4">
                  <h5 className="text-xs font-bold text-amber-400 mb-1 flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4" />
                    <span>{t('so_what')}</span>
                  </h5>
                  <p className="text-xs text-slate-300 italic leading-normal bg-slate-900/60 p-2.5 border border-slate-800/80 rounded-lg">
                    {t('progress_annotation')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* -------------------- VIEW 3: DEMOGRAPHIC REACH -------------------- */}
        {activeTab === 'demographics' && (
          <div className="flex flex-col gap-6">
            
            {/* Demographic reach visual summaries */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Gender Reach Pie */}
              <div className="glass-panel p-5 flex flex-col items-center">
                <h3 className="text-sm font-bold text-slate-300 mb-4 self-start uppercase tracking-wide">{t('reach_by_gender')}</h3>
                <div className="h-56 w-full flex justify-center items-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={demographicStats.genderChart}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {demographicStats.genderChart.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Caste Reach Bar */}
              <div className="glass-panel p-5 flex flex-col">
                <h3 className="text-sm font-bold text-slate-300 mb-4 uppercase tracking-wide">{t('reach_by_caste')}</h3>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={demographicStats.casteChart} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                      <Bar dataKey={lang === 'en' ? 'Children Enrolled' : 'नामांकित बच्चे'} fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* District Reach Bar */}
              <div className="glass-panel p-5 flex flex-col">
                <h3 className="text-sm font-bold text-slate-300 mb-4 uppercase tracking-wide">{t('reach_by_district')}</h3>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={demographicStats.districtChart} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                      <Bar dataKey={lang === 'en' ? 'Children Enrolled' : 'नामांकित बच्चे'} fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>

            {/* Gap Analysis and So What Annotation */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Dynamic Gap Analysis Card */}
              <div className="glass-panel p-5 lg:col-span-2 bg-slate-900/30 border-l-4 border-l-amber-500">
                <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wide flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-400" />
                  {t('gap_analysis')}
                </h3>
                <p 
                  className="text-slate-200 mt-3 text-sm leading-relaxed font-medium"
                  dangerouslySetInnerHTML={{ __html: gapAnalysisResult }}
                ></p>
                <div className="mt-4 flex gap-4 text-xs text-slate-400 font-bold bg-slate-950/30 p-3 rounded-lg border border-slate-800/80">
                  <div>
                    <span className="text-indigo-400">■</span> SC/ST Share: 25% (Target: 25%)
                  </div>
                  <div>
                    <span className="text-rose-400">■</span> Girl Share: 49% (Target: 50%)
                  </div>
                  <div>
                    <span className="text-emerald-400">■</span> Focus: Maner OBC Girls
                  </div>
                </div>
              </div>

              {/* So What annotation box */}
              <div className="glass-panel p-5 flex flex-col justify-between bg-slate-900/40">
                <div>
                  <h4 className="text-xs text-indigo-400 font-extrabold uppercase tracking-widest">{lang === 'en' ? 'INCLUSION COMPLIANCE' : 'समावेशिता अनुपालन'}</h4>
                  <p className="text-xs text-slate-400 mt-2 font-medium leading-relaxed">
                    {lang === 'en'
                      ? 'Our funding targets require at least 60% of beneficiaries from SC, ST, and OBC categories. The dashboard updates filters dynamically to show if some centers are not reaching minority groups.'
                      : 'हमारे डोनर लक्ष्यों के अनुसार कम से कम ६०% बच्चे एससी, एसटी और ओबीसी श्रेणियों से होने चाहिए। फ़िल्टर को बदलकर आप देख सकते हैं कि कौन से केंद्र पिछड़े वर्गों तक कम पहुंच रहे हैं।'}
                  </p>
                </div>
                <div className="mt-4 border-t border-slate-800 pt-3">
                  <h5 className="text-xs font-bold text-amber-400 mb-1 flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4" />
                    <span>{t('so_what')}</span>
                  </h5>
                  <p className="text-xs text-slate-300 italic leading-normal bg-slate-900/60 p-2.5 border border-slate-800/80 rounded-lg">
                    {t('demo_annotation')}
                  </p>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* -------------------- VIEW 4: COST-PER-IMPACT -------------------- */}
        {activeTab === 'cost' && (
          <div className="flex flex-col gap-6">
            <div className="grid-cols-layout">
              {/* Total Monthly Spend */}
              <div className="glass-panel p-5 flex flex-col border-l-4 border-l-indigo-500">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">{lang === 'en' ? 'Total Cohort Expenses' : 'कुल बैच खर्च'}</span>
                <span className="text-3xl font-extrabold text-white mt-2">₹{costMetrics.totalSpend.toLocaleString()}</span>
                <span className="text-xs text-slate-500 mt-1">{lang === 'en' ? 'Snack budget, material kits, and wages' : 'नाश्ता, सामग्री किट और शिक्षण मानदेय'}</span>
              </div>

              {/* Monthly Cost per Child */}
              <div className="glass-panel p-5 flex flex-col border-l-4 border-l-emerald-500">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">{t('cost_per_beneficiary')}</span>
                <span className="text-3xl font-extrabold text-white mt-2">₹{costMetrics.costPerChild}</span>
                <span className="text-xs text-slate-500 mt-1">{lang === 'en' ? 'Average cost per child per month' : 'प्रति छात्र प्रति माह औसत खर्च'}</span>
              </div>

              {/* Cost per Level transition */}
              <div className="glass-panel p-5 flex flex-col border-l-4 border-l-amber-500">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">{t('cost_per_jump')}</span>
                <span className="text-3xl font-extrabold text-white mt-2">₹{costMetrics.costPerTransition}</span>
                <span className="text-xs text-slate-500 mt-1">{lang === 'en' ? 'Spend per level improvement achieved' : 'अधिगम स्तर में सुधार पर खर्च की गई औसत राशि'}</span>
              </div>

              {/* Funding Efficiency Indicator */}
              <div className="glass-panel p-5 flex flex-col border-l-4 border-l-rose-500">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">{lang === 'en' ? 'Efficiency Index' : 'प्रभावोत्पादकता सूचकांक'}</span>
                <span className="text-3xl font-extrabold text-white mt-2">
                  {costMetrics.costPerTransition > 0 ? (10000 / costMetrics.costPerTransition).toFixed(1) : 0} {lang === 'en' ? 'Jumps / ₹10k' : 'सुधार / ₹१० हज़ार'}
                </span>
                <span className="text-xs text-slate-500 mt-1">{lang === 'en' ? 'Learning gains delivered per ₹10,000 spent' : 'प्रति ₹१०,००० खर्च पर बच्चों में हुए कुल स्तर सुधार'}</span>
              </div>
            </div>

            {/* Cost effectiveness line/bar chart */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="glass-panel p-5 lg:col-span-2">
                <h3 className="text-sm font-bold text-slate-300 mb-4 uppercase tracking-wide">{t('cost_trend')}</h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={costTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                      <Legend verticalAlign="top" height={36} />
                      <Line type="monotone" dataKey={lang === 'en' ? 'Cost per Transition' : 'प्रति सुधार लागत'} stroke="#f59e0b" strokeWidth={3} activeDot={{ r: 8 }} />
                      <Line type="monotone" dataKey={lang === 'en' ? 'Cost per Child' : 'प्रति छात्र लागत'} stroke="#10b981" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Cost-per-impact explanation card */}
              <div className="glass-panel p-5 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-indigo-400 mb-3 uppercase tracking-wide">{lang === 'en' ? 'FINANCE & DONOR METRICS' : 'वित्त और दाता मेट्रिक्स'}</h3>
                  <div className="text-xs text-slate-400 mt-2 font-medium leading-relaxed flex flex-col gap-3">
                    <p>
                      {lang === 'en'
                        ? 'Evaluators from J-PAL value cost-per-outcome metrics. This view calculates efficiency by dividing actual program costs by ASER level improvements.'
                        : 'जे-पाल (J-PAL) के मूल्यांकक प्रति-परिणाम-लागत मेट्रिक्स को अधिक महत्व देते हैं। यह दृश्य वास्तविक कार्यक्रम लागतों को बच्चों के स्तर सुधारों से विभाजित करके दक्षता की गणना करता है।'}
                    </p>
                    <p>
                      {lang === 'en'
                        ? 'Snacking costs represent 22% of center spend, followed by teaching assistant wages at 65%.'
                        : ' केंद्रों के खर्च में नाश्ते का हिस्सा २२% है, इसके बाद शिक्षक सहायक का मानदेय ६५% है।'}
                    </p>
                  </div>
                </div>

                <div className="mt-4 border-t border-slate-800 pt-3">
                  <h5 className="text-xs font-bold text-amber-400 mb-1.5 flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4" />
                    <span>{t('so_what')}</span>
                  </h5>
                  <p className="text-xs text-slate-300 italic leading-normal bg-slate-900/60 p-2.5 border border-slate-800/80 rounded-lg">
                    {t('cost_annotation')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* -------------------- VIEW 5: CENTER DATA HEALTH -------------------- */}
        {activeTab === 'health' && (
          <div className="flex flex-col gap-6">
            
            {/* Seeded errors summary card */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="glass-panel p-4 flex flex-col justify-between border-l-4 border-l-amber-500">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{t('flagged_jump')}</span>
                <span className="text-2xl font-extrabold text-white mt-1">{auditReport.impossibleJumps.length}</span>
                <span className="text-[9px] text-amber-400 font-bold">{lang === 'en' ? 'Audit required' : 'जांच आवश्यक'}</span>
              </div>
              <div className="glass-panel p-4 flex flex-col justify-between border-l-4 border-l-rose-500">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{t('flagged_oob')}</span>
                <span className="text-2xl font-extrabold text-white mt-1">{auditReport.oobLevels.length}</span>
                <span className="text-[9px] text-rose-400 font-bold">{lang === 'en' ? 'Invalid levels found' : 'अवैध डेटा'}</span>
              </div>
              <div className="glass-panel p-4 flex flex-col justify-between border-l-4 border-l-indigo-500">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{t('flagged_dupes')}</span>
                <span className="text-2xl font-extrabold text-white mt-1">{auditReport.duplicates.length}</span>
                <span className="text-[9px] text-indigo-400 font-bold">{lang === 'en' ? 'Duplicates removed' : 'डुप्लीकेट हटाए गए'}</span>
              </div>
              <div className="glass-panel p-4 flex flex-col justify-between border-l-4 border-l-emerald-500">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{t('flagged_missing')}</span>
                <span className="text-2xl font-extrabold text-white mt-1">{auditReport.missingDemographics.length}</span>
                <span className="text-[9px] text-emerald-400 font-bold">{lang === 'en' ? 'Warning details' : 'विवरण अपूर्ण'}</span>
              </div>
            </div>

            {/* Submission Lag and Error Rates per center charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Submission Lag by center */}
              <div className="glass-panel p-5">
                <h3 className="text-sm font-bold text-slate-300 mb-4 uppercase tracking-wide">{t('lag_by_center')}</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={centerDataStats} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                      <Bar dataKey="avgLag" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Error Rates by center */}
              <div className="glass-panel p-5">
                <h3 className="text-sm font-bold text-slate-300 mb-4 uppercase tracking-wide">{t('error_rate_by_center')}</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={centerDataStats} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                      <Bar dataKey="errorRate" fill="#ef4444" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>

            {/* Diagnostic Table showing list of flagged errors */}
            <div className="glass-panel p-5">
              <h3 className="text-sm font-bold text-rose-400 mb-4 uppercase tracking-wide flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-rose-500" />
                {t('field_notes')}
              </h3>
              
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>{lang === 'en' ? 'Beneficiary ID' : 'छात्र आईडी'}</th>
                      <th>{lang === 'en' ? 'Name' : 'नाम'}</th>
                      <th>{lang === 'en' ? 'Center / Village' : 'केंद्र / गांव'}</th>
                      <th>{lang === 'en' ? 'Assigned Field Worker' : 'फील्ड कार्यकर्ता'}</th>
                      <th>{lang === 'en' ? 'Anomaly Flag' : 'विसंगति प्रकार'}</th>
                      <th>{lang === 'en' ? 'Action Required' : 'आवश्यक कार्रवाई'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Combine errors for diagnostic table */}
                    {[
                      ...auditReport.duplicates.slice(0, 3), 
                      ...auditReport.oobLevels.slice(0, 3), 
                      ...auditReport.impossibleJumps.slice(0, 3), 
                      ...auditReport.missingDemographics.slice(0, 3)
                    ].map((row, idx) => (
                      <tr key={idx} className="border-b border-slate-800">
                        <td className="font-bold text-xs text-indigo-400">{row.beneficiary_id || 'N/A'}</td>
                        <td className="text-xs font-bold">{row.name || 'Anonymous Student'}</td>
                        <td className="text-xs">{row.center_name || 'Unassigned'} / {row.village || 'N/A'}</td>
                        <td className="text-xs font-medium">{row.field_worker_name || 'N/A'}</td>
                        <td className="text-xs font-bold text-amber-400 flex items-center gap-1 mt-1">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>{row.issue}</span>
                        </td>
                        <td className="text-xs text-slate-300 italic font-medium">
                          {row.issue.includes('Duplicate') 
                            ? (lang === 'en' ? 'Deduplicated. Merge files.' : 'डुप्लीकेट हटाया गया। फाइलें मर्ज करें।')
                            : row.issue.includes('Out-of-bound')
                            ? (lang === 'en' ? 'Retake reading assessment.' : 'पढ़ने का मूल्यांकन पुनः लें।')
                            : row.issue.includes('Impossible')
                            ? (lang === 'en' ? 'M&E officer random audit.' : 'एमएंडई अधिकारी द्वारा औचक ऑडिट।')
                            : (lang === 'en' ? 'Complete profile in registration sheet.' : 'पंजीकरण पत्रक में विवरण पूरा करें।')
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-950/20 p-3 rounded-lg border border-slate-800/80">
                <p className="text-xs text-slate-400 font-medium leading-relaxed">
                  {lang === 'en'
                    ? '⚠️ Ethical Reframing Note: This panel measures technical and logging indicators to guide supportive supervisor training and check infrastructure quality (network/lag), not to penalize field workers.'
                    : '⚠️ नैतिक ढांचा नोट: यह पैनल तकनीकी और रिपोर्टिंग विसंगतियों को मापता है ताकि कार्यकर्ताओं को प्रशिक्षण दिया जा सके और मोबाइल नेटवर्क की समस्याओं को समझा जा सके, न कि उन्हें दंडित करने के लिए।'}
                </p>
                <div className="text-xs font-bold text-amber-400 italic shrink-0 leading-normal bg-slate-900/60 p-2 border border-slate-800 rounded-lg max-w-sm">
                  <strong>{t('so_what')}</strong> {t('health_annotation')}
                </div>
              </div>
            </div>

          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-800 bg-slate-950 py-6 text-center text-xs text-slate-500 font-medium">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-2">
          <p>© 2026 Sopan Learning Initiative. All rights reserved.</p>
          <p className="flex items-center gap-1 text-slate-400">
            <span>Powered by</span> 
            <span className="font-bold text-indigo-400">Google Sheets Web Pipe</span>
            <span>&</span>
            <span className="font-bold text-emerald-400">React Client</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
