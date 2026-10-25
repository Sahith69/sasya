// src/data/adminMockData.js - Comprehensive Mock Data Store for Sasya Admin Console

export const ADMIN_SUBMISSIONS = [
  {
    id: 'SUB-9401',
    farmerId: 'farmer_KA_101',
    farmerName: 'Ramesh K',
    village: 'Venur',
    district: 'Dakshina Kannada',
    state: 'Karnataka',
    crop: 'Arecanut',
    suspectedDisease: 'Koleroga (Fruit Rot)',
    pathogen: 'Phytophthora meadii',
    aiPrediction: 'Koleroga',
    aiConfidence: 0.964,
    aiSeverity: 'Grade 2 (Moderate: 8.4%)',
    image: '/samples/sample_arecanut.jpg',
    bountyAmount: 15.00,
    qualityScore: 94,
    laplacianVariance: 412,
    status: 'Pending',
    submittedAt: '2026-10-24 14:15',
    reviewerNotes: '',
    verifiedBy: null,
    flagged: false
  },
  {
    id: 'SUB-9402',
    farmerId: 'farmer_HP_202',
    farmerName: 'Kuldeep S',
    village: 'Kotkhai',
    district: 'Shimla',
    state: 'Himachal Pradesh',
    crop: 'Apple',
    suspectedDisease: 'Apple Scab',
    pathogen: 'Venturia inaequalis',
    aiPrediction: 'Apple Scab',
    aiConfidence: 0.971,
    aiSeverity: 'Grade 1 (Mild: 1.8%)',
    image: '/samples/sample_apple.jpg',
    bountyAmount: 15.00,
    qualityScore: 96,
    laplacianVariance: 485,
    status: 'Pending',
    submittedAt: '2026-10-24 12:40',
    reviewerNotes: '',
    verifiedBy: null,
    flagged: false
  },
  {
    id: 'SUB-9403',
    farmerId: 'farmer_KA_108',
    farmerName: 'Ganesh M',
    village: 'Mandagadde',
    district: 'Shimoga',
    state: 'Karnataka',
    crop: 'Paddy',
    suspectedDisease: 'Leaf Blast',
    pathogen: 'Magnaporthe oryzae',
    aiPrediction: 'Leaf Blast',
    aiConfidence: 0.948,
    aiSeverity: 'Grade 2 (Moderate: 6.2%)',
    image: '/samples/sample_paddy.jpg',
    bountyAmount: 10.00,
    qualityScore: 91,
    laplacianVariance: 378,
    status: 'Pending',
    submittedAt: '2026-10-24 10:18',
    reviewerNotes: '',
    verifiedBy: null,
    flagged: false
  },
  {
    id: 'SUB-9404',
    farmerId: 'farmer_KA_112',
    farmerName: 'Suresh R',
    village: 'Belthangady',
    district: 'Dakshina Kannada',
    state: 'Karnataka',
    crop: 'Tomato',
    suspectedDisease: 'Early Blight',
    pathogen: 'Alternaria solani',
    aiPrediction: 'Early Blight',
    aiConfidence: 0.936,
    aiSeverity: 'Grade 2 (Moderate: 9.1%)',
    image: '/samples/sample_tomato.jpg',
    bountyAmount: 12.00,
    qualityScore: 89,
    laplacianVariance: 340,
    status: 'Approved',
    submittedAt: '2026-10-24 08:30',
    reviewerNotes: 'Concentric rings clearly visible on lower foliage. Approved for Karnataka Open Ag AI dataset.',
    verifiedBy: 'Dr. Subrahmanya K',
    flagged: false
  },
  {
    id: 'SUB-9405',
    farmerId: 'farmer_KA_119',
    farmerName: 'Praveen K',
    village: 'Brahmavar',
    district: 'Udupi',
    state: 'Karnataka',
    crop: 'Arecanut',
    suspectedDisease: 'Yellow Leaf Disease',
    pathogen: 'Phytoplasma',
    aiPrediction: 'Yellow Leaf Disease',
    aiConfidence: 0.884,
    aiSeverity: 'Grade 3 (Severe: 22.4%)',
    image: '/samples/sample_arecanut.jpg',
    bountyAmount: 18.00,
    qualityScore: 92,
    laplacianVariance: 395,
    status: 'Approved',
    submittedAt: '2026-10-23 16:50',
    reviewerNotes: 'Severe chlorosis extending along midrib. High research value for coastal variety resistance.',
    verifiedBy: 'Dr. Rekha M',
    flagged: false
  },
  {
    id: 'SUB-9406',
    farmerId: 'farmer_KA_130',
    farmerName: 'Manjunath P',
    village: 'Sullia',
    district: 'Dakshina Kannada',
    state: 'Karnataka',
    crop: 'Arecanut',
    suspectedDisease: 'Bud Borer Damage',
    pathogen: 'Conogethes punctiferalis',
    aiPrediction: 'Bud Borer',
    aiConfidence: 0.725,
    aiSeverity: 'Grade 1 (Mild)',
    image: '/samples/sample_arecanut.jpg',
    bountyAmount: 12.00,
    qualityScore: 78,
    laplacianVariance: 180,
    status: 'Corrected',
    submittedAt: '2026-10-23 11:20',
    reviewerNotes: 'AI tagged as Bud Borer; manual inspection confirms early stage Koleroga water-soaking. Re-labeled to Koleroga.',
    verifiedBy: 'Dr. Subrahmanya K',
    flagged: true
  },
  {
    id: 'SUB-9407',
    farmerId: 'farmer_KA_145',
    farmerName: 'Anonymous User #882',
    village: 'Mangaluru',
    district: 'Dakshina Kannada',
    state: 'Karnataka',
    crop: 'Non-Crop',
    suspectedDisease: 'Unknown',
    pathogen: 'N/A',
    aiPrediction: 'Non-Crop / Out of Distribution',
    aiConfidence: 0.00,
    aiSeverity: 'OOD (Rejection DM = 48.7)',
    image: '/samples/sample_noncrop.jpg',
    bountyAmount: 0.00,
    qualityScore: 20,
    laplacianVariance: 45,
    status: 'Rejected',
    submittedAt: '2026-10-23 09:12',
    reviewerNotes: 'Automated Mahalanobis OOD Guard rejection: desk/object detected, not a genuine leaf.',
    verifiedBy: 'System Auto-Gatekeeper',
    flagged: true
  }
];

