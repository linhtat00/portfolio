// ----------------------------------------------------------------------
// Threat Writeup Categories & Platforms (Dynamic Source of Truth)
// ----------------------------------------------------------------------
export const CATEGORIES = [
  'Active Directory',
  'Digital Forensics',
  'Disk Forensics',
  'Incident Response',
  'Malware Analysis',
  'Memory Forensics',
  'Network Forensics',
  'OSINT',
  'Threat Hunting',
  'SIEM & Detection',
  'PCAP Triage',
] as const;

export type CategoryType = (typeof CATEGORIES)[number];

export const PLATFORMS = [
  'Blue Team Labs',
  'CyberDefenders',
  'HackTheBox',
  'Internal Range',
  'MTA Labs',
  'Sherlocks',
  'Tryhackme',
] as const;

export type PlatformType = (typeof PLATFORMS)[number];

export const DIFFICULTIES = ['EASY', 'MED', 'HARD'] as const;
export type DifficultyType = (typeof DIFFICULTIES)[number];

export type ActiveTab = 'home' | 'writeups' | 'labs' | 'about';

export const IOC_TYPES = [
  'SHA256',
  'MD5',
  'IPv4',
  'Domain',
  'Registry',
  'NamedPipe',
  'File',
] as const;
export type IOCType = (typeof IOC_TYPES)[number];

export interface IOCItem {
  type: IOCType;
  value: string;
  description: string;
}

export interface DetectionQuery {
  title: string;
  language: string;
  code: string;
  description: string;
}

export interface AttackTimelineEvent {
  id?: string;
  time: string;
  phase: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  techniqueId?: string;
}

export interface Writeup {
  id: string;
  slug: string;
  title: string;
  code: string;
  category: CategoryType | CategoryType[] | string | string[];
  categories?: (CategoryType | string)[];
  primaryCategory?: CategoryType | string;
  platform: PlatformType;
  difficulty: DifficultyType;
  date: string;
  readTime: string;
  mitreAttack: string[];
  tools: string[];
  summary: string;
  content: string;
  featured?: boolean;
  iocs?: IOCItem[];
  detectionQueries?: DetectionQuery[];
  timelineTitle?: string;
  timeline?: AttackTimelineEvent[];
  rawTelemetry?: string;
}

export const getPrimaryCategory = (writeup: Writeup): string => {
  if (writeup.primaryCategory) return String(writeup.primaryCategory);
  if (Array.isArray(writeup.categories) && writeup.categories.length > 0) {
    return String(writeup.categories[0]);
  }
  if (Array.isArray(writeup.category) && writeup.category.length > 0) {
    return String(writeup.category[0]);
  }
  if (typeof writeup.category === 'string') {
    if (writeup.category.includes(',')) {
      return writeup.category.split(',')[0].trim();
    }
    return writeup.category;
  }
  return 'Incident Response';
};

export const getAllCategories = (writeup: Writeup): string[] => {
  let list: string[] = [];
  if (Array.isArray(writeup.categories) && writeup.categories.length > 0) {
    list = writeup.categories.map(String);
  } else if (Array.isArray(writeup.category) && writeup.category.length > 0) {
    list = writeup.category.map(String);
  } else if (typeof writeup.category === 'string') {
    list = writeup.category.split(',').map(s => s.trim()).filter(Boolean);
  }
  const primary = getPrimaryCategory(writeup);
  if (!list.includes(primary)) {
    list.unshift(primary);
  }
  return Array.from(new Set(list));
};

export interface FormattedDateInfo {
  display: string;
  fullDate: string;
  isRecent: boolean;
  rawDate: Date;
}

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

