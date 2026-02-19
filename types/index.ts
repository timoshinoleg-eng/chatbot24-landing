// ============================================================================
// User Types
// ============================================================================

export type UserRole = 'ADMIN' | 'USER' | 'EDITOR';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  lastLoginAt?: Date | string;
  isActive: boolean;
}

export interface UserCreateInput {
  email: string;
  name: string;
  password: string;
  role?: UserRole;
  avatar?: string;
}

export interface UserUpdateInput {
  email?: string;
  name?: string;
  password?: string;
  role?: UserRole;
  avatar?: string;
  isActive?: boolean;
}

// ============================================================================
// Post Types
// ============================================================================

export type PostStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type PostType = 'ARTICLE' | 'NEWS' | 'TUTORIAL' | 'CASE_STUDY';

export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  status: PostStatus;
  type: PostType;
  authorId: string;
  author?: User;
  tags: string[];
  categoryId?: string;
  category?: Category;
  publishedAt?: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;
  viewCount: number;
  likes: number;
  readingTime?: number;
  telegramMessageId?: number;
  telegramChannelId?: string;
  metaTitle?: string;
  metaDescription?: string;
}

export interface PostCreateInput {
  title: string;
  slug?: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  status?: PostStatus;
  type?: PostType;
  tags?: string[];
  categoryId?: string;
  publishedAt?: Date | string;
  metaTitle?: string;
  metaDescription?: string;
}

export interface PostUpdateInput {
  title?: string;
  slug?: string;
  content?: string;
  excerpt?: string;
  coverImage?: string;
  status?: PostStatus;
  type?: PostType;
  tags?: string[];
  categoryId?: string;
  publishedAt?: Date | string;
  metaTitle?: string;
  metaDescription?: string;
}

// ============================================================================
// Category Types
// ============================================================================

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  icon?: string;
  parentId?: string;
  parent?: Category;
  children?: Category[];
  postCount?: number;
  order: number;
  isActive: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface CategoryCreateInput {
  name: string;
  slug?: string;
  description?: string;
  color?: string;
  icon?: string;
  parentId?: string;
  order?: number;
}

// ============================================================================
// Tag Types
// ============================================================================

export interface Tag {
  id: string;
  name: string;
  slug: string;
  postCount?: number;
  createdAt: Date | string;
}

// ============================================================================
// Telegram Types
// ============================================================================

export interface TelegramChannel {
  id: string;
  channelId: string;
  name: string;
  username?: string;
  description?: string;
  avatar?: string;
  memberCount?: number;
  isActive: boolean;
  lastSyncAt?: Date | string;
  createdAt: Date | string;
}

export interface TelegramMessage {
  id: string;
  messageId: number;
  channelId: string;
  content: string;
  text: string;
  mediaUrls?: string[];
  postId?: string;
  views?: number;
  forwards?: number;
  replies?: number;
  sentAt: Date | string;
  createdAt: Date | string;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: ApiMeta;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
}

export interface ApiMeta {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
  hasNext?: boolean;
  hasPrev?: boolean;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: ApiMeta;
}

// ============================================================================
// Component Prop Types
// ============================================================================

export interface BaseComponentProps {
  className?: string;
  id?: string;
}

export interface ButtonProps extends BaseComponentProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  type?: 'button' | 'submit' | 'reset';
  onClick?: () => void;
  children: React.ReactNode;
}

export interface CardProps extends BaseComponentProps {
  title?: string;
  description?: string;
  footer?: React.ReactNode;
  header?: React.ReactNode;
  children: React.ReactNode;
  hoverable?: boolean;
  clickable?: boolean;
  onClick?: () => void;
}

export interface InputProps extends BaseComponentProps {
  label?: string;
  error?: string;
  helperText?: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'textarea' | 'select';
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  value?: string | number;
  defaultValue?: string | number;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  name?: string;
}

export interface ModalProps extends BaseComponentProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  children: React.ReactNode;
  footer?: React.ReactNode;
  hideCloseButton?: boolean;
}

export interface PaginationProps extends BaseComponentProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showFirstLast?: boolean;
  maxVisiblePages?: number;
}

