export interface IAuthService {
    register(data: any): Promise<any>;
    login(data: any): Promise<any>;
    logout(): Promise<void>;
    resetPassword(email: string): Promise<void>;
    verifyEmail(token: string, email: string): Promise<any>;
    updateProfile(userId: string, updates: any): Promise<any>;
    getSession(): Promise<any>;
    checkAuthStatus(): Promise<boolean>;
}
