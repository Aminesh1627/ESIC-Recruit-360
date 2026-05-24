// Deterministic mock data generator for ESIC Recruit360

const seed = (n) => {
  let s = n;
  return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
};

const pick = (arr, r) => arr[Math.floor(r() * arr.length)];
const randInt = (min, max, r) => Math.floor(r() * (max - min + 1)) + min;

const POSTS = [
  { name: 'Assistant Director (IT)', code: 'AD-IT', group: 'A', cadre: 'Direct Recruitment' },
  { name: 'Insurance Medical Officer', code: 'IMO', group: 'A', cadre: 'Direct Recruitment' },
  { name: 'Stenographer', code: 'STN', group: 'C', cadre: 'Direct Recruitment' },
  { name: 'Upper Division Clerk', code: 'UDC', group: 'C', cadre: 'Direct Recruitment' },
  { name: 'Junior Engineer (Civil)', code: 'JE-C', group: 'B', cadre: 'Direct Recruitment' },
  { name: 'Social Security Officer', code: 'SSO', group: 'B', cadre: 'Direct Recruitment' },
  { name: 'Accounts Officer', code: 'AO', group: 'B', cadre: 'Direct Recruitment' },
  { name: 'Deputy Director (HR)', code: 'DD-HR', group: 'A', cadre: 'Promotion' },
  { name: 'Senior Pharmacist', code: 'SPH', group: 'B', cadre: 'Direct Recruitment' },
  { name: 'Multi Tasking Staff', code: 'MTS', group: 'C', cadre: 'Direct Recruitment' },
];

const DEPARTMENTS = ['ESIC HQ', 'Medical Division', 'Revenue', 'IT Division', 'HR & Administration', 'Finance', 'Vigilance'];
const LOCATIONS = ['New Delhi', 'Mumbai', 'Chennai', 'Kolkata', 'Bengaluru', 'Hyderabad', 'Ahmedabad', 'Lucknow', 'Jaipur'];
const CATEGORIES = ['General', 'OBC', 'SC', 'ST', 'EWS'];
const GENDERS = ['Male', 'Female', 'Other'];
const STATES = ['Delhi', 'Maharashtra', 'Tamil Nadu', 'West Bengal', 'Karnataka', 'Telangana', 'Gujarat', 'Uttar Pradesh'];
const INSTITUTES = ['IIT Delhi', 'Anna University', 'IIM Bangalore', 'JNU', 'Delhi University', 'Mumbai University', 'Madras Medical College', 'NIT Trichy', 'BITS Pilani'];
const DEGREES = ['B.Tech CSE', 'B.Tech EEE', 'MBBS', 'MD', 'M.Com', 'M.Sc Statistics', 'B.Com', 'MA Economics', 'B.A. LLB'];
const CERTS = ['CISA', 'PMP', 'CPA', 'AWS Solutions Architect', 'MBBS Council Cert', 'CA-IPCC', 'NEET PG', 'Hindi Typing 35 wpm'];
const FIRST_NAMES_M = ['Rajesh', 'Vikram', 'Ankit', 'Suresh', 'Mahesh', 'Arun', 'Pradeep', 'Karthik', 'Sandeep', 'Rohan'];
const FIRST_NAMES_F = ['Priya', 'Sneha', 'Anita', 'Lakshmi', 'Kavya', 'Pooja', 'Divya', 'Meera', 'Shalini', 'Ananya'];
const LAST_NAMES = ['Sharma', 'Verma', 'Iyer', 'Reddy', 'Patel', 'Kumar', 'Singh', 'Joshi', 'Nair', 'Gupta', 'Mishra', 'Khan'];
const COMPANIES = ['Infosys', 'TCS', 'Wipro', 'Govt of India - MoF', 'AIIMS', 'BHEL', 'SBI', 'LIC', 'IRCTC', 'Tech Mahindra'];

const DV_STATUSES = ['Pending', 'Verified', 'Deficient', 'Fraud Suspected', 'Rejected'];
const INTERVIEW_STATUSES = ['Scheduled', 'In Progress', 'Completed', 'No Show'];
const GRIEVANCE_STATUSES = ['Open', 'Assigned', 'In Review', 'Resolved', 'Closed', 'Rejected'];
const GRIEVANCE_TYPES = ['Application Issue', 'Result Discrepancy', 'Document Verification', 'Admit Card', 'Reservation', 'Fee Refund'];

