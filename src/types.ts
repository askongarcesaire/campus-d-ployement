export type Role = 'STUDENT' | 'MODERATOR' | 'ADMIN';
export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'BANNED';

export interface StudentProfile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  headline?: string;
  bio?: string;
  avatar_url?: string;
  cover_url?: string;
  country: string;
  city?: string;
  institution: string;
  faculty?: string;
  field_of_study: string;
  academic_level: string;
  graduation_year?: number;
  interests: string[];
  skills: string[];
  languages: string[];
  linkedin_url?: string;
  github_url?: string;
  portfolio_url?: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  role: Role;
  status: UserStatus;
  created_at?: string;
  profile?: StudentProfile | null;
  stats?: {
    postsCount: number;
    resourcesCount: number;
    unreadNotifs: number;
    unreadMessages: number;
  };
}

export interface PostAttachment {
  url: string;
  name: string;
  size?: number;
  type?: string;
}

export interface Post {
  id: string;
  author_id: string;
  content: string;
  category: 'GENERAL' | 'ACADEMIC' | 'SCHOLARSHIP' | 'INTERNSHIP' | 'HOUSING' | 'ADVICE';
  attachments: PostAttachment[];
  likes_count: number;
  comments_count: number;
  shares_count: number;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
  institution: string;
  field_of_study: string;
  academic_level: string;
  headline?: string;
  author_role?: Role;
  isLiked?: boolean;
  isSaved?: boolean;
}

export interface PostComment {
  id: string;
  post_id: string;
  author_id: string;
  parent_id?: string | null;
  content: string;
  created_at: string;
  updated_at: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
  institution: string;
  field_of_study: string;
}

export interface Opportunity {
  id: string;
  author_id: string;
  title: string;
  description: string;
  organization: string;
  country: string;
  category: 'SCHOLARSHIP_INTL' | 'SCHOLARSHIP_NATL' | 'INTERNSHIP' | 'JOB' | 'EXCHANGE' | 'CONTEST' | 'TRAINING' | 'HOUSING';
  academic_level?: string;
  field_of_study?: string;
  requirements?: string;
  required_documents?: string;
  application_url?: string;
  attachment_url?: string;
  deadline?: string;
  status: 'OPEN' | 'CLOSED' | 'SUSPENDED';
  is_verified: boolean;
  verified_by?: string;
  views_count: number;
  favorites_count: number;
  created_at: string;
  updated_at: string;
  author_first_name?: string;
  author_last_name?: string;
  author_avatar?: string;
  isFavorited?: boolean;
}

export interface AcademicResource {
  id: string;
  uploader_id: string;
  title: string;
  description?: string;
  institution: string;
  field_of_study: string;
  academic_level: string;
  subject: string;
  category: 'COURSE' | 'TUTORIAL_TD' | 'PRACTICAL_TP' | 'EXAM' | 'EXAM_SOLUTION' | 'THESIS' | 'METHOD_GUIDE';
  file_url: string;
  file_name: string;
  file_size: number;
  file_type: string;
  download_count: number;
  is_verified: boolean;
  created_at: string;
  uploader_first_name?: string;
  uploader_last_name?: string;
  uploader_avatar?: string;
}

export interface AcademicGroup {
  id: string;
  name: string;
  description: string;
  category: string;
  institution?: string;
  country?: string;
  avatar_url?: string;
  is_private: boolean;
  created_by_id: string;
  members_count: number;
  created_at: string;
  isMember?: boolean;
}

export interface Conversation {
  id: string;
  type: 'DIRECT' | 'GROUP';
  title?: string;
  updated_at: string;
  unread_count?: number;
  last_message?: {
    id: string;
    content: string;
    sender_id: string;
    created_at: string;
    is_read: boolean;
  };
  recipient?: {
    id: string;
    role: Role;
    first_name: string;
    last_name: string;
    avatar_url?: string;
    institution: string;
    field_of_study: string;
  };
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  attachments: any[];
  is_read: boolean;
  created_at: string;
  sender_first_name?: string;
  sender_last_name?: string;
  sender_avatar?: string;
}

export interface NotificationItem {
  id: string;
  user_id: string;
  actor_id?: string;
  type: 'LIKE' | 'COMMENT' | 'OPPORTUNITY' | 'MESSAGE' | 'GROUP_ANNOUNCEMENT' | 'SYSTEM';
  title: string;
  message: string;
  link?: string;
  is_read: boolean;
  created_at: string;
  actor_first_name?: string;
  actor_last_name?: string;
  actor_avatar?: string;
}

export interface ReportItem {
  id: string;
  reporter_id: string;
  target_type: 'POST' | 'COMMENT' | 'USER' | 'OPPORTUNITY' | 'RESOURCE' | 'MESSAGE';
  target_id: string;
  reason: string;
  details?: string;
  status: 'PENDING' | 'IN_REVIEW' | 'RESOLVED' | 'DISMISSED';
  resolved_by?: string;
  resolution_note?: string;
  created_at: string;
  reporter_first_name?: string;
  reporter_last_name?: string;
}

export interface ReferenceData {
  countries: string[];
  institutions: string[];
  fieldsOfStudy: string[];
  academicLevels: string[];
  opportunityCategories: { id: string; label: string }[];
  resourceCategories: { id: string; label: string }[];
  directory?: Record<string, any>;
  stats?: {
    totalUsers: number;
    totalOpportunities: number;
    totalResources: number;
  };
}

export type LogoType = 
  | 'icon_grad_cap' 
  | 'icon_shield' 
  | 'icon_book' 
  | 'icon_torch' 
  | 'icon_star' 
  | 'icon_globe'
  | 'icon_tree'
  | 'icon_feather'
  | 'custom_url';

export type LogoShape = 'rounded' | 'circle' | 'shield' | 'minimal';
export type LogoSize = 'small' | 'medium' | 'large';
export type AnnouncementType = 'info' | 'warning' | 'success' | 'urgent';
export type ThemeColor = 'blue' | 'amber' | 'emerald' | 'indigo' | 'crimson' | 'purple' | 'custom';

export interface SiteSettings {
  id?: string;
  platform_name: string;
  platform_slogan: string;
  institution_tag?: string;
  logo_type: LogoType;
  logo_url?: string;
  logo_shape?: LogoShape;
  logo_size?: LogoSize;
  primary_color: ThemeColor;
  custom_color_hex?: string;
  banner_announcement?: string;
  banner_type?: AnnouncementType;
  show_announcement: boolean;
  default_tab?: 'feed' | 'opportunities' | 'resources' | 'directory';
  updated_at?: string;
}

export interface UserPreferences {
  themeMode: 'light' | 'dark' | 'system';
  fontSize: 'normal' | 'comfortable' | 'compact';
  notifications: {
    scholarships: boolean;
    messages: boolean;
    comments: boolean;
    announcements: boolean;
  };
  privacy: {
    profilePublic: boolean;
    showUniversityOnly: boolean;
    allowDirectMessages: boolean;
    showEmailPublicly: boolean;
  };
}
