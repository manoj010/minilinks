export type UserProfile = {
  id: number;
  name: string;
  email: string;
  username: string;
  bio: string;
  avatar_url: string;
  theme: string;
  created_at: string;
  updated_at: string;
};

export type ProfileUpdate = Partial<
  Pick<UserProfile, 'name' | 'username' | 'bio' | 'avatar_url' | 'theme'>
>;
