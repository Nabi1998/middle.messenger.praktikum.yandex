import HTTPTransport from './HTTPTransport';
import { User, ChangePasswordData, ChangeProfileData } from '../types/api';

class UserAPI extends HTTPTransport {
  constructor() {
    super('/user');
  }

  changeProfile(data: ChangeProfileData): Promise<User> {
    return this.put('/profile', { data }).then((response) => {
      if (response.status === 200) {
        return JSON.parse(response.response);
      }
      throw new Error(JSON.parse(response.response).reason || 'Failed to update profile');
    });
  }

  changeAvatar(data: FormData): Promise<User> {
    return this.put('/profile/avatar', { data }).then((response) => {
      console.log(JSON.parse(response.response))
      if (response.status === 200) {
        return JSON.parse(response.response);
      }
      throw new Error(JSON.parse(response.response).reason || 'Failed to update avatar');
    });
  }

  changePassword(data: ChangePasswordData): Promise<void> {
    console.log(data, 'data');
    return this.put('/password', { data: data as Record<string, unknown> }).then((response) => {
      if (response.status === 200) return;
      throw new Error(JSON.parse(response.response).reason || 'Failed to change password');
    });
  }

  searchUsers(login: string): Promise<User[]> {
    return this.post('/search', { data: { login } }).then((response) => {
      if (response.status === 200) {
        return JSON.parse(response.response);
      }
      throw new Error('Failed to search users');
    });
  }
}

export default new UserAPI();
