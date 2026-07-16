const BASE_URL = 'https://verlynk.com/api';

export interface VerlynkConfig {
  apiKey: string;
  apiUrl?: string;
}

interface ApiErrorBody {
  message?: string;
  errorCode?: string;
  retryable?: boolean;
  action?: string;
}

/**
 * Thrown by `VerlynkAPI.request()` for any non-OK HTTP response. Carries the
 * structured fields the Public V1 Inbox API returns (`errorCode`, `retryable`,
 * `action`) so `--json` callers can emit a machine-readable error instead of
 * scraping `Error: ...` text. Still an `Error` subclass, so existing
 * `err instanceof Error ? err.message : String(err)` call sites are unaffected.
 */
export class VerlynkApiError extends Error {
  readonly status: number;
  readonly errorCode?: string;
  readonly retryable?: boolean;
  readonly action?: string;

  constructor(status: number, message: string, details?: ApiErrorBody) {
    super(message);
    this.name = 'VerlynkApiError';
    this.status = status;
    this.errorCode = details?.errorCode;
    this.retryable = details?.retryable;
    this.action = details?.action;
  }
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

export type InboxItemType = 'COMMENT' | 'REPLY';
export type InboxStatus = 'OPEN' | 'FOLLOWUP' | 'CLOSED';
export type InboxByTime = 'newest' | 'oldest';

export interface ListInboxParams {
  from: string;
  to: string;
  profileId?: string;
  platform?: string | string[];
  channelId?: string | string[];
  inboxStatus?: InboxStatus | InboxStatus[];
  type?: InboxItemType;
  byTime?: InboxByTime;
  page?: number;
  limit?: number;
}

export interface InboxAuthor {
  name: string;
  profileUrl: string | null;
}

export interface InboxParent {
  id: string;
  text: string;
  author: string;
}

export interface InboxPost {
  postId: string;
  textPreview: string | null;
  publishAt: string | null;
}

export interface InboxAttachment {
  url?: string;
  contentType?: string;
}

export interface InboxItem {
  id: string;
  type: InboxItemType;
  platform: string;
  channelId: string;
  channelName: string;
  inboxStatus: InboxStatus;
  createdAt: string;
  author: InboxAuthor;
  text: string;
  isHidden: boolean;
  canReply: boolean;
  platformUrl: string | null;
  parent: InboxParent | null;
  post: InboxPost | null;
  attachments: InboxAttachment[];
}

export interface InboxPagination {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
}

export interface ListInboxResponse {
  items: InboxItem[];
  pagination: InboxPagination;
}

export interface ReplyInboxRequest {
  message: string;
}

export interface ReplyInboxResponse {
  ok: true;
  itemId: string;
  replyId: string | null;
  platform: string;
  message: string;
}

export interface UpdateInboxStatusRequest {
  status: InboxStatus;
}

export interface UpdateInboxStatusResponse {
  ok: true;
  itemId: string;
  inboxStatus: InboxStatus;
}

export interface CreatePostsData {
  action: 'SCHEDULE' | 'QUEUE' | 'PUBLISH' | 'NEEDS_APPROVAL' | 'DRAFT';
  posts: PostInput[];
  labels?: string[];
  workflowId?: string;
  campaign?: string;
}

export interface EditPostRequest {
  action: CreatePostsData['action'];
  post: PostInput;
  labels?: string[];
  workflowId?: string;
  campaign?: string;
}

export interface ValidatePostLengthRequest {
  text: string;
}

export type ValidatePostLengthPlatforms = Record<
  string,
  { count: number; limit: number; valid: boolean }
>;

export interface ValidatePostLengthResponse {
  text: string;
  platforms: ValidatePostLengthPlatforms;
}

export type ApiKeyPermission = 'read' | 'read-write';
export type ApiKeyScopeMode = 'full' | 'profiles';

export interface ApiKey {
  id: string;
  name: string;
  keyPreview: string;
  key?: string;
  expiresAt: string | null;
  createdAt: string;
  scope: ApiKeyScopeMode;
  profileIds: string[];
  permission: ApiKeyPermission;
}

export interface CreateApiKeyRequest {
  name: string;
  expiresIn?: number;
  scope?: ApiKeyScopeMode;
  profileIds?: string[];
  permission?: ApiKeyPermission;
}

export interface CreateApiKeyResponse {
  message: string;
  apiKey: ApiKey & { key: string };
}

export interface CreateProfileRequest {
  name: string;
  description?: string;
}

export interface UpdateProfileRequest {
  name?: string;
  description?: string;
  isDefault?: boolean;
}

export interface ProfileMutationResponse {
  message: string;
  profile: Profile;
}

export interface PostMetricValue {
  metric: number;
  compare?: unknown;
}

export type PostMetricsResponse = Record<string, PostMetricValue>;

export interface PostingWindowTimeSlot {
  day: number;
  hour: number;
  score: number;
  postCount: number;
  avgEngagement: number;
}

export interface PostingWindow {
  slots: PostingWindowTimeSlot[];
  dataSource: 'channel_analytics' | 'platform_heuristics' | 'mixed';
  confidenceLevel: 'high' | 'medium' | 'low';
  dataPoints: number;
  computedAt: string;
  timezone: string;
}

export interface BestTimeWindowLine {
  type: 'window';
  payload: PostingWindow;
}

export interface BestTimeNarrativeLine {
  type: 'narrative';
  text: string;
}

export type BestTimeLine = BestTimeWindowLine | BestTimeNarrativeLine;

export interface UsageStatsResponse {
  planId: string;
  planName: string;
  planStatus:
    | 'TRIAL_ACTIVE'
    | 'TRIAL_EXPIRED'
    | 'CANCEL_SCHEDULED'
    | 'PAST_DUE'
    | 'ACTIVE'
    | 'CANCELLED';
  paymentProvider?: 'PADDLE' | 'APPLE_APP_STORE' | 'GOOGLE_PLAY' | null;
  maxChannels: number;
  currentChannels: number;
  baseChannelLimit?: number;
  addonQuantity?: number | null;
  billingPeriod?: 'monthly' | 'annual' | null;
  billedOn?: string | null;
  nextBillingDate?: string | null;
  currentStartDate?: string | null;
  currentEndDate?: string | null;
  trialExpiresAt?: string | null;
  canceledAt?: string | null;
  lastPaymentMethod?: unknown;
}

export interface PostMediaItem {
  mediaId: string;
  fileType: string;
  contentType: string;
  objectKey?: string;
  url?: string;
}

export interface PostInput {
  channelId: string;
  postType: string;
  metaData: {
    contents: Array<{
      title?: string;
      text?: string;
      media?: PostMediaItem[];
    }>;
    [key: string]: unknown;
  };
  schedule: {
    type: string;
    details: Record<string, unknown>;
  };
}

export interface MediaPresignRequest {
  filename: string;
  contentType: string;
  size?: number;
}

export interface MediaPresignResponse {
  uploadUrl: string;
  publicUrl: string;
  key: string;
  type: 'image' | 'video' | 'document';
  mediaId: string;
}

export interface MediaCompleteResponse {
  mediaId: string;
  publicUrl: string;
  key: string;
  type: 'image' | 'video' | 'document';
  status: 'complete';
}

export class VerlynkAPI {
  private apiKey: string;
  private baseUrl: string;

