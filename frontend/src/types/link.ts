export type Link = {
  id: number;
  user_id: number;
  title: string;
  url: string;
  description: string;
  icon: string;
  position: number;
  is_active: boolean;
  click_count: number;
  created_at: string;
  updated_at: string;
};

export type LinkInput = {
  title: string;
  url: string;
  description?: string;
  icon?: string;
  position?: number;
  is_active?: boolean;
};