export const ADMIN_FARMERS = [
  {
    id: 'farmer_KA_101',
    name: 'Ramesh K',
    phone: '00000 10101',
    district: 'Dakshina Kannada',
    taluk: 'Belthangady',
    village: 'Venur',
    landSize: '4.0 Acres',
    crops: ['Arecanut', 'Paddy'],
    upiId: 'ramesh@oksbi',
    submissionsCount: 14,
    approvedCount: 12,
    rejectedCount: 1,
    totalBountiesEarned: 168.00,
    trustScore: 98,
    trustTier: 'Elite Contributor',
    joinedDate: '2026-08-14',
    flags: []
  },
  {
    id: 'farmer_HP_202',
    name: 'Kuldeep S',
    phone: '00000 20202',
    district: 'Shimla',
    taluk: 'Theog',
    village: 'Kotkhai',
    landSize: '3.5 Acres',
    crops: ['Apple'],
    upiId: 'kuldeep@okicici',
    submissionsCount: 9,
    approvedCount: 9,
    rejectedCount: 0,
    totalBountiesEarned: 135.00,
    trustScore: 100,
    trustTier: 'Elite Contributor',
    joinedDate: '2026-09-02',
    flags: []
  },
  {
    id: 'farmer_KA_108',
    name: 'Ganesh M',
    phone: '00000 10808',
    district: 'Shimoga',
    taluk: 'Tirthahalli',
    village: 'Mandagadde',
    landSize: '5.2 Acres',
    crops: ['Arecanut', 'Paddy'],
    upiId: 'ganesh@oksbi',
    submissionsCount: 11,
    approvedCount: 10,
    rejectedCount: 1,
    totalBountiesEarned: 122.00,
    trustScore: 94,
    trustTier: 'Verified Grower',
    joinedDate: '2026-08-20',
    flags: []
  },
  {
    id: 'farmer_KA_112',
    name: 'Suresh R',
    phone: '00000 11212',
    district: 'Dakshina Kannada',
    taluk: 'Belthangady',
    village: 'Belthangady',
    landSize: '2.8 Acres',
    crops: ['Tomato', 'Paddy'],
    upiId: 'suresh@hdfc',
    submissionsCount: 7,
    approvedCount: 6,
    rejectedCount: 1,
    totalBountiesEarned: 74.00,
    trustScore: 90,
    trustTier: 'Verified Grower',
    joinedDate: '2026-09-15',
    flags: []
  },
  {
    id: 'farmer_KA_145',
    name: 'Anonymous User #882',
    phone: '00000 99882',
    district: 'Dakshina Kannada',
    taluk: 'Mangaluru',
    village: 'Mangaluru',
    landSize: '0.5 Acres',
    crops: ['Unknown'],
    upiId: 'unknown@paytm',
    submissionsCount: 4,
    approvedCount: 0,
    rejectedCount: 4,
    totalBountiesEarned: 0.00,
    trustScore: 25,
    trustTier: 'Suspended / Watchlist',
    joinedDate: '2026-10-21',
    flags: ['Repeated Non-Crop Uploads', 'OOD Guard Triggered 4x']
  }
];

