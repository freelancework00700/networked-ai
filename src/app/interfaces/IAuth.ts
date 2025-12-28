import { IUser } from './IUser';

export interface IAuthUser extends IUser {
  token?: string;
  password?: string;
}

export interface IAuthResponse {
  message: string;
  success: boolean;
  data: {
    token: string;
    user: IAuthUser;
    is_new_user: boolean;
  };
}

export interface ISendOtpPayload {
  email?: string;
  mobile?: string;
}

export interface IVerifyOtpPayload {
  code: string;
  email?: string;
  mobile?: string;
}

export type ILoginPayload =
  | { bearer_token: string }
  | { firebase_token: string }
  | { otp: string; mobile: string }
  | { email: string; password: string };

export interface IRegisterPayload {
  email?: string;
  mobile?: string;
  password?: string;
}
