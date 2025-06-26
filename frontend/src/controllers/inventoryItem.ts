import axios, { AxiosInstance } from 'axios';
import { APIResponse, InventoryItem } from 'types';
import Config from 'config/index';

const apiClient: AxiosInstance = axios.create({
  baseURL: Config.API_URL
});

const createInventoryItem = async (
  data: Partial<InventoryItem>,
  accessToken: string,
  rawFiles: File[] = []
) => {
  try {
    const formData = new FormData();

    if (data.name) formData.append('name', data.name);
    if (data.description) formData.append('description', data.description);
    if (data.sku) formData.append('sku', data.sku);
    if (data.quantity !== undefined)
      formData.append('quantity', data.quantity.toString());
    if (data.status) formData.append('status', data.status);
    if (data.associatedFacility)
      formData.append('associatedFacility', data.associatedFacility);
    if (data.category) formData.append('category', data.category);

    if (data.purchaseInfo) {
      const { purchaseDate, purchasePrice, supplier, warrantyExpiry } =
        data.purchaseInfo;

      if (purchaseDate)
        formData.append('purchaseInfo[purchaseDate]', purchaseDate.toString());
      if (purchasePrice !== undefined)
        formData.append(
          'purchaseInfo[purchasePrice]',
          purchasePrice.toString()
        );
      if (supplier) formData.append('purchaseInfo[supplier]', supplier);
      if (warrantyExpiry)
        formData.append(
          'purchaseInfo[warrantyExpiry]',
          warrantyExpiry.toString()
        );
    }

    if (data.alerts) {
      Object.entries(data.alerts).forEach(([key, value]) => {
        if (value !== undefined) {
          formData.append(`alerts[${key}]`, String(value));
        }
      });
    }

    if (data.specifications && data.specifications instanceof Map) {
      const plainObject: Record<string, unknown> = {};
      data.specifications.forEach((value, key) => {
        plainObject[key] = value;
      });
      formData.append('specifications', JSON.stringify(plainObject));
    }

    if (rawFiles.length > 0) {
      rawFiles.forEach(file => {
        formData.append('files', file);
      });
    }

    const response = await apiClient.post<APIResponse<InventoryItem>>(
      '/inventory-items',
      formData,
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
      throw new Error(error.response?.data?.message || 'Failed to create item');
    } else {
      console.error('Unexpected error:', (error as Error).message);
      throw error;
    }
  }
};

const getAllInventoryItems = async () => {
  try {
    const response = await apiClient.get('/inventory-items');

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Axios error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to create item');
    } else {
      console.error('Unexpected error:', (error as Error).message);
      throw error;
    }
  }
};

const getLowStockItems = async (accessToken: string) => {
  try {
    const response = await apiClient.get('/inventory-items/low-stock', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Axios error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to create item');
    } else {
      console.error('Unexpected error:', (error as Error).message);
      throw error;
    }
  }
};

const getItemById = async (id: string) => {
  try {
    const response = await apiClient.get<APIResponse<InventoryItem>>(
      `/inventory-items/${id}`
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Axios error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to create item');
    } else {
      console.error('Unexpected error:', (error as Error).message);
      throw error;
    }
  }
};

export {
  createInventoryItem,
  getAllInventoryItems,
  getLowStockItems,
  getItemById
};