export interface TableProps<T> extends BaseComponentProps {
  data: T[];
  columns: TableColumn<T>[];
  keyExtractor: (item: T) => string;
  onRowClick?: (item: T) => void;
  isLoading?: boolean;
  emptyMessage?: string;
  sortable?: boolean;
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
}

export interface TableColumn<T> {
  key: string;
  header: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
}

export interface PostCardProps extends BaseComponentProps {
  post: Post;
  variant?: 'default' | 'compact' | 'featured';
  showExcerpt?: boolean;
  showAuthor?: boolean;
  showDate?: boolean;
  showTags?: boolean;
  onClick?: () => void;
}

export interface PostListProps extends BaseComponentProps {
  posts: Post[];
  layout?: 'grid' | 'list';
  columns?: 1 | 2 | 3 | 4;
  loading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  emptyMessage?: string;
}

export interface EditorProps extends BaseComponentProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
  maxHeight?: string;
  disabled?: boolean;
  onImageUpload?: (file: File) => Promise<string>;
}

export interface ImageUploaderProps extends BaseComponentProps {
  value?: string;
  onChange: (url: string) => void;
  onRemove?: () => void;
  accept?: string;
  maxSize?: number; // in MB
  aspectRatio?: number;
  placeholder?: string;
  disabled?: boolean;
}

export interface SearchInputProps extends BaseComponentProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  loading?: boolean;
  onSearch?: (value: string) => void;
  debounceMs?: number;
}

export interface TabsProps extends BaseComponentProps {
  tabs: { id: string; label: string; icon?: React.ReactNode }[];
  activeTab: string;
  onChange: (tabId: string) => void;
  children: React.ReactNode;
}

export interface ToastProps {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  onClose?: () => void;
}

export interface ConfirmationDialogProps extends Omit<ModalProps, 'children'> {
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'warning' | 'info';
}

// ============================================================================
// Form Types
// ============================================================================

export interface FormFieldError {
  message: string;
  type: string;
}

export interface FormErrors {
  [key: string]: FormFieldError;
}

export interface LoginFormData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface PostFormData {
  title: string;
  content: string;
  excerpt: string;
  coverImage: string;
  status: PostStatus;
  type: PostType;
  tags: string[];
  categoryId: string;
  publishedAt: string;
  metaTitle: string;
  metaDescription: string;
}

// ============================================================================
// Dashboard Types
// ============================================================================

export interface DashboardStats {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  totalViews: number;
  totalLikes: number;
  newPostsThisWeek: number;
  viewsThisWeek: number;
  topPosts: Post[];
  recentActivity: Activity[];
}

export interface Activity {
  id: string;
  type: 'post_created' | 'post_updated' | 'post_published' | 'post_deleted' | 'user_login';
  userId: string;
  user?: User;
  targetId?: string;
  targetType?: string;
  details?: Record<string, unknown>;
  createdAt: Date | string;
}

// ============================================================================
// Settings Types
// ============================================================================

export interface SiteSettings {
  siteName: string;
  siteDescription: string;
  siteUrl: string;
  logo?: string;
  favicon?: string;
  defaultMetaTitle?: string;
  defaultMetaDescription?: string;
  googleAnalyticsId?: string;
  yandexMetrikaId?: string;
  telegramBotToken?: string;
  telegramChannelId?: string;
  postsPerPage: number;
  enableComments: boolean;
  enableNewsletter: boolean;
  maintenanceMode: boolean;
}

// ============================================================================
// Sync Types
// ============================================================================

export interface SyncResult {
  success: boolean;
  syncedPosts: number;
  errors: SyncError[];
  startedAt: Date | string;
  completedAt: Date | string;
}

export interface SyncError {
  messageId?: number;
  error: string;
  details?: string;
}

// ============================================================================
// Utility Types
// ============================================================================

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type SortDirection = 'asc' | 'desc';

export interface SortState {
  key: string;
  direction: SortDirection;
}

export interface FilterState {
  [key: string]: string | string[] | number | boolean | undefined;
}