function hashHex(n) {
  const r = seed(n * 1009 + 7);
  let h = '0x';
  for (let i = 0; i < 16; i++) h += '0123456789abcdef'[Math.floor(r() * 16)];
  return h;
}

function makeBlockchainEvents(r, count) {
  const events = [
    { entity: 'Vacancy', action: 'Created' },
    { entity: 'Vacancy', action: 'Submitted for Approval' },
    { entity: 'Vacancy', action: 'Finance Approved' },
    { entity: 'Vacancy', action: 'Reservation Approved' },
    { entity: 'Vacancy', action: 'Competent Authority Approved' },
    { entity: 'Vacancy', action: 'Published' },
    { entity: 'Application', action: 'Submitted' },
    { entity: 'Application', action: 'Eligibility Verified' },
    { entity: 'Document', action: 'Verified' },
    { entity: 'Interview', action: 'Scheduled' },
    { entity: 'Merit List', action: 'Generated' },
    { entity: 'Offer Letter', action: 'Generated' },
  ];
  const performers = ['admin@esic.gov.in', 'finance@esic.gov.in', 'reservation@esic.gov.in', 'rd@esic.gov.in', 'system@esic'];
  const validators = ['esic-validator-01.gov.in', 'esic-validator-02.gov.in', 'esic-validator-03.gov.in', 'esic-validator-rd-04.gov.in'];
  const out = [];
  const now = Date.now();
  const startBlock = 8_420_000;
  // 4 transactions per block on average for a realistic explorer view.
  for (let i = 0; i < count; i++) {
    const ev = events[Math.floor(r() * events.length)];
    const blockNum = startBlock + Math.floor(i / 4);
    out.push({
      id: `BC-${(i + 1).toString().padStart(5, '0')}`,
      hash: hashHex(i + 1),
      timestamp: new Date(now - randInt(0, 60 * 24 * 60 * 60 * 1000, r)).toISOString(),
      entity: ev.entity,
      action: ev.action,
      performedBy: performers[Math.floor(r() * performers.length)],
      verified: r() > 0.05,
      block: blockNum,
      parentHash: hashHex(Math.max(1, i)),
      gasSavings: (88 + r() * 11).toFixed(2),
      validator: validators[Math.floor(r() * validators.length)],
    });
  }
  return out.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

export function buildMockDb() {
  const r = seed(42);

  const vacancies = [];
  for (let i = 1; i <= 100; i++) {
    const post = pick(POSTS, r);
    const total = randInt(1, 25, r);
    const status = i <= 8 ? 'Draft'
      : i <= 18 ? 'Submitted'
      : i <= 28 ? 'Under Review'
      : i <= 36 ? 'Finance Review'
      : i <= 44 ? 'Reservation Review'
      : i <= 60 ? 'Approved'
      : i <= 92 ? 'Published'
      : 'Closed';
    const ur = Math.floor(total * 0.4), obc = Math.floor(total * 0.27), sc = Math.floor(total * 0.15), st = Math.floor(total * 0.075);
    const ews = Math.max(0, total - ur - obc - sc - st);
    vacancies.push({
      id: `VAC-2025-${i.toString().padStart(4, '0')}`,
      postName: post.name, postCode: post.code, group: post.group, cadre: post.cadre,
      department: pick(DEPARTMENTS, r),
      payMatrix: `Level-${randInt(4, 14, r)}`,
      payScale: `₹${randInt(35, 200, r) * 1000} - ₹${randInt(180, 280, r) * 1000}`,
      recruitmentType: post.cadre,
      totalVacancies: total,
      reservation: { UR: ur, OBC: obc, SC: sc, ST: st, EWS: ews },
      rosterPoint: `RP-${randInt(100, 999, r)}`,
      backlog: r() > 0.7,
      location: pick(LOCATIONS, r),
      ageLimit: pick([28, 30, 32, 35, 40, 56], r),
      ageRelaxation: 'As per Govt Rules',
      experience: { min: randInt(0, 5, r), max: randInt(8, 18, r) },
      qualification: pick(DEGREES, r),
      certificationReq: r() > 0.5 ? pick(CERTS, r) : '—',
      selectionStages: ['CBT', 'Skill Test', 'DV', 'Interview'].slice(0, randInt(2, 4, r)),
      jobDescription: 'Drive recruitment lifecycle execution per ESIC service rules and DOPT guidelines. Ensure compliance with reservation matrix and audit trail integrity.',
      remarks: '—',
      status,
      createdBy: 'estab.officer@esic.gov.in',
      createdAt: new Date(Date.now() - randInt(1, 180, r) * 86400000).toISOString(),
      applications: randInt(40, 950, r),
      approvals: [
        { stage: 'Department Head', status: i > 10 ? 'Approved' : 'Pending', by: 'dept.head@esic.gov.in', at: new Date(Date.now() - randInt(1, 60, r) * 86400000).toISOString(), comment: 'Recommended.' },
        { stage: 'Finance', status: i > 28 ? 'Approved' : (i > 20 ? 'In Review' : 'Pending'), by: 'finance@esic.gov.in', at: new Date(Date.now() - randInt(1, 40, r) * 86400000).toISOString(), comment: 'Budget allocated.' },
        { stage: 'Reservation Cell', status: i > 36 ? 'Approved' : 'Pending', by: 'reservation@esic.gov.in', at: new Date(Date.now() - randInt(1, 30, r) * 86400000).toISOString(), comment: 'Roster verified.' },
        { stage: 'Competent Authority', status: i > 44 ? 'Approved' : 'Pending', by: 'authority@esic.gov.in', at: new Date(Date.now() - randInt(1, 20, r) * 86400000).toISOString(), comment: 'Approved for publication.' },
      ],
      blockchain: { hash: hashHex(i), timestamp: new Date(Date.now() - randInt(1, 60, r) * 86400000).toISOString(), verified: true },
    });
  }

  const candidates = [];
  for (let i = 1; i <= 500; i++) {
    const gender = pick(GENDERS, r);
    const first = gender === 'Female' ? pick(FIRST_NAMES_F, r) : pick(FIRST_NAMES_M, r);
    const last = pick(LAST_NAMES, r);
    const switches = randInt(0, 5, r);
    const totalExp = randInt(2, 22, r);
    const educationList = [
      { degree: pick(DEGREES, r), institute: pick(INSTITUTES, r), year: 2000 + randInt(0, 22, r), percent: randInt(60, 92, r) }
    ];
    if (r() > 0.4) educationList.push({ degree: 'M.Tech / PG', institute: pick(INSTITUTES, r), year: 2010 + randInt(0, 14, r), percent: randInt(62, 88, r) });

    const experienceList = [];
    let startYear = 2024 - totalExp;
    let curSal = randInt(3, 9, r);
    for (let j = 0; j <= switches; j++) {
      const dur = Math.max(1, Math.floor(totalExp / (switches + 1)) + (j === switches ? totalExp % (switches + 1) : 0));
      experienceList.push({
        company: pick(COMPANIES, r),
        designation: pick(['Officer', 'Manager', 'Sr. Manager', 'Engineer', 'Analyst', 'Consultant'], r),
        startDate: `${startYear}-01-01`,
        endDate: `${startYear + dur}-12-31`,
        salary: curSal,
      });
      startYear += dur;
      curSal += randInt(1, 4, r);
    }

    candidates.push({
      id: `CAN-${i.toString().padStart(5, '0')}`,
      firstName: first, lastName: last, gender,
      dob: `${1980 + randInt(0, 22, r)}-${String(randInt(1, 12, r)).padStart(2, '0')}-${String(randInt(1, 28, r)).padStart(2, '0')}`,
      mobile: `+91 9${randInt(100000000, 999999999, r)}`,
      email: `${first.toLowerCase()}.${last.toLowerCase()}${i}@example.com`,
      address: `${randInt(1, 999, r)}, ${pick(['MG Road', 'Park Street', 'Ring Road', 'Andheri West', 'T Nagar'], r)}`,
      state: pick(STATES, r),
      district: pick(['North', 'South', 'East', 'West', 'Central'], r),
      pincode: String(randInt(110001, 800999, r)),
      identityType: pick(['Aadhaar', 'PAN', 'Passport'], r),
      identityNumber: 'XXXX-XXXX-' + randInt(1000, 9999, r),
      category: pick(CATEGORIES, r),
      pwd: r() > 0.92, exServiceman: r() > 0.94, ews: false,
      photo: `https://i.pravatar.cc/120?img=${(i % 70) + 1}`,
      education: educationList,
      experience: experienceList,
      certifications: r() > 0.4 ? [
        { name: pick(CERTS, r), issuer: pick(['ISACA', 'PMI', 'AWS', 'Govt of India', 'NIIT'], r), validity: 2025 + randInt(0, 5, r), verified: r() > 0.2 }
      ] : [],
      totalExperience: totalExp,
      relevantExperience: Math.max(1, totalExp - randInt(0, 4, r)),
      switchCount: switches,
      avgTenure: parseFloat((totalExp / (switches + 1)).toFixed(1)),
      currentSalary: curSal,
      highestSalary: curSal,
      profileCompleteness: randInt(72, 100, r),
      documents: [
        { name: 'Photograph', status: pick(DV_STATUSES, r) },
        { name: 'Signature', status: pick(DV_STATUSES, r) },
        { name: 'Degree Certificate', status: pick(DV_STATUSES, r) },
        { name: 'Category Certificate', status: pick(DV_STATUSES, r) },
        { name: 'Experience Letter', status: pick(DV_STATUSES, r) },
      ],
    });
  }

  const applications = [];
  for (let i = 1; i <= 2000; i++) {
    const vac = vacancies[randInt(0, vacancies.length - 1, r)];
    const cand = candidates[randInt(0, candidates.length - 1, r)];
    const status = i <= 600 ? 'Eligible' : i <= 1200 ? 'Under Review' : i <= 1500 ? 'Borderline' : i <= 1800 ? 'Submitted' : 'Rejected';
    applications.push({
      id: `APP-${i.toString().padStart(6, '0')}`,
      vacancyId: vac.id, vacancyName: vac.postName,
      candidateId: cand.id, candidateName: `${cand.firstName} ${cand.lastName}`,
      candidatePhoto: cand.photo, category: cand.category,
      submittedAt: new Date(Date.now() - randInt(1, 90, r) * 86400000).toISOString(),
      status,
      cbtScore: randInt(40, 99, r),
      dvStatus: pick(DV_STATUSES, r),
      eligibility: {
        age: status !== 'Rejected',
        qualification: status !== 'Rejected',
        experience: status === 'Eligible' || status === 'Borderline',
        reservation: true,
      },
    });
  }

  const panels = [];
  for (let i = 1; i <= 20; i++) {
    panels.push({
      id: `PNL-${i.toString().padStart(3, '0')}`,
      name: `Interview Panel ${i}`,
      members: [
        { name: 'Dr. ' + pick(LAST_NAMES, r), role: 'Chairperson', weightage: 40 },
        { name: 'Smt. ' + pick(LAST_NAMES, r), role: 'Subject Expert', weightage: 35 },
        { name: 'Shri ' + pick(LAST_NAMES, r), role: 'HR Representative', weightage: 25 },
      ],
      vacancy: pick(vacancies.filter(v => v.status === 'Published'), r)?.postName || POSTS[0].name,
      candidates: randInt(8, 35, r),
      schedule: new Date(Date.now() + randInt(1, 30, r) * 86400000).toISOString(),
      status: pick(INTERVIEW_STATUSES, r),
    });
  }

  const grievances = [];
  for (let i = 1; i <= 50; i++) {
    const cand = candidates[randInt(0, candidates.length - 1, r)];
    grievances.push({
      id: `GRV-${i.toString().padStart(4, '0')}`,
      type: pick(GRIEVANCE_TYPES, r),
      subject: pick([
        'Admit card not received', 'CBT score discrepancy', 'Document upload failed',
        'Reservation category not reflected', 'Fee not refunded', 'Result not visible',
      ], r),
      candidateId: cand.id,
      candidateName: `${cand.firstName} ${cand.lastName}`,
      priority: pick(['High', 'Medium', 'Low'], r),
      status: pick(GRIEVANCE_STATUSES, r),
      assignedTo: pick(['grievance.officer@esic.gov.in', 'rd@esic.gov.in', 'support@esic.gov.in'], r),
      raisedAt: new Date(Date.now() - randInt(1, 30, r) * 86400000).toISOString(),
      sla: randInt(1, 14, r),
    });
  }

  const blockchain = makeBlockchainEvents(r, 120);

  const merit = applications.filter(a => a.status === 'Eligible')
    .slice(0, 50)
    .map((a, idx) => ({
      rank: idx + 1, ...a,
      finalScore: parseFloat((a.cbtScore * 0.6 + randInt(60, 95, r) * 0.4).toFixed(2)),
      interviewScore: randInt(60, 95, r),
      dvScore: a.dvStatus === 'Verified' ? 10 : 5,
    }))
    .sort((a, b) => b.finalScore - a.finalScore)
    .map((m, idx) => ({ ...m, rank: idx + 1 }));

  const offers = merit.slice(0, 18).map((m, idx) => ({
    id: `OFR-${(idx + 1).toString().padStart(4, '0')}`,
    candidateId: m.candidateId, candidateName: m.candidateName, candidatePhoto: m.candidatePhoto,
    post: m.vacancyName,
    payLevel: `Level-${randInt(6, 12, r)}`,
    issuedAt: new Date(Date.now() - randInt(1, 20, r) * 86400000).toISOString(),
    joiningDate: new Date(Date.now() + randInt(15, 60, r) * 86400000).toISOString(),
    status: pick(['Draft', 'Sent', 'Digitally Signed', 'Accepted', 'Declined', 'Extension Requested'], r),
  }));

  const results = vacancies.filter(v => v.status === 'Published').slice(0, 12).map((v, i) => ({
    id: `RES-${(i + 1).toString().padStart(4, '0')}`,
    vacancy: v.postName, vacancyId: v.id,
    totalSelected: Math.max(1, Math.floor(v.totalVacancies * 0.9)),
    publishedAt: new Date(Date.now() - randInt(1, 25, r) * 86400000).toISOString(),
    status: pick(['Draft', 'Approved', 'Published'], r),
  }));

  const workflows = [
    { id: 'WF-001', name: 'Vacancy Approval Workflow', steps: ['Create', 'Submit', 'Dept. Head', 'Finance', 'Reservation Cell', 'Competent Authority', 'Publish'], active: true, createdAt: new Date(Date.now() - 30 * 86400000).toISOString() },
    { id: 'WF-002', name: 'Document Verification Workflow', steps: ['Upload', 'AI Pre-check', 'DV Officer Review', 'Verification', 'Sign-off'], active: true, createdAt: new Date(Date.now() - 24 * 86400000).toISOString() },
    { id: 'WF-003', name: 'Interview Scheduling Workflow', steps: ['Shortlist', 'Panel Assignment', 'Slot Booking', 'Candidate Notification', 'Conduct', 'Score Submission'], active: true, createdAt: new Date(Date.now() - 18 * 86400000).toISOString() },
    { id: 'WF-004', name: 'Grievance Resolution Workflow', steps: ['Open', 'Assign', 'In Review', 'Resolution', 'Closure'], active: true, createdAt: new Date(Date.now() - 12 * 86400000).toISOString() },
  ];

  const PERMS = ['view', 'create', 'approve', 'reject', 'publish', 'audit'];
  const roles = [
    'Candidate', 'Recruitment Administrator', 'Establishment Officer', 'Department Head',
    'HR Officer', 'Reservation Cell Officer', 'Finance Officer', 'Screening Officer',
    'DV Officer', 'Interview Panel Member', 'Grievance Officer', 'Competent Authority',
    'Regional Director', 'Super Admin',
  ].map((name, i) => ({
    id: `ROLE-${(i + 1).toString().padStart(2, '0')}`, name,
    users: randInt(1, 24, r),
    permissions: PERMS.filter(() => r() > 0.4),
    active: true,
    createdAt: new Date(Date.now() - randInt(60, 500, r) * 86400000).toISOString(),
  }));

  const masterData = {
    'Pay Matrix Levels': ['Level-4', 'Level-6', 'Level-7', 'Level-8', 'Level-10', 'Level-11', 'Level-12', 'Level-13', 'Level-14'],
    'Departments': DEPARTMENTS,
    'Locations': LOCATIONS,
    'Cadres': ['Direct Recruitment', 'Promotion', 'Deputation', 'Lateral Entry'],
    'Categories': CATEGORIES,
    'Identity Types': ['Aadhaar', 'PAN', 'Passport', 'Voter ID', 'Driving License'],
    'Document Types': ['Photograph', 'Signature', 'Degree Certificate', 'Category Certificate', 'Experience Letter', 'PwD Certificate'],
    'States & Districts': STATES,
    'Selection Stages': ['CBT', 'Skill Test', 'Document Verification', 'Interview', 'Medical Test'],
  };

  return { vacancies, candidates, applications, panels, grievances, blockchain, merit, offers, results, workflows, roles, masterData };
}
