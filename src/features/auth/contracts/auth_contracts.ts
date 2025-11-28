export interface IAuthService {
    register(data: any): Promise<any>;
    login(data: any): Promise<any>;
    logout(): Promise<void>;
    resetPassword(email: string): Promise<void>;
    verifyEmail(token: string, email: string): Promise<any>;
    updateProfile(userId: string, updates: any): Promise<any>;
    uploadAvatar(file: File, userId: string): Promise<string | null>;
    deleteAvatar(avatarUrl: string): Promise<void>;
    getProfile(userId: string): Promise<any>;
    updatePassword(password: string): Promise<void>;
    updateUsername(username: string): Promise<any>;
    validateInviteCode(code: string): Promise<boolean>;
    getSession(): Promise<any>;
    checkAuthStatus(): Promise<boolean>;
}
