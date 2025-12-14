interface IUserSettings {
  hide_email?: boolean;
  hide_mobile?: boolean;
  hide_location?: boolean;
}

interface IUserSocials {
  website?: string;
  facebook?: string;
  twitter?: string;
  instagram?: string;
  linkedin?: string;
  snapchat?: string;
}

export interface IUser {
  title?: string;
  name?: string;
  email?: string;
  mobile?: string;
  username?: string;
  dob?: string;
  account_type?: number;
  address?: string;
  latitude?: number;
  longitude?: number;
  college_university_name?: string;
  settings?: IUserSettings;
  socials?: IUserSocials;
  company_name?: string;
  description?: string;
  fcm_tokens?: string;
  image_url?: string;
  thumbnail_url?: string;
}

export interface IUserResponse {
  data?: IUser;
  message: string;
  success: boolean;
}
