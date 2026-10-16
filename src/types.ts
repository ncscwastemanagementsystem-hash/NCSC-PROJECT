export interface AdminUser {
  id?: string;
  username: string;
  email: string;
  displayName: string;
  role: string;
  institution: string;
  lastLogin?: string;
  theme?: string;
  securityQuestion?: string;
}

export interface AdminAccount {
  id: string;
  username: string;
  email: string;
  displayName: string;
  role: string;
  institution?: string;
  createdAt?: string;
  lastLogin?: string;
}

export interface Project {
  id: string;
  name: string;
  shortTitle: string;
  code: string;
  tagline: string;
  description: string;
  category: string;
  subTheme: string;
  leadResearcher: string;
  guideTeacher: string;
  status: 'In Progress' | 'Regional Finalist' | 'State Selection' | 'National Finalist' | 'Completed' | 'Archived';
  progress: number;
  targetExhibitionDate: string;
  tags: string[];
  fileCount?: number;
  createdAt: string;
  updatedAt: string;
}

export type FileCategory =
  | 'All Files'
  | 'Research Papers & Reports'
  | '3D Simulations & CAD'
  | 'Source Code & Firmware'
  | 'Hardware & Circuit Schematics'
  | 'Datasets & Test Results'
  | 'Presentations & Posters'
  | 'Certificates & Approvals'
  | 'Photos & Media';

export type FolderIconType = 'ppt' | 'image' | '3d' | 'code' | 'doc' | 'data' | 'folder' | 'media';

export interface DriveFolder {
  id: string;
  projectId: string;
  name: string;
  color: string; // e.g. '#f59e0b', '#06b6d4', '#10b981', '#8b5cf6', etc.
  icon: FolderIconType;
  isDefault?: boolean;
  description?: string;
  createdAt: string;
  updatedAt: string;
  fileCount?: number;
  totalSize?: number;
}

export interface VaultFile {
  id: string;
  projectId: string;
  folderId?: string;
  name: string;
  category: FileCategory;
  description: string;
  size: number;
  mimeType: string;
  storagePath: string;
  isStaticPublic?: boolean;
  staticUrl?: string;
  isInlineText?: boolean;
  textContent?: string;
  version: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  downloads: number;
}

export interface ExperimentTrial {
  id: string;
  trialNumber: number;
  item: string;
  category: string;
  mass: number;
  moisture: string;
  metal: string;
  confidence: number;
  routingTimeMs: number;
  result: string;
  recovery: string;
  date: string;
}

export interface BOMItem {
  id: string;
  component: string;
  role: string;
  specs: string;
  cost: number;
  quantity: number;
  status: 'Installed' | 'Procured' | 'Testing' | 'On Order';
}

export interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  actor: string;
  details: string;
}

export interface VaultStats {
  totalFiles: number;
  totalStorageBytes: number;
  totalProjects: number;
  totalExperiments: number;
  accuracyRate: number;
  categories: Record<string, number>;
  recentFiles: VaultFile[];
  recentLogs: AuditLog[];
}