export const ADMIN_ANALYTICS_OVERVIEW = {
  totalSubmissions: 1248,
  verifiedThisMonth: 894,
  pendingReview: 3,
  rejectedQuality: 82,
  totalBountyDisbursed: 14850.00,
  averageReviewTimeHours: 1.8,
  expertAgreementRate: 96.8,
  activeGrowers: 420,
  spatialPrivacyAnonymityK: 5
};

export const ADMIN_SUBMISSIONS_BY_CROP = [
  { crop: 'Arecanut', count: 542, percentage: '43.4%', verified: 504, pending: 22, rejected: 16, color: '#22C55E' },
  { crop: 'Paddy', count: 380, percentage: '30.4%', verified: 352, pending: 18, rejected: 10, color: '#F6D05F' },
  { crop: 'Tomato', count: 198, percentage: '15.9%', verified: 178, pending: 12, rejected: 8, color: '#B5483A' },
  { crop: 'Apple', count: 128, percentage: '10.3%', verified: 121, pending: 4, rejected: 3, color: '#38BDF8' }
];

export const ADMIN_SUBMISSIONS_BY_DISTRICT = [
  { district: 'Dakshina Kannada', state: 'Karnataka', count: 490, topCrop: 'Arecanut', activeGrowers: 164 },
  { district: 'Shimoga', state: 'Karnataka', count: 310, topCrop: 'Paddy & Areca', activeGrowers: 112 },
  { district: 'Udupi', state: 'Karnataka', count: 225, topCrop: 'Paddy & Areca', activeGrowers: 76 },
  { district: 'Shimla', state: 'Himachal Pradesh', count: 128, topCrop: 'Apple', activeGrowers: 44 },
  { district: 'Chikkamagaluru', state: 'Karnataka', count: 95, topCrop: 'Coffee & Areca', activeGrowers: 24 }
];

export const ADMIN_VERIFICATION_METRICS = {
  overallApprovalRate: '89.2%',
  rejectionRate: '6.5%',
  correctionRate: '4.3%',
  avgTurnaroundMinutes: 108, // 1.8 hrs
  slaCompliance4Hours: '98.4%',
  reviewerStats: [
    { name: 'Dr. Subrahmanya K', institution: 'Regional Agronomy Center', reviewed: 12, approvalRate: '91.2%', avgTime: '1.2h' },
    { name: 'Dr. Roopa M', institution: 'ARS Gangavathi', reviewed: 9, approvalRate: '88.5%', avgTime: '1.9h' },
    { name: 'Dr. Srinivas M', institution: 'HES Kolar', reviewed: 11, approvalRate: '87.1%', avgTime: '2.4h' }
  ]
};

export const ADMIN_CONFUSION_MATRIX = {
  classes: ['Koleroga', 'Blast', 'Scab', 'Early Blight', 'Healthy'],
  matrix: [
    [184, 2, 0, 1, 3],  // Koleroga
    [1, 142, 0, 3, 2],  // Blast
    [0, 0, 128, 1, 2],  // Scab
    [2, 3, 1, 115, 2],  // Early Blight
    [2, 1, 1, 2, 190]   // Healthy
  ]
};

export const ADMIN_GATE_REJECTIONS = [
  { gate: 'Mahalanobis OOD Distance (DM > 24.5)', count: 42, percentage: '48%', reason: 'Non-crop / non-plant imagery (hands, boots, screens, walls)' },
  { gate: 'Laplacian Blur / Focus Filter (< 100)', count: 28, percentage: '32%', reason: 'Out-of-focus or motion-blurred smartphone cameras' },
  { gate: 'Crop Domain Gatekeeper Misclassification', count: 12, percentage: '14%', reason: 'Cross-crop confusion (e.g. coconut uploaded in arecanut mode)' },
  { gate: 'Perianth / Lesion Segmentation Ratio (< 0.5%)', count: 5, percentage: '6%', reason: 'Healthy leaves submitted claiming disease bounty' }
];

export const ADMIN_BOUNTY_SPEND = {
  totalBudget: 50000.00,
  spentToDate: 14850.00,
  remainingBudget: 35150.00,
  averageCostPerVerifiedLeaf: 13.20,
  monthlySpendCurve: [
    { month: 'Jul', spend: 1800, verified: 120 },
    { month: 'Aug', spend: 3400, verified: 240 },
    { month: 'Sep', spend: 4200, verified: 290 },
    { month: 'Oct (To Date)', spend: 5450, verified: 360 }
  ]
};

