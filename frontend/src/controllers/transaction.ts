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

const getAllTransactions = async (accessToken: string) => {
  try {
    const response = await apiClient.get<APIResponse<Partial<Transaction>>>(
      '/transaction',
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

const getAllUserTransactions = async (accessToken: string) => {
  try {
    const response = await apiClient.get<APIResponse<Partial<Transaction[]>>>(
      '/transaction/user',
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

const getTransaction = async (reference: string, accessToken: string) => {
  try {
    const response = await apiClient.get<APIResponse<Partial<Transaction>>>(
      `/transaction/details/${reference}`,
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

const verifyTransaction = async (
  paymentReference: string,
  accessToken: string
) => {
  try {
    const response = await apiClient.get(
      `/transaction/verify/${paymentReference}`,
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

const updateTransaction = async (
  transactionId: string,
  data: Partial<Transaction>,
  accessToken: string
) => {
  try {
    const response = await apiClient.put<APIResponse<Partial<Transaction>>>(
      `/transaction/${transactionId}`,
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

export {
  createTransaction,
  getAllTransactions,
  getAllUserTransactions,
  getTransaction,
  verifyTransaction,
  updateTransaction
};
