const BASE_URL = 'https://verlynk.com/api';

export interface VerlynkConfig {
  apiKey: string;
  apiUrl?: string;
}

export interface ListAccountsParams {
  profileId?: string;
  platform?: string;
  includeOverLimit?: boolean;
  page?: number;
  limit?: number;
}

export interface ListPostsParams {
  from: string;
  to: string;
  view?: string;
  profileId?: string;
  status?: string | string[];
  platform?: string | string[];
  channelId?: string | string[];
  labels?: string | string[];
  labelMatch?: string;
  campaign?: string | string[];
  author?: string | string[];
}

export interface ListDraftPostsParams {
  from: string;
  to: string;
  view?: string;
  profileId?: string;
  platform?: string | string[];
  channelId?: string | string[];
  labels?: string | string[];
  campaign?: string | string[];
  author?: string | string[];
}

export interface CreatePostsData {
  action: 'SCHEDULE' | 'QUEUE' | 'PUBLISH' | 'NEEDS_APPROVAL' | 'DRAFT';
  posts: PostInput[];
  labels?: string[];
  workflowId?: string;
  campaign?: string;
}

export interface PostInput {
  channelId: string;
  postType: string;
  metaData: {
    contents: Array<{
      title?: string;
      text?: string;
      media?: Array<{ mediaId?: string; objectKey?: string; fileType: string; contentType: string; url?: string }>;
    }>;
    [key: string]: unknown;
  };
  schedule: {
    type: string;
    details: Record<string, unknown>;
  };
}

export class VerlynkAPI {
  private apiKey: string;
  private baseUrl: string;

  constructor(config: VerlynkConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.apiUrl || BASE_URL;
  }

  private async request<T = unknown>(
    endpoint: string,
    options: { method?: string; body?: unknown; params?: Record<string, unknown> } = {}
  ): Promise<T> {
    const url = new URL(`${this.baseUrl}${endpoint}`);

    if (options.params) {
      for (const [key, value] of Object.entries(options.params)) {
        if (value === undefined || value === null) continue;
        if (Array.isArray(value)) {
          for (const v of value) url.searchParams.append(key, String(v));
        } else {
          url.searchParams.set(key, String(value));
        }
      }
    }

    const res = await fetch(url.toString(), {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    if (!res.ok) {
      let message = `HTTP ${res.status}`;
      try {
        const err = (await res.json()) as { message?: string; errorCode?: string };
        message = err.message ? `${err.errorCode ? `[${err.errorCode}] ` : ''}${err.message}` : message;
      } catch {
        message = await res.text().catch(() => message);
      }
      throw new Error(`API Error (${res.status}): ${message}`);
    }

    if (res.status === 204) return undefined as T;

    return res.json() as Promise<T>;
  }

  getUserContext() {
    return this.request<UserOrg[]>('/v1/user');
  }

  listAccounts(params?: ListAccountsParams) {
    return this.request<{ accounts: SocialAccount[] }>('/v1/accounts', {
      params: params as Record<string, unknown>,
    });
  }

  listPosts(params: ListPostsParams) {
    const { view = 'list', profileId, ...rest } = params;
    return this.request<Post[]>('/v1/posts', {
      params: {
        view,
        ...rest,
        ...(profileId ? { profileId } : {}),
      } as Record<string, unknown>,
    });
  }

  createPosts(data: CreatePostsData, profileId?: string) {
    return this.request<{ message: string }>('/v1/posts', {
      method: 'POST',
      body: data,
      params: profileId ? { profileId } : undefined,
    });
  }

  getPost(postId: string, profileId?: string) {
    return this.request<Post>(`/v1/posts/${postId}`, {
      params: profileId ? { profileId } : undefined,
    });
  }

  deletePost(postId: string, profileId?: string) {
    return this.request<void>(`/v1/posts/${postId}`, {
      method: 'DELETE',
      params: profileId ? { profileId } : undefined,
    });
  }

  listDraftPosts(params: ListDraftPostsParams) {
    const { view = 'list', profileId, ...rest } = params;
    return this.request<DraftPost[]>('/v1/posts/drafts', {
      params: {
        view,
        ...rest,
        ...(profileId ? { profileId } : {}),
      } as Record<string, unknown>,
    });
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UserOrgProject {
  projectId: string;
  projectName: string;
  isDefaultProject: boolean;
  channelIds: string[];
}

export interface UserOrg {
  orgId: string;
  orgName: string;
  isDefaultOrg: boolean;
  defaultProject: string | null;
  projects: UserOrgProject[];
}

export interface ProfileRef {
  _id: string;
  name: string;
  slug: string;
}

export interface SocialAccount {
  _id: string;
  platform: string;
  profileId: ProfileRef;
  username?: string;
  displayName: string;
  profileUrl?: string;
  isActive: boolean;
  isOverLimit?: boolean;
  followersCount?: number;
}

export interface PostChannel {
  channelId: string;
  channelName: string;
  platformName: string;
  profileUrl?: string;
  username?: string;
  domain?: string;
}

export interface PostAuthor {
  userId: string;
  firstName?: string;
  lastName?: string;
}

export interface PostLabel {
  labelId: string;
  labelName: string;
  labelColor: string;
}

export interface Post {
  postId: string;
  objectId?: string;
  postType: string;
  publishAt: string;
  postStatus: string;
  createdAt: string;
  errorMessage?: string;
  metaData: {
    contents: Array<{ title?: string; text?: string }>;
    [key: string]: unknown;
  };
  schedule: { type: string; details: Record<string, unknown> };
  channel: PostChannel;
  author?: PostAuthor | string;
  labels?: PostLabel[];
}

export interface DraftPost {
  draftId: string;
  createdAt: string;
  updatedAt: string;
  channels: Array<{ channelId: string; channelName: string; platformName: string }>;
  author?: PostAuthor;
}