export const ADMIN_COMMUNITY_STATS = [
  { sub: 's/arecanut', members: 24, postsThisWeek: 4, activeRentals: 1, resolvedQueries: 3 },
  { sub: 's/paddy', members: 31, postsThisWeek: 2, activeRentals: 1, resolvedQueries: 2 },
  { sub: 's/apple', members: 14, postsThisWeek: 2, activeRentals: 0, resolvedQueries: 1 },
  { sub: 's/tomato', members: 18, postsThisWeek: 2, activeRentals: 1, resolvedQueries: 2 }
];

export const ADMIN_MODERATION_ITEMS = [
  {
    id: 'MOD-101',
    reportedBy: 'Ganesh M',
    targetType: 'Community Post',
    targetTitle: 'Selling unauthorized chemical compound for Koleroga guarantee',
    author: 'Unknown Vendor #41',
    reason: 'Unregistered hazardous chemical claim violating CIB&RC regulations',
    status: 'Pending Action',
    reportedAt: '2026-10-24 15:02'
  },
  {
    id: 'MOD-102',
    reportedBy: 'Prashanth P',
    targetType: 'Equipment Listing',
    targetTitle: 'Power Sprayer Rental ₹2500/day (Exorbitant rate)',
    author: 'Commercial Middleman',
    reason: 'Price gouging during critical 18-hour pre-rain spray emergency',
    status: 'Resolved (Warning Issued)',
    reportedAt: '2026-10-23 18:20'
  }
];

export const ADMIN_EXPERTS = [
  {
    id: 'EXP-01',
    name: 'Dr. Subrahmanya K',
    title: 'Senior Plant Pathologist',
    institution: 'Regional Agronomy Research Station, Vittal',
    specialty: 'Arecanut & Palms Pathology',
    status: 'Active Reviewer',
    verifiedCount: 12,
    agreementRate: '98.2%',
    avatar: '👨‍🔬'
  },
  {
    id: 'EXP-02',
    name: 'Dr. Roopa M',
    title: 'Senior Rice Entomologist',
    institution: 'Agricultural Research Station, Gangavathi',
    specialty: 'Paddy Blast & Fungal Epidemiology',
    status: 'Active Reviewer',
    verifiedCount: 9,
    agreementRate: '97.5%',
    avatar: '👩‍🔬'
  },
  {
    id: 'EXP-03',
    name: 'Dr. Srinivas M',
    title: 'Solanaceous Crop Specialist',
    institution: 'Horticultural Experiment Station, Kolar',
    specialty: 'Tomato Blight & Crop Protection',
    status: 'Active Reviewer',
    verifiedCount: 11,
    agreementRate: '98.5%',
    avatar: '👨‍🌾'
  },
  {
    id: 'EXP-04',
    name: 'Dr. Rajeshwar T',
    title: 'Horticulture Specialist',
    institution: 'Regional Horticultural Research Station, Shimla',
    specialty: 'Apple Scab & Bioclimatic Modeling',
    status: 'Active Reviewer',
    verifiedCount: 8,
    agreementRate: '96.0%',
    avatar: '👨‍🔬'
  }
];

export const ADMIN_AUDIT_LOGS = [
  {
    id: 'AUD-8801',
    timestamp: '2026-10-24 15:45:12',
    actor: 'Dr. Subrahmanya K',
    action: 'DISBURSE_BOUNTY',
    target: 'SUB-9404 (Tomato Early Blight)',
    details: 'Approved ₹12.00 UPI payout to Suresh R. Validated for Dataset v2.4.',
    ipHash: '117.214.xx.xx'
  },
  {
    id: 'AUD-8802',
    timestamp: '2026-10-24 14:30:05',
    actor: 'Dr. Subrahmanya K',
    action: 'LABEL_CORRECTION',
    target: 'SUB-9406 (Arecanut)',
    details: 'Corrected prediction from Bud Borer to Koleroga Grade 1.',
    ipHash: '117.214.xx.xx'
  },
  {
    id: 'AUD-8803',
    timestamp: '2026-10-24 12:15:44',
    actor: 'System Auto-Gatekeeper',
    action: 'OOD_REJECTION',
    target: 'SUB-9407 (Anonymous User)',
    details: 'Rejected non-crop specimen. DM = 48.7 > threshold 24.5.',
    ipHash: '49.36.xx.xx'
  },
  {
    id: 'AUD-8804',
    timestamp: '2026-10-24 10:00:20',
    actor: 'Dr. Rekha M',
    action: 'CONFIG_UPDATE',
    target: 'Spray Window Bioclimatic Rule',
    details: 'Updated continuous humidity threshold from 90% to 92% for coastal monsoon season.',
    ipHash: '106.51.xx.xx'
  }
];
