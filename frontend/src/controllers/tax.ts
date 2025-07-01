import axios, { AxiosInstance } from 'axios';
import { APIResponse, Tax } from 'types';
import Config from 'config/index';

const apiClient: AxiosInstance = axios.create({
  baseURL: Config.API_URL
});

const createTax = async (data: Partial<Tax>, accessToken: string) => {
  try {
    const response = await apiClient.post<APIResponse<Partial<Tax>>>(
      '/taxes',
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

const getAllTaxes = async (accessToken: string) => {
  try {
    const response = await apiClient.get<APIResponse<Partial<Tax[]>>>(
      '/taxes',
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

const getTaxById = async (taxId: string, accessToken: string) => {
  try {
    const response = await apiClient.get<APIResponse<Partial<Tax>>>(
      `/taxes/${taxId}`,
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

const updateTax = async (
  taxId: string,
  data: Partial<Tax>,
  accessToken: string
) => {
  try {
    const response = await apiClient.put<APIResponse<Partial<Tax>>>(
      `/taxes/${taxId}`,
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

const deleteTax = async (taxId: string, accessToken: string) => {
  try {
    const response = await apiClient.delete<APIResponse<Partial<Tax>>>(
      `/taxes/${taxId}`,

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

export { createTax, deleteTax, updateTax, getAllTaxes, getTaxById };
