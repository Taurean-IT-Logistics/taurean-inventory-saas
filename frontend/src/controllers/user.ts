import axios, { AxiosInstance } from 'axios';
import { APIResponse, User } from 'types';
import Config from 'config/index';

const apiClient: AxiosInstance = axios.create({
  baseURL: Config.API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

interface LoginResponse {
  user: User;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

const createUser = async (data: Partial<User>) => {
  try {
    const response = await apiClient.post<APIResponse<LoginResponse>>(
      '/auth/register',
      data
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Axios error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Something went wrong');
    } else {
      console.error('Unexpected error:', (error as Error).message);
      throw error;
    }
  }
};

const loginUser = async (identifier: string, password: string) => {
  try {
    const response = await apiClient.post<APIResponse<LoginResponse>>(
      '/auth/login',
      {
        identifier,
        password
      }
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Axios error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Something went wrong');
    } else {
      console.error('Unexpected error:', (error as Error).message);
      throw error;
    }
  }
};

const refreshToken = async (refreshToken: string) => {
  try {
    const response = await apiClient.post<APIResponse<LoginResponse>>(
      '/auth/refresh',
      {
        refreshToken
      }
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Axios error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Something went wrong');
    } else {
      console.error('Unexpected error:', (error as Error).message);
      throw error;
    }
  }
};

const getAllusers = async (accessToken: string) => {
  try {
    const response = await apiClient.get<APIResponse<User>>('/users', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Axios error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Something went wrong');
    } else {
      console.error('Unexpected error:', (error as Error).message);
      throw error;
    }
  }
};
export { loginUser, createUser, refreshToken, getAllusers };
