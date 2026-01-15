export interface GamificationBadge {
  id: string;
  event_count: number;
  badge: string;
  title: string;
  priority: number;
  is_locked: boolean;
  completed_date: string | null;
  url?: string;
}

export interface GamificationCategory {
  category_id: string;
  category_name: string;
  current_count: number;
  next_badge_count: number;
  badges: GamificationBadge[];
}

export interface UserGamificationResponse {
  success: boolean;
  message: string;
  data: {
    total_events_hosted?: GamificationCategory;
    total_events_attended?: GamificationCategory;
    total_networks?: GamificationCategory;
    total_messages_sent?: GamificationCategory;
    total_qr_codes_scanned?: GamificationCategory;
  };
}

export interface LeaderboardUser {
  id: string;
  rank: number;
  name: string;
  email: string | null;
  username: string;
  image_url: string | null;
  thumbnail_url: string | null;
  is_current_user: boolean;
  points: number;
}

export interface LeaderboardData {
  leaderboard: LeaderboardUser[];
  current_user: LeaderboardUser | null;
}

export interface LeaderboardResponse {
  success: boolean;
  message: string;
  data: {
    weekly: LeaderboardData;
    alltime: LeaderboardData;
  };
}