  constructor(config: VerlynkConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.apiUrl || BASE_URL;
  }

  private buildUrl(endpoint: string, params?: Record<string, unknown>): URL {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value === undefined || value === null) continue;
        if (Array.isArray(value)) {
          for (const v of value) url.searchParams.append(key, String(v));
        } else {
          url.searchParams.set(key, String(value));
        }
      }
    }
    return url;
  }

  private async parseError(res: Response): Promise<ApiErrorBody> {
    try {
      return (await res.json()) as ApiErrorBody;
    } catch {
      return { message: await res.text().catch(() => undefined) };
    }
  }

  private async toApiError(res: Response): Promise<VerlynkApiError> {
    const body = await this.parseError(res);
    const detail = body.message
      ? `${body.errorCode ? `[${body.errorCode}] ` : ''}${body.message}`
      : `HTTP ${res.status}`;
    return new VerlynkApiError(res.status, `API Error (${res.status}): ${detail}`, body);
  }

  private async requestNdjson<T>(endpoint: string, params?: Record<string, unknown>): Promise<T[]> {
    const res = await fetch(this.buildUrl(endpoint, params).toString(), {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
    });

    if (!res.ok) {
      throw await this.toApiError(res);
    }

    const text = await res.text();
    if (!text.trim()) return [];

    const lines: T[] = [];
    for (const line of text.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      lines.push(JSON.parse(trimmed) as T);
    }
    return lines;
  }

  private async request<T = unknown>(
    endpoint: string,
    options: { method?: string; body?: unknown; params?: Record<string, unknown> } = {}
  ): Promise<T> {
    const res = await fetch(this.buildUrl(endpoint, options.params).toString(), {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    if (!res.ok) {
      throw await this.toApiError(res);
    }

    if (res.status === 204) return undefined as T;

    // Some endpoints return 200 with an empty body (e.g. PUT /v1/posts/{postId}).
    const contentLength = res.headers.get('content-length');
    const contentType = res.headers.get('content-type') || '';
    if (contentLength === '0' || !contentType) return undefined as T;

    const text = await res.text();
    if (!text) return undefined as T;
    return JSON.parse(text) as T;
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

  presignMedia(body: MediaPresignRequest, profileId?: string) {
    return this.request<MediaPresignResponse>('/v1/media/presign', {
      method: 'POST',
      body,
      params: profileId ? { profileId } : undefined,
    });
  }

  completeMedia(mediaId: string) {
    return this.request<MediaCompleteResponse>(`/v1/media/${mediaId}/complete`, {
      method: 'POST',
    });
  }

  /** PUT file bytes to a presigned S3 URL (no Verlynk auth header). */
  async putPresignedUpload(uploadUrl: string, fileBytes: Buffer, contentType: string) {
    const res = await fetch(uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': contentType },
      body: new Uint8Array(fileBytes),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Upload PUT failed (HTTP ${res.status}): ${text || res.statusText}`);
    }
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

  listProfiles(params?: { includeOverLimit?: boolean }) {
    return this.request<{ profiles: Profile[] }>('/v1/profiles', {
      params: params as Record<string, unknown>,
    });
  }

  getProfile(profileId: string) {
    return this.request<{ profile: Profile }>(`/v1/profiles/${profileId}`);
  }

  getUsageStats() {
    return this.request<UsageStatsResponse>('/v1/usage-stats');
  }

  validatePostLength(body: ValidatePostLengthRequest) {
    return this.request<ValidatePostLengthResponse>('/v1/tools/validate/post-length', {
      method: 'POST',
      body,
    });
  }

  updatePost(postId: string, body: EditPostRequest, profileId?: string) {
    return this.request<void>(`/v1/posts/${postId}`, {
      method: 'PUT',
      body,
      params: profileId ? { profileId } : undefined,
    });
  }

  retryPost(postId: string, profileId?: string) {
    return this.request<{ message?: string }>(`/v1/posts/${postId}/retry`, {
      method: 'POST',
      params: profileId ? { profileId } : undefined,
    });
  }

  updateDraftPost(draftId: string, body: CreatePostsData, profileId?: string) {
    return this.request<{ message?: string }>(`/v1/posts/drafts/${draftId}`, {
      method: 'PUT',
      body,
      params: profileId ? { profileId } : undefined,
    });
  }

  deleteDraftPost(draftId: string, profileId?: string) {
    return this.request<void>(`/v1/posts/drafts/${draftId}`, {
      method: 'DELETE',
      params: profileId ? { profileId } : undefined,
    });
  }

  listApiKeys() {
    return this.request<{ apiKeys: ApiKey[] }>('/v1/api-keys');
  }

  createApiKey(body: CreateApiKeyRequest) {
    return this.request<CreateApiKeyResponse>('/v1/api-keys', {
      method: 'POST',
      body,
    });
  }

  deleteApiKey(keyId: string) {
    return this.request<{ message: string }>(`/v1/api-keys/${keyId}`, {
      method: 'DELETE',
    });
  }

  deleteAccount(accountId: string) {
    return this.request<{ message: string }>(`/v1/accounts/${accountId}`, {
      method: 'DELETE',
    });
  }

  createProfile(body: CreateProfileRequest) {
    return this.request<ProfileMutationResponse>('/v1/profiles', {
      method: 'POST',
      body,
    });
  }

  updateProfile(profileId: string, body: UpdateProfileRequest) {
    return this.request<ProfileMutationResponse>(`/v1/profiles/${profileId}`, {
      method: 'PUT',
      body,
    });
  }

  deleteProfile(profileId: string) {
    return this.request<{ message: string }>(`/v1/profiles/${profileId}`, {
      method: 'DELETE',
    });
  }

  getPostMetrics(postId: string) {
    return this.request<PostMetricsResponse>(`/v1/analytics/${postId}`);
  }

  getAnalyticsBestTime(params: { accountId: string; profileId?: string; postType?: string }) {
    const { profileId, ...rest } = params;
    return this.requestNdjson<BestTimeLine>('/v1/analytics/best-time', {
      ...rest,
      ...(profileId ? { profileId } : {}),
    });
  }

  listInbox(params: ListInboxParams) {
    const { profileId, ...rest } = params;
    return this.request<ListInboxResponse>('/v1/inbox', {
      params: {
        ...rest,
        ...(profileId ? { profileId } : {}),
      } as Record<string, unknown>,
    });
  }

  replyInbox(itemId: string, body: ReplyInboxRequest, profileId?: string) {
    return this.request<ReplyInboxResponse>(`/v1/inbox/${itemId}/reply`, {
      method: 'POST',
      body,
      params: profileId ? { profileId } : undefined,
    });
  }

  updateInboxStatus(itemId: string, body: UpdateInboxStatusRequest, profileId?: string) {
    return this.request<UpdateInboxStatusResponse>(`/v1/inbox/${itemId}/status`, {
      method: 'PUT',
      body,
      params: profileId ? { profileId } : undefined,
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

export interface Profile {
  _id: string;
  userId: string;
  name: string;
  description?: string;
  isDefault: boolean;
  isOverLimit?: boolean;
  createdAt: string;
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
