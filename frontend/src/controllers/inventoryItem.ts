import axios, { AxiosInstance } from 'axios';
import { APIResponse, InventoryItem } from 'types';
import Config from 'config/index';

const apiClient: AxiosInstance = axios.create({
  baseURL: Config.API_URL
});

const createInventoryItem = async (
  data: any,
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

    // Handle pricing array
    if (data.pricing && Array.isArray(data.pricing)) {
      data.pricing.forEach((priceItem, index) => {
        if (priceItem.unit) {
          formData.append(`pricing[${index}][unit]`, priceItem.unit);
        }
        if (priceItem.amount !== undefined) {
          formData.append(
            `pricing[${index}][amount]`,
            priceItem.amount.toString()
          );
        }
        if (priceItem.isDefault !== undefined) {
          formData.append(
            `pricing[${index}][isDefault]`,
            priceItem.isDefault.toString()
          );
        }
      });
    }

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

    if (data.isTaxable)
      formData.append('isTaxable', data.isTaxable ? 'true' : 'false');

    if (data.specifications && data.specifications instanceof Map) {
      const plainObject: Record<string, any> = {};
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

const updateItem = async (
  id: string,
  data: Partial<InventoryItem>,
  accessToken: string,
  rawFiles?: File[],
  removedImageIds?: string[]
) => {
  try {
    // Filter out read-only/database fields
    const filteredData = {
      ...(data.name && { name: data.name }),
      ...(data.description && { description: data.description }),
      ...(data.sku && { sku: data.sku }),
      ...(data.quantity !== undefined && { quantity: data.quantity }),
      ...(data.status && { status: data.status }),
      ...(data.associatedFacility && {
        associatedFacility: data.associatedFacility
      }),
      ...(data.category && { category: data.category }),
      ...(data.pricing && { pricing: data.pricing }),
      ...(data.purchaseInfo && { purchaseInfo: data.purchaseInfo }),
      ...(data.alerts && { alerts: data.alerts }),
      ...(data.isTaxable !== undefined && { isTaxable: data.isTaxable }),
      ...(data.specifications && { specifications: data.specifications })
    };

    const formData = new FormData();

    // Add regular form fields - only from filteredData
    if (filteredData.name) formData.append('name', filteredData.name);
    if (filteredData.description)
      formData.append('description', filteredData.description);
    if (filteredData.sku) formData.append('sku', filteredData.sku);
    if (filteredData.quantity !== undefined)
      formData.append('quantity', filteredData.quantity.toString());
    if (filteredData.status) formData.append('status', filteredData.status);
    if (filteredData.associatedFacility)
      formData.append('associatedFacility', filteredData.associatedFacility);
    if (filteredData.category)
      formData.append('category', filteredData.category);

    if (filteredData.pricing && Array.isArray(filteredData.pricing)) {
      filteredData.pricing.forEach((priceItem, index) => {
        if (priceItem.unit) {
          formData.append(`pricing[${index}][unit]`, priceItem.unit);
        }
        if (priceItem.amount !== undefined) {
          formData.append(
            `pricing[${index}][amount]`,
            priceItem.amount.toString()
          );
        }
        if (priceItem.isDefault !== undefined) {
          formData.append(
            `pricing[${index}][isDefault]`,
            priceItem.isDefault.toString()
          );
        }
      });
    }

    if (filteredData.purchaseInfo) {
      const { purchaseDate, purchasePrice, supplier, warrantyExpiry } =
        filteredData.purchaseInfo;

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

    if (filteredData.alerts) {
      Object.entries(filteredData.alerts).forEach(([key, value]) => {
        if (value !== undefined) {
          formData.append(`alerts[${key}]`, String(value));
        }
      });
    }

    if (filteredData.isTaxable !== undefined)
      formData.append('isTaxable', filteredData.isTaxable ? 'true' : 'false');

    if (
      filteredData.specifications &&
      filteredData.specifications instanceof Map
    ) {
      const plainObject: Record<string, unknown> = {};
      filteredData.specifications.forEach((value, key) => {
        plainObject[key] = value;
      });
      formData.append('specifications', JSON.stringify(plainObject));
    }

    // Add new image files
    if (rawFiles && rawFiles.length > 0) {
      rawFiles.forEach(file => {
        formData.append('files', file);
      });
    }

    // Add removed image IDs
    if (removedImageIds && removedImageIds.length > 0) {
      formData.append('removeImageIds', JSON.stringify(removedImageIds));
    }

    const response = await apiClient.put<APIResponse<InventoryItem>>(
      `/inventory-items/${id}`,
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
      throw new Error(error.response?.data?.message || 'Failed to update item');
    } else {
      console.error('Unexpected error:', (error as Error).message);
      throw error;
    }
  }
};

const deleteItem = async (id: string, accessToken: string) => {
  try {
    const response = await apiClient.delete<APIResponse<InventoryItem>>(
      `/inventory-items/${id}`,
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
      throw new Error(error.response?.data?.message || 'Failed to update item');
    } else {
      console.error('Unexpected error:', (error as Error).message);
      throw error;
    }
  }
};

const restoreItem = async (id: string, accessToken: string) => {
  try {
    const response = await apiClient.post<APIResponse<InventoryItem>>(
      `/inventory-items/${id}/restore`,
      {}, // Empty body for POST request
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
      throw new Error(
        error.response?.data?.message || 'Failed to restore item'
      );
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
  getItemById,
  updateItem,
  deleteItem,
  restoreItem
};
