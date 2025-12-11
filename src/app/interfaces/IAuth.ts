export interface IAuthResponse {
    success: boolean;
    message: string;
    data: {
        token: string;
    };
}