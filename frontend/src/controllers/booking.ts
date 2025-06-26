import axios, { AxiosInstance } from 'axios';
import { APIResponse, Booking } from 'types';
import Config from 'config/index';

const apiClient: AxiosInstance = axios.create({
  baseURL: Config.API_URL
});

const bookFacility = async (data: Partial<Booking>, accessToken: string) => {
  try {
    const response = await apiClient.post<APIResponse<Partial<Booking>>>(
      '/bookings',
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

const getAllBookings = async (accessToken: string) => {
  try {
    const response = await apiClient.get<APIResponse<Partial<Booking>>>(
      '/bookings',
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

export { bookFacility, getAllBookings };
