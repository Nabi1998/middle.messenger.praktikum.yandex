import { describe, it, expect, beforeEach, vi } from 'vitest';
import AppController from './AppController';
import View from './View';

// Mock View class for testing
class MockView extends View {
  protected template(): string {
    return '<div>Mock View</div>';
  }

  protected getData(): any {
    return { test: 'data' };
  }
}

describe('AppController', () => {
  let controller: AppController;

  beforeEach(() => {
    controller = new AppController();
  });

  it('should register and retrieve views', () => {
    const mockView = new MockView();
    controller.registerView('test', mockView);
    
    const retrievedView = controller.getView('test');
    expect(retrievedView).toBe(mockView);
  });

  it('should manage application state', () => {
    const initialState = controller.getState();
    expect(initialState.currentPage).toBe('loginPage');
    expect(initialState.user).toBeNull();
    expect(initialState.isLoading).toBe(false);

    // Set up a listener for state changes to avoid EventBus errors
    const eventBus = controller.getEventBus();
    eventBus.on('state:changed', () => {});

    controller.setState({ isLoading: true });
    const updatedState = controller.getState();
    expect(updatedState.isLoading).toBe(true);
  });

  it('should provide access to services', () => {
    const userService = controller.getUserService();
    expect(userService).toBeDefined();
    expect(typeof userService.login).toBe('function');
    expect(typeof userService.register).toBe('function');
  });

  it('should provide access to event bus', () => {
    const eventBus = controller.getEventBus();
    expect(eventBus).toBeDefined();
    expect(typeof eventBus.emit).toBe('function');
    expect(typeof eventBus.on).toBe('function');
  });
});
