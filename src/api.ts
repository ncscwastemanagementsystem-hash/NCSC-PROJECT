import { AdminUser, AdminAccount, Project, VaultFile, DriveFolder, ExperimentTrial, BOMItem, AuditLog, VaultStats } from './types';

const BASE_URL = '/api';

export const api = {
  // Authentication
  async login(username: string, password: string): Promise<{ token: string; user: AdminUser }> {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Login failed' }));
      throw new Error(err.error || 'Invalid credentials');
    }
    return res.json();
  },

  async getCurrentUser(): Promise<{ user: AdminUser }> {
    const res = await fetch(`${BASE_URL}/auth/me`);
    if (!res.ok) throw new Error('Failed to load profile');
    return res.json();
  },

  async updateProfile(data: any): Promise<{ message: string; user: AdminUser }> {
    const res = await fetch(`${BASE_URL}/auth/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Update failed' }));
      throw new Error(err.error || 'Failed to update credentials');
    }
    return res.json();
  },

  // Multiple Administrator Management
  async getAdmins(): Promise<AdminAccount[]> {
    const res = await fetch(`${BASE_URL}/admins`);
    if (!res.ok) throw new Error('Failed to load administrators');
    return res.json();
  },

  async createAdmin(data: any): Promise<AdminAccount> {
    const res = await fetch(`${BASE_URL}/admins`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to create admin' }));
      throw new Error(err.error || 'Failed to create administrator');
    }
    return res.json();
  },

  async updateAdmin(id: string, data: any): Promise<AdminAccount> {
    const res = await fetch(`${BASE_URL}/admins/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to update admin' }));
      throw new Error(err.error || 'Failed to update administrator');
    }
    return res.json();
  },

  async deleteAdmin(id: string): Promise<{ message: string }> {
    const res = await fetch(`${BASE_URL}/admins/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to delete admin' }));
      throw new Error(err.error || 'Failed to delete administrator');
    }
    return res.json();
  },

  // Projects
  async getProjects(): Promise<Project[]> {
    const res = await fetch(`${BASE_URL}/projects`);
    if (!res.ok) throw new Error('Failed to load projects');
    return res.json();
  },

  async createProject(data: Partial<Project>): Promise<Project> {
    const res = await fetch(`${BASE_URL}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to create project' }));
      throw new Error(err.error || 'Failed to create project');
    }
    return res.json();
  },

  async updateProject(id: string, data: Partial<Project>): Promise<Project> {
    const res = await fetch(`${BASE_URL}/projects/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update project');
    return res.json();
  },

  async deleteProject(id: string): Promise<{ message: string }> {
    const res = await fetch(`${BASE_URL}/projects/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete project');
    return res.json();
  },

  // Drive Folders
  async getFolders(projectId?: string): Promise<DriveFolder[]> {
    const params = new URLSearchParams();
    if (projectId) params.set('projectId', projectId);
    const res = await fetch(`${BASE_URL}/folders?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to load drive folders');
    return res.json();
  },

  async createFolder(data: Partial<DriveFolder>): Promise<DriveFolder> {
    const res = await fetch(`${BASE_URL}/folders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to create folder' }));
      throw new Error(err.error || 'Failed to create folder');
    }
    return res.json();
  },

  async updateFolder(id: string, data: Partial<DriveFolder>): Promise<DriveFolder> {
    const res = await fetch(`${BASE_URL}/folders/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update folder');
    return res.json();
  },

  async deleteFolder(id: string): Promise<{ message: string }> {
    const res = await fetch(`${BASE_URL}/folders/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete folder');
    return res.json();
  },

  // Files
  async getFiles(projectId?: string, folderId?: string, category?: string, search?: string): Promise<VaultFile[]> {
    const params = new URLSearchParams();
    if (projectId) params.set('projectId', projectId);
    if (folderId && folderId !== 'all') params.set('folderId', folderId);
    if (category && category !== 'All Files') params.set('category', category);
    if (search) params.set('search', search);

    const res = await fetch(`${BASE_URL}/files?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to load files');
    return res.json();
  },

  async uploadFiles(formData: FormData): Promise<{ message: string; files: VaultFile[] }> {
    const res = await fetch(`${BASE_URL}/files/upload`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Upload failed' }));
      throw new Error(err.error || 'Upload failed');
    }
    return res.json();
  },

  async moveFile(id: string, folderId: string): Promise<{ message: string; file: VaultFile }> {
    const res = await fetch(`${BASE_URL}/files/${id}/move`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ folderId }),
    });
    if (!res.ok) throw new Error('Failed to move file');
    return res.json();
  },

  async downloadFile(id: string, fileName: string) {
    const link = document.createElement('a');
    link.href = `${BASE_URL}/files/${id}/download`;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  async getPreview(id: string): Promise<any> {
    const res = await fetch(`${BASE_URL}/files/${id}/preview`);
    if (!res.ok) throw new Error('Failed to load file preview');
    return res.json();
  },

  async updateFile(id: string, data: Partial<VaultFile>): Promise<VaultFile> {
    const res = await fetch(`${BASE_URL}/files/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update file metadata');
    return res.json();
  },

  async deleteFile(id: string): Promise<{ message: string }> {
    const res = await fetch(`${BASE_URL}/files/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete file');
    return res.json();
  },

  // Experiments
  async getExperiments(): Promise<ExperimentTrial[]> {
    const res = await fetch(`${BASE_URL}/experiments`);
    if (!res.ok) throw new Error('Failed to load experiments');
    return res.json();
  },

  async addExperiment(data: Partial<ExperimentTrial>): Promise<ExperimentTrial> {
    const res = await fetch(`${BASE_URL}/experiments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to log experiment');
    return res.json();
  },

  // BOM
  async getBOM(): Promise<BOMItem[]> {
    const res = await fetch(`${BASE_URL}/bom`);
    if (!res.ok) throw new Error('Failed to load BOM');
    return res.json();
  },

  async addBOM(data: Partial<BOMItem>): Promise<BOMItem> {
    const res = await fetch(`${BASE_URL}/bom`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to add component');
    return res.json();
  },

  // Audit Logs & Stats
  async getAuditLogs(): Promise<AuditLog[]> {
    const res = await fetch(`${BASE_URL}/audit-logs`);
    if (!res.ok) throw new Error('Failed to load audit logs');
    return res.json();
  },

  async getStats(): Promise<VaultStats> {
    const res = await fetch(`${BASE_URL}/vault/stats`);
    if (!res.ok) throw new Error('Failed to load vault stats');
    return res.json();
  },

  exportVaultBackup() {
    window.location.href = `${BASE_URL}/vault/backup`;
  }
};
