import AuthAPI from './AuthAPI';
import { User, SignUpData, SignInData } from '../types/api';

class AuthService {
  private currentUser: User | null = null;
  private isAuthenticated: boolean = false;

  async checkAuth(): Promise<boolean> {
    try {
      this.currentUser = await AuthAPI.getUser();
      this.isAuthenticated = true;
      return true;
    } catch {
      this.currentUser = null;
      this.isAuthenticated = false;
      return false;
    }
  }

  async signup(data: SignUpData): Promise<void> {
    await AuthAPI.signup(data);
    // После регистрации автоматически входим
    // await this.signin({ login: data.login, password: data.password });
  }

  async signin(data: SignInData): Promise<void> {
    console.log(data, 'data')
    await AuthAPI.signin(data);
    this.currentUser = await AuthAPI.getUser();
    this.isAuthenticated = true;
  }

  async logout(): Promise<void> {
    await AuthAPI.logout();
    this.currentUser = null;
    this.isAuthenticated = false;
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  getIsAuthenticated(): boolean {
    return this.isAuthenticated;
  }

  updateUser(user: User): void {
    this.currentUser = user;
  }
}

export default new AuthService();
