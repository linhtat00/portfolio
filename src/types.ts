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

export interface Writeup {
  id: string;
  slug: string;
  title: string;
  code: string;
  category: CategoryType;
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
  rawTelemetry?: string;
}

// ----------------------------------------------------------------------
// Cyber Defense Labs & Range Architecture (Dynamic Source of Truth)
// ----------------------------------------------------------------------
export const LAB_TRACKS = [
  'Academic / School Project',
  'CEH Practical',
  'CompTIA CySA+',
  'Defensive Infrastructure',
] as const;

export type LabTrack = (typeof LAB_TRACKS)[number];

export const LAB_DIFFICULTIES = ['Intermediate', 'Advanced', 'Expert'] as const;
export type LabDifficulty = (typeof LAB_DIFFICULTIES)[number];

export const LAB_STATUSES = [
  'Active Defense Range',
  'Completed & Documented',
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
