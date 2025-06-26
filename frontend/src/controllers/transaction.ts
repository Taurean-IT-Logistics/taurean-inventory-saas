import axios, { AxiosInstance } from 'axios';
import { APIResponse, Transaction } from 'types';
import Config from 'config/index';

const apiClient: AxiosInstance = axios.create({
  baseURL: Config.API_URL
});

const createTransaction = async (
  data: Partial<Transaction>,
  accessToken: string
) => {
  try {
    const response = await apiClient.post<APIResponse<Partial<Transaction>>>(
      '/transaction/initialize',
      data,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
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

export { createTransaction };
