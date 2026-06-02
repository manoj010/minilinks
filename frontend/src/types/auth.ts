import type { UserProfile } from './profile';

export type AuthResponse = {
  access_token: string;
  token_type: 'bearer';
  user: UserProfile;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type RegisterInput = LoginInput & {
  name: string;
  username: string;
  confirmPassword: string;
};
