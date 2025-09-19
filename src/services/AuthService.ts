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
    } catch (error) {
      this.currentUser = null;
      this.isAuthenticated = false;
      return false;
    }
  }

  async signup(data: SignUpData): Promise<void> {
    try {
      await AuthAPI.signup(data);
      // После регистрации автоматически входим
      await this.signin({ login: data.login, password: data.password });
    } catch (error) {
      throw error;
    }
  }

  async signin(data: SignInData): Promise<void> {
    try {
      await AuthAPI.signin(data);
      this.currentUser = await AuthAPI.getUser();
      this.isAuthenticated = true;
    } catch (error) {
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      await AuthAPI.logout();
      this.currentUser = null;
      this.isAuthenticated = false;
    } catch (error) {
      throw error;
    }
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
