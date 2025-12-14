export interface IAuthResponse {
  message: string;
  success: boolean;
  data: {
    token: string;
  };
}