export const parseWriteupDate = (writeup: Writeup): Date => {
  const code = writeup.code || '';
  const dateStr = writeup.date || '';

  // 1. Try matching YYMMDD in code: [platform]-YYMMDD or #PLAT-YYMMDD
  const codeMatch = code.match(/(?:^|[^\d])(\d{2})(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])(?:[^\d]|$)/);
  if (codeMatch) {
    const yy = parseInt(codeMatch[1], 10);
    const mm = parseInt(codeMatch[2], 10) - 1;
    const dd = parseInt(codeMatch[3], 10);
    const fullYear = 2000 + yy;
    return new Date(fullYear, mm, dd, 12, 0, 0);
  }

  // 2. Try matching YYYY-MM-DD in code or date
  const isoMatch = (code + ' ' + dateStr).match(/(20\d{2})[-/](0[1-9]|1[0-2])[-/](0[1-9]|[12]\d|3[01])/);
  if (isoMatch) {
    const yyyy = parseInt(isoMatch[1], 10);
    const mm = parseInt(isoMatch[2], 10) - 1;
    const dd = parseInt(isoMatch[3], 10);
    return new Date(yyyy, mm, dd, 12, 0, 0);
  }

  // 3. Try relative dates in writeup.date:
  const now = new Date();
  if (/today/i.test(dateStr)) {
    return now;
  }
  if (/yesterday/i.test(dateStr)) {
    const d = new Date(now);
    d.setDate(d.getDate() - 1);
    return d;
  }
  const dayAgoMatch = dateStr.match(/(\d+)\s*day/i);
  if (dayAgoMatch) {
    const days = parseInt(dayAgoMatch[1], 10);
    const d = new Date(now);
    d.setDate(d.getDate() - days);
    return d;
  }
  const weekAgoMatch = dateStr.match(/(\d+)\s*week/i);
  if (weekAgoMatch) {
    const weeks = parseInt(weekAgoMatch[1], 10);
    const d = new Date(now);
    d.setDate(d.getDate() - weeks * 7);
    return d;
  }

  // 4. Try matching "Sep 2024" or "Nov 2024" or "Oct 15, 2024"
  const monthMatch = dateStr.match(/(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+(\d{1,2})?,?\s*(20\d{2})/i);
  if (monthMatch) {
    const monthIdx = MONTH_NAMES.findIndex(m => m.toLowerCase() === monthMatch[1].slice(0, 3).toLowerCase());
    const day = monthMatch[2] ? parseInt(monthMatch[2], 10) : 15;
    const year = parseInt(monthMatch[3], 10);
    return new Date(year, monthIdx >= 0 ? monthIdx : 0, day, 12, 0, 0);
  }

  // 5. Try code like #IR-2024-09
  const yearMonthMatch = code.match(/(20\d{2})[-_](0[1-9]|1[0-2])/);
  if (yearMonthMatch) {
    const yyyy = parseInt(yearMonthMatch[1], 10);
    const mm = parseInt(yearMonthMatch[2], 10) - 1;
    return new Date(yyyy, mm, 15, 12, 0, 0);
  }

  return now;
};

export const formatWriteupDate = (writeup: Writeup): FormattedDateInfo => {
  const date = parseWriteupDate(writeup);
  const now = new Date();

  // Normalize to local midday to avoid DST / timezone issues
  const nowMid = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0).getTime();
  const dateMid = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0).getTime();

  const diffMs = nowMid - dateMid;
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  const dayStr = String(date.getDate()).padStart(2, '0');
  const monthStr = MONTH_NAMES[date.getMonth()];
  const yearStr = date.getFullYear();
  const fullDate = `${dayStr} ${monthStr} ${yearStr}`;

  let display: string;
  let isRecent: boolean;

  if (diffDays <= 0) {
    display = 'Today';
    isRecent = true;
  } else if (diffDays === 1) {
    display = '1 day ago';
    isRecent = true;
  } else if (diffDays === 2) {
    display = '2 days ago';
    isRecent = true;
  } else if (diffDays === 3) {
    display = '3 days ago';
    isRecent = true;
  } else {
    // 4 days or older: show full day, month, year
    display = fullDate;
    isRecent = false;
  }

  return {
    display,
    fullDate,
    isRecent,
    rawDate: date
  };
};

// ----------------------------------------------------------------------
// Cyber Defense Labs & Range Architecture (Dynamic Source of Truth)
// ----------------------------------------------------------------------
export const LAB_TRACKS = [
  'Defensive Infrastructure',
  'CompTIA CySA+',
  'CEH Practical',
  'Academic / School Project',
] as const;

export type LabTrack = (typeof LAB_TRACKS)[number];

export const LAB_DIFFICULTIES = ['Intermediate', 'Advanced', 'Expert'] as const;
export type LabDifficulty = (typeof LAB_DIFFICULTIES)[number];

export const LAB_STATUSES = [
  'Completed & Documented',
  'Active Defense Range',
] as const;
export type LabStatus = (typeof LAB_STATUSES)[number];

export interface LabNode {
  name: string;
  ip: string;
  role: string;
  os: string;
}

export interface LabSubnet {
  name: string;
  cidr: string;
  purpose: string;
}

export interface LabStep {
  phase: string;
  title: string;
  description: string;
  commandSnippet?: string;
  evidenceNote?: string;
}

export interface LabProject {
  id: string;
  slug: string;
  code: string;
  title: string;
  track: LabTrack;
  category: string;
  difficulty: LabDifficulty;
  date: string;
  duration: string;
  status: LabStatus;
  tools: string[];
  summary: string;
  objectives: string[];
  topology: {
    architectureType: string;
    nodes: LabNode[];
    networkSubnets: LabSubnet[];
  };
  steps: LabStep[];
  takeaways: string[];
  verificationEvidence?: string;
}

export interface GitHubSyncConfig {
  token: string;
  owner: string;
  repo: string;
  branch: string;
  writeupsPath?: string;
  labsPath?: string;
}

export interface SyncResult {
  success: boolean;
  message: string;
  commitUrl?: string;
  fileName?: string;
}
