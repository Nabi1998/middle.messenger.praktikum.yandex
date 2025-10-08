import HTTPTransport from './HTTPTransport';
import { SignUpData, SignInData, User, SignUpResponse } from '../types/api';

class AuthAPI extends HTTPTransport {
  constructor() {
    super('/auth');
  }

  signup(data: SignUpData): Promise<SignUpResponse> {
    return this.post('/signup', { data }).then((response) => {
      if (response.status === 200) {
        return JSON.parse(response.response);
      }
      throw new Error(JSON.parse(response.response).reason || 'Signup failed');
    });
  }

  signin(data: SignInData): Promise<void> {
    return this.post('/signin', { data }).then((response) => {
      if (response.status === 200) {
        return;
      }
      throw new Error(JSON.parse(response.response).reason || 'Signin failed');
    });
  }

  getUser(): Promise<User> {
    return this.get('/user').then((response) => {
      if (response.status === 200) {
        return JSON.parse(response.response);
      }
      throw new Error('Failed to get user info');
    });
  }

  logout(): Promise<void> {
    return this.post('/logout').then((response) => {
      if (response.status === 200) {
        return;
      }
      throw new Error('Logout failed');
    });
  }
}

export default new AuthAPI();
