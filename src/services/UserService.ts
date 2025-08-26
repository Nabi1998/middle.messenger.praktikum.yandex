import { HttpClient } from '../utils/httpClient';

export interface User {
  id: string;
  first_name: string;
  second_name: string;
  login: string;
  email: string;
  phone: string;
  avatar?: string;
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

export class UserService {
  private http: HttpClient;
  private currentUser: User | null = null;

  constructor() {
    this.http = new HttpClient('/api');
  }

  async login(data: LoginData): Promise<User> {
    const response = await this.http.post<User>('/auth/signin', { body: data });
    this.currentUser = response;
    return response;
  }

  async register(data: RegistrationData): Promise<User> {
    const response = await this.http.post<User>('/auth/signup', { body: data });
    this.currentUser = response;
    return response;
  }

  async logout(): Promise<void> {
    await this.http.post('/auth/logout');
    this.currentUser = null;
  }

  async updateProfile(data: Partial<User>): Promise<User> {
    if (!this.currentUser) throw new Error('User not authenticated');
    const response = await this.http.put<User>('/user/profile', { body: data });
    this.currentUser = { ...this.currentUser, ...response };
    return this.currentUser;
  }

  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    await this.http.put('/user/password', { body: { oldPassword, newPassword } });
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }
}
