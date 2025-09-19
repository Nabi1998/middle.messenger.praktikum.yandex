import AuthService from '../services/AuthService';

export interface Route {
  path: string;
  component: () => void;
  isProtected?: boolean;
}

export default class Router {
  private routes: Route[] = [];
  private currentPath: string = '';
  private publicRoutes: string[] = ['/', '/sign-up', '/404', '/500'];

  constructor() {
    // Don't initialize immediately, wait for routes to be set up
  }

  public start(): void {
    // Handle browser back/forward navigation
    window.addEventListener('popstate', () => {
      this.handleRoute(window.location.pathname);
    });

    // Handle initial page load
    this.handleRoute(window.location.pathname);
  }

  public use(path: string, component: () => void, isProtected: boolean = false): Router {
    this.routes.push({ path, component, isProtected });
    return this;
  }

  public go(path: string): void {
    if (this.currentPath === path) {
      return;
    }

    // Update browser history
    window.history.pushState({}, '', path);
    this.handleRoute(path);
  }

  public back(): void {
    window.history.back();
  }

  public forward(): void {
    window.history.forward();
  }

  private async handleRoute(path: string): Promise<void> {
    this.currentPath = path;
    
    // Check if route requires authentication
    const isPublicRoute = this.publicRoutes.includes(path);
    
    if (!isPublicRoute) {
      // Check authentication for protected routes
      const isAuthenticated = await AuthService.checkAuth();
      
      if (!isAuthenticated) {
        // Redirect to login page if not authenticated
        window.history.replaceState({}, '', '/');
        this.currentPath = '/';
        const loginRoute = this.routes.find(route => route.path === '/');
        if (loginRoute) {
          loginRoute.component();
        }
        return;
      }
    }
    
    // Find matching route
    const route = this.routes.find(route => route.path === path);
    
    if (route) {
      route.component();
    } else {
      // Handle 404 - find the 404 route or fallback to root
      const notFoundRoute = this.routes.find(route => route.path === '/404');
      if (notFoundRoute) {
        window.history.replaceState({}, '', '/404');
        this.currentPath = '/404';
        notFoundRoute.component();
      } else {
        // Fallback to root route
        const rootRoute = this.routes.find(route => route.path === '/');
        if (rootRoute && path !== '/') {
          window.history.replaceState({}, '', '/');
          this.currentPath = '/';
          rootRoute.component();
        }
      }
    }
  }

  public getCurrentPath(): string {
    return this.currentPath;
  }

  public async checkAuthAndRedirect(): Promise<void> {
    const isAuthenticated = await AuthService.checkAuth();
    
    if (isAuthenticated && (this.currentPath === '/' || this.currentPath === '/sign-up')) {
      // If user is authenticated and on login/signup page, redirect to messenger
      this.go('/messenger');
    }
  }
}
