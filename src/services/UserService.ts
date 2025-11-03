import { HttpClient } from '../utils/httpClient';

export interface User {
  id: string;
  first_name: string;
  second_name: string;
  login: string;
  email: string;
  phone: string;
  avatar?: string;
  display_name?: string;
}

export interface LoginData {
  login: string;
  password: string;
}

export interface RegistrationData {
  first_name: string;
  second_name: string;
  login: string;
  email: string;
  phone: string;
  password: string;
}

export default class UserService {
  private http: HttpClient;
  private currentUser: User | null = null;

  constructor() {
    this.http = new HttpClient('/api');
  }

  async login(data: LoginData): Promise<User> {
    try {
      const response = await this.http.post<User>('/auth/signin', { body: data });
      this.currentUser = response;
      return response;
    } catch {
      throw new Error('Login failed');
    }
  }

  async register(data: RegistrationData): Promise<User> {
    try {
      const response = await this.http.post<User>('/auth/signup', { body: data });
      this.currentUser = response;
      return response;
    } catch {
      throw new Error('Registration failed');
    }
  }

  async logout(): Promise<void> {
    try {
      await this.http.post('/auth/logout', {}); // пустой объект options
      this.currentUser = null;
    } catch {
      throw new Error('Logout failed');
    }
  }

  async updateProfile(data: Partial<User>): Promise<User> {
    if (!this.currentUser) throw new Error('User not authenticated');

    try {
      const response = await this.http.put<User>('/user/profile', { body: data });
      this.currentUser = { ...this.currentUser, ...response };
      return this.currentUser;
    } catch {
      throw new Error('Profile update failed');
    }
  }

  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    try {
      await this.http.put('/user/password', { body: { oldPassword, newPassword } });
    } catch {
      throw new Error('Password change failed');
    }
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }
}
