import EventBus from './EventBus';
import UserService from './UserService';
import View from './View';
import { User } from '../types/api';

export interface AppState {
  currentPage: string;
  user: User | null;
  isLoading: boolean;
}

interface ChangePasswordData {
  oldPassword: string;
  newPassword: string;
}

export default class AppController {
  private eventBus: EventBus;
  private userService: UserService;
  private views: Map<string, View> = new Map();
  private currentView: View | null = null;
  private state: AppState;

  constructor() {
    this.eventBus = new EventBus();
    this.userService = new UserService();
    this.state = {
      currentPage: 'loginPage',
      user: null,
      isLoading: false
    };

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    this.eventBus.on('page:change', this.changePage.bind(this));
    this.eventBus.on('user:login', this.handleLogin.bind(this));
    this.eventBus.on('user:register', this.handleRegister.bind(this));
    this.eventBus.on('user:logout', this.handleLogout.bind(this));
    this.eventBus.on('user:updateProfile', this.handleUpdateProfile.bind(this));
    this.eventBus.on('user:changePassword', this.handleChangePassword.bind(this));
  }

  public registerView(name: string, view: View): void {
    this.views.set(name, view);
  }

  public getView(name: string): View | undefined {
    return this.views.get(name);
  }

  public getCurrentView(): View | null {
    return this.currentView;
  }

  public getState(): AppState {
    return { ...this.state };
  }

  public setState(newState: Partial<AppState>): void {
    this.state = { ...this.state, ...newState };
    this.eventBus.emit('state:changed', this.state);
  }

  public getUserService(): UserService {
    return this.userService;
  }

  public getEventBus(): EventBus {
    return this.eventBus;
  }

  private async changePage(pageName: string): Promise<void> {
    const view = this.views.get(pageName);
    if (!view) {
      console.error(`View ${pageName} not found`);
      return;
    }

    if (this.currentView) {
      this.currentView.hide();
    }

    this.currentView = view;
    this.setState({ currentPage: pageName });

    view.show();
    this.eventBus.emit('page:rendered', pageName);
  }

  private async handleLogin(data: Record<string, unknown>): Promise<void> {
    try {
      this.setState({ isLoading: true });
      const user = await this.userService.login(data);
      this.setState({ user, isLoading: false });
      this.eventBus.emit('page:change', 'chatPage');
    } catch (error) {
      this.setState({ isLoading: false });
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      this.eventBus.emit('error:show', errorMessage);
    }
  }

  private async handleRegister(data: Record<string, unknown>): Promise<void> {
    try {
      this.setState({ isLoading: true });
      const user = await this.userService.register(data);
      this.setState({ user, isLoading: false });
      this.eventBus.emit('page:change', 'chatPage');
    } catch (error) {
      this.setState({ isLoading: false });
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      this.eventBus.emit('error:show', errorMessage);
    }
  }
  private async handleLogout(): Promise<void> {
    try {
      await this.userService.logout();
      this.setState({ user: null });
      this.eventBus.emit('page:change', 'loginPage');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Logout failed';
      this.eventBus.emit('error:show', errorMessage);
    }
  }

  private async handleUpdateProfile(data: Partial<User>): Promise<void> {
    try {
      this.setState({ isLoading: true });
      const user = await this.userService.updateProfile(data);
      this.setState({ user, isLoading: false });
      this.eventBus.emit('success:show', 'Profile updated successfully');
    } catch (error) {
      this.setState({ isLoading: false });
      const errorMessage = error instanceof Error ? error.message : 'Profile update failed';
      this.eventBus.emit('error:show', errorMessage);
    }
  }

  private async handleChangePassword(data: ChangePasswordData): Promise<void> {
    try {
      this.setState({ isLoading: true });
      await this.userService.changePassword(data.oldPassword, data.newPassword);
      this.setState({ isLoading: false });
      this.eventBus.emit('success:show', 'Password changed successfully');
    } catch (error) {
      this.setState({ isLoading: false });
      const errorMessage = error instanceof Error ? error.message : 'Password change failed';
      this.eventBus.emit('error:show', errorMessage);
    }
  }
}
