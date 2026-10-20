import {
  User, StudentProfile, Post, PostComment, Opportunity,
  AcademicResource, AcademicGroup, Conversation, Message,
  NotificationItem, ReportItem, ReferenceData, SiteSettings
} from '../types';

const TOKEN_KEY = 'campushub_auth_token';
let inMemoryToken: string | null = null;

export const tokenStorage = {
  get: (): string | null => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return localStorage.getItem(TOKEN_KEY) || inMemoryToken;
      }
    } catch {
      // In cross-origin iframes with restricted storage
    }
    return inMemoryToken;
  },
  set: (token: string) => {
    inMemoryToken = token;
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(TOKEN_KEY, token);
      }
    } catch {}
  },
  remove: () => {
    inMemoryToken = null;
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem(TOKEN_KEY);
      }
    } catch {}
  }
};

async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = tokenStorage.get();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`/api${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMsg = data?.error || 'Une erreur inattendue est survenue.';
    throw new Error(errorMsg);
  }

  return data as T;
}

export const api = {
  // Reference
  getReference: () => fetchApi<ReferenceData>('/reference/options'),

  // Auth
  auth: {
    login: (credentials: { email: string; password: string }) =>
      fetchApi<{ message: string; token: string; user: User }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials)
      }),
    register: (formData: any) =>
      fetchApi<{ message: string; token: string; user: User }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(formData)
      }),
    me: () => fetchApi<{ user: User }>('/auth/me'),
    forgotPassword: (email: string) =>
      fetchApi<{ message: string; devResetToken?: string }>('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email })
      }),
    resetPassword: (token: string, newPassword: string) =>
      fetchApi<{ message: string }>('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, newPassword })
      })
  },

  // Users & Profiles
  users: {
    updateProfile: (profile: Partial<StudentProfile>) =>
      fetchApi<{ message: string; profile: StudentProfile }>('/users/profile', {
        method: 'PUT',
        body: JSON.stringify(profile)
      }),
    getStudent: (id: string) =>
      fetchApi<{ student: { id: string; role: string; memberSince: string; profile: StudentProfile; posts: Post[]; resources: AcademicResource[] } }>(`/users/${id}`)
  },

  // Directory
  directory: {
    search: (params: { search?: string; country?: string; institution?: string; fieldOfStudy?: string; academicLevel?: string; page?: number; limit?: number }) => {
      const qs = new URLSearchParams();
      if (params.search) qs.set('search', params.search);
      if (params.country && params.country !== 'ALL') qs.set('country', params.country);
      if (params.institution && params.institution !== 'ALL') qs.set('institution', params.institution);
      if (params.fieldOfStudy && params.fieldOfStudy !== 'ALL') qs.set('fieldOfStudy', params.fieldOfStudy);
      if (params.academicLevel && params.academicLevel !== 'ALL') qs.set('academicLevel', params.academicLevel);
      if (params.page) qs.set('page', params.page.toString());
      if (params.limit) qs.set('limit', params.limit.toString());
      return fetchApi<{ total: number; page: number; students: any[] }>(`/directory?${qs.toString()}`);
    }
  },

  // Social Feed
  posts: {
    list: (params: { category?: string; search?: string; savedOnly?: boolean; page?: number; limit?: number } = {}) => {
      const qs = new URLSearchParams();
      if (params.category && params.category !== 'ALL') qs.set('category', params.category);
      if (params.search) qs.set('search', params.search);
      if (params.savedOnly) qs.set('savedOnly', 'true');
      if (params.page) qs.set('page', params.page.toString());
      if (params.limit) qs.set('limit', params.limit.toString());
      return fetchApi<{ total: number; page: number; posts: Post[] }>(`/posts?${qs.toString()}`);
    },
    create: (data: { content: string; category?: string; attachments?: any[] }) =>
      fetchApi<{ message: string; post: Post }>('/posts', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    delete: (id: string) =>
      fetchApi<{ message: string }>(`/posts/${id}`, { method: 'DELETE' }),
    like: (id: string) =>
      fetchApi<{ liked: boolean; likesCount: number }>(`/posts/${id}/like`, { method: 'POST' }),
    bookmark: (id: string) =>
      fetchApi<{ saved: boolean; message: string }>(`/posts/${id}/bookmark`, { method: 'POST' }),
    getComments: (id: string) =>
      fetchApi<{ comments: PostComment[] }>(`/posts/${id}/comments`),
    addComment: (id: string, content: string, parentId?: string) =>
      fetchApi<{ message: string; comment: PostComment }>(`/posts/${id}/comments`, {
        method: 'POST',
        body: JSON.stringify({ content, parentId })
      })
  },

  // Opportunities
  opportunities: {
    list: (params: { category?: string; country?: string; academicLevel?: string; keyword?: string; favoritesOnly?: boolean; page?: number; limit?: number } = {}) => {
      const qs = new URLSearchParams();
      if (params.category && params.category !== 'ALL') qs.set('category', params.category);
      if (params.country && params.country !== 'ALL') qs.set('country', params.country);
      if (params.academicLevel && params.academicLevel !== 'ALL') qs.set('academicLevel', params.academicLevel);
      if (params.keyword) qs.set('keyword', params.keyword);
      if (params.favoritesOnly) qs.set('favoritesOnly', 'true');
      if (params.page) qs.set('page', params.page.toString());
      if (params.limit) qs.set('limit', params.limit.toString());
      return fetchApi<{ total: number; page: number; opportunities: Opportunity[] }>(`/opportunities?${qs.toString()}`);
    },
    get: (id: string) => fetchApi<{ opportunity: Opportunity }>(`/opportunities/${id}`),
    create: (data: any) =>
      fetchApi<{ message: string; opportunityId: string }>('/opportunities', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    favorite: (id: string) =>
      fetchApi<{ favorited: boolean; message: string }>(`/opportunities/${id}/favorite`, { method: 'POST' })
  },

  // Pedagogical Resources
  resources: {
    list: (params: { category?: string; institution?: string; fieldOfStudy?: string; academicLevel?: string; search?: string; page?: number; limit?: number } = {}) => {
      const qs = new URLSearchParams();
      if (params.category && params.category !== 'ALL') qs.set('category', params.category);
      if (params.institution && params.institution !== 'ALL') qs.set('institution', params.institution);
      if (params.fieldOfStudy && params.fieldOfStudy !== 'ALL') qs.set('fieldOfStudy', params.fieldOfStudy);
      if (params.academicLevel && params.academicLevel !== 'ALL') qs.set('academicLevel', params.academicLevel);
      if (params.search) qs.set('search', params.search);
      if (params.page) qs.set('page', params.page.toString());
      if (params.limit) qs.set('limit', params.limit.toString());
      return fetchApi<{ total: number; page: number; resources: AcademicResource[] }>(`/resources?${qs.toString()}`);
    },
    create: (data: any) =>
      fetchApi<{ message: string; resourceId: string }>('/resources', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    download: (id: string) =>
      fetchApi<{ message: string; fileUrl: string; fileName: string }>(`/resources/${id}/download`, { method: 'POST' })
  },

  // Groups
  groups: {
    list: (category?: string, search?: string) => {
      const qs = new URLSearchParams();
      if (category && category !== 'ALL') qs.set('category', category);
      if (search) qs.set('search', search);
      return fetchApi<{ groups: AcademicGroup[] }>(`/groups?${qs.toString()}`);
    },
    create: (data: any) =>
      fetchApi<{ message: string; groupId: string }>('/groups', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    join: (id: string) =>
      fetchApi<{ joined: boolean; message: string }>(`/groups/${id}/join`, { method: 'POST' })
  },

  // Messaging
  messaging: {
    listConversations: () =>
      fetchApi<{ conversations: Conversation[] }>('/conversations'),
    startConversation: (targetUserId: string) =>
      fetchApi<{ conversationId: string }>('/conversations', {
        method: 'POST',
        body: JSON.stringify({ targetUserId })
      }),
    getMessages: (conversationId: string) =>
      fetchApi<{ messages: Message[] }>(`/conversations/${conversationId}/messages`),
    sendMessage: (conversationId: string, content: string, attachments?: any[]) =>
      fetchApi<{ message: Message }>(`/conversations/${conversationId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ content, attachments })
      })
  },

  // Notifications
  notifications: {
    list: () => fetchApi<{ notifications: NotificationItem[] }>('/notifications'),
    markRead: (id: string) => fetchApi<{ success: boolean }>(`/notifications/${id}/read`, { method: 'PUT' }),
    markAllRead: () => fetchApi<{ success: boolean; message: string }>('/notifications/read-all', { method: 'PUT' })
  },

  // Reports
  reports: {
    submit: (data: { targetType: string; targetId: string; reason: string; details?: string }) =>
      fetchApi<{ message: string }>('/reports', {
        method: 'POST',
        body: JSON.stringify(data)
      })
  },

  // Admin
  admin: {
    getStats: () => fetchApi<{ stats: any }>('/admin/stats'),
    getUsers: (params: { search?: string; role?: string; status?: string; page?: number; limit?: number } = {}) => {
      const qs = new URLSearchParams();
      if (params.search) qs.set('search', params.search);
      if (params.role) qs.set('role', params.role);
      if (params.status) qs.set('status', params.status);
      if (params.page) qs.set('page', params.page.toString());
      if (params.limit) qs.set('limit', params.limit.toString());
      return fetchApi<{ total: number; page: number; users: any[] }>(`/admin/users?${qs.toString()}`);
    },
    updateUserStatus: (id: string, status: string, reason?: string) =>
      fetchApi<{ message: string }>(`/admin/users/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status, reason })
      }),
    getReports: () => fetchApi<{ reports: ReportItem[] }>('/admin/reports'),
    resolveReport: (id: string, data: { status: string; resolutionNote?: string; deleteTarget?: boolean }) =>
      fetchApi<{ message: string }>(`/admin/reports/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      }),
    getAuditLogs: () => fetchApi<{ logs: any[] }>('/admin/audit')
  },

  // Platform Settings & Branding
  settings: {
    get: () => fetchApi<{ settings: SiteSettings }>('/settings'),
    update: (data: Partial<SiteSettings>) =>
      fetchApi<{ message: string; settings: SiteSettings }>('/settings', {
        method: 'PUT',
        body: JSON.stringify(data)
      })
  }
};
