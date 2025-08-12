import axios, { AxiosInstance } from 'axios';
import { APIResponse, Facility } from 'types';
import Config from 'config/index';

const apiClient: AxiosInstance = axios.create({
  baseURL: Config.API_URL
});

const createFacility = async (
  data: Partial<Facility>,
  accessToken: string,
  rawFiles: File[]
) => {
  try {
    const formData = new FormData();

    if (data.name) formData.append('name', data.name);
    if (data.description) formData.append('description', data.description);
    if (data.location?.address)
      formData.append('location[address]', data.location.address);
    if (data.location?.coordinates?.latitude !== undefined)
      formData.append(
        'location[coordinates][latitude]',
        data.location.coordinates.latitude.toString()
      );
    if (data.location?.coordinates?.longitude !== undefined)
      formData.append(
        'location[coordinates][longitude]',
        data.location.coordinates.longitude.toString()
      );

    if (data.capacity?.maximum !== undefined)
      formData.append('capacity[maximum]', data.capacity.maximum.toString());
    if (data.capacity?.recommended !== undefined)
      formData.append(
        'capacity[recommended]',
        data.capacity.recommended.toString()
      );

    if (data.operationalHours?.opening)
      formData.append(
        'operationalHours[opening]',
        data.operationalHours.opening
      );
    if (data.operationalHours?.closing)
      formData.append(
        'operationalHours[closing]',
        data.operationalHours.closing
      );

    if (data.amenities && Array.isArray(data.amenities)) {
      data.amenities.forEach(amenity => formData.append('amenities', amenity));
    }

    if (data.terms) formData.append('terms', data.terms);
    if (data.isTaxable)
      formData.append('isTaxable', data.isTaxable ? 'true' : 'false');

    // ✅ Add pricing
    if (data.pricing && Array.isArray(data.pricing)) {
      data.pricing.forEach((price, index) => {
        if (price.unit) formData.append(`pricing[${index}][unit]`, price.unit);
        if (price.amount !== undefined)
          formData.append(`pricing[${index}][amount]`, price.amount.toString());
        formData.append(
          `pricing[${index}][isDefault]`,
          price.isDefault ? 'true' : 'false'
        );
      });
    }

    // ✅ Add availability
    if (data.availability && Array.isArray(data.availability)) {
      data.availability.forEach((slot, index) => {
        if (slot.day) formData.append(`availability[${index}][day]`, slot.day);
        if (slot.startTime)
          formData.append(`availability[${index}][startTime]`, slot.startTime);
        if (slot.endTime)
          formData.append(`availability[${index}][endTime]`, slot.endTime);
        formData.append(
          `availability[${index}][isAvailable]`,
          slot.isAvailable ? 'true' : 'false'
        );
      });
    }

    if (rawFiles && rawFiles.length > 0) {
      rawFiles.forEach(file => formData.append('files', file));
    }

    const response = await apiClient.post<APIResponse<Partial<Facility>>>(
      '/facilities',
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
      throw new Error(error.response?.data?.message || 'Something went wrong');
    } else {
      console.error('Unexpected error:', (error as Error).message);
      throw error;
    }
  }
};
const getAllFacilites = async () => {
  try {
    const response = await apiClient.get('/facilities');

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

const getFacilityById = async (id: string) => {
  try {
    const response = await apiClient.get(`/facilities/${id}`);

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

const updateFacility = async (
  id: string,
  data: Partial<Facility>,
  accessToken: string,
  rawFiles?: File[],
  removedImageIds?: string[]
) => {
  try {
    // Filter out read-only/database fields
    const filteredData = {
      ...(data.name && { name: data.name }),
      ...(data.description && { description: data.description }),
      ...(data.location && { location: data.location }),
      ...(data.capacity && { capacity: data.capacity }),
      ...(data.operationalHours && { operationalHours: data.operationalHours }),
      ...(data.amenities && { amenities: data.amenities }),
      ...(data.pricing && { pricing: data.pricing }),
      ...(data.availability && { availability: data.availability }),
      ...(data.terms && { terms: data.terms }),
      ...(data.isTaxable !== undefined && { isTaxable: data.isTaxable }),
      ...(data.isActive !== undefined && { isActive: data.isActive })
    };

    const formData = new FormData();

    // Only append fields that exist in filteredData
    if (filteredData.name) formData.append('name', filteredData.name);
    if (filteredData.description)
      formData.append('description', filteredData.description);

    if (filteredData.location?.address)
      formData.append('location[address]', filteredData.location.address);
    if (filteredData.location?.coordinates?.latitude !== undefined)
      formData.append(
        'location[coordinates][latitude]',
        filteredData.location.coordinates.latitude.toString()
      );
    if (filteredData.location?.coordinates?.longitude !== undefined)
      formData.append(
        'location[coordinates][longitude]',
        filteredData.location.coordinates.longitude.toString()
      );

    if (filteredData.capacity?.maximum !== undefined)
      formData.append(
        'capacity[maximum]',
        filteredData.capacity.maximum.toString()
      );
    if (filteredData.capacity?.recommended !== undefined)
      formData.append(
        'capacity[recommended]',
        filteredData.capacity.recommended.toString()
      );

    if (filteredData.operationalHours?.opening)
      formData.append(
        'operationalHours[opening]',
        filteredData.operationalHours.opening
      );
    if (filteredData.operationalHours?.closing)
      formData.append(
        'operationalHours[closing]',
        filteredData.operationalHours.closing
      );

    if (filteredData.amenities && Array.isArray(filteredData.amenities)) {
      filteredData.amenities.forEach(amenity =>
        formData.append('amenities', amenity)
      );
    }

    if (filteredData.terms) formData.append('terms', filteredData.terms);
    if (filteredData.isTaxable !== undefined)
      formData.append('isTaxable', filteredData.isTaxable ? 'true' : 'false');

    if (filteredData.isActive !== undefined)
      formData.append('isActive', filteredData.isActive ? 'true' : 'false');

    // Add pricing
    if (filteredData.pricing && Array.isArray(filteredData.pricing)) {
      filteredData.pricing.forEach((price, index) => {
        if (price.unit) formData.append(`pricing[${index}][unit]`, price.unit);
        if (price.amount !== undefined)
          formData.append(`pricing[${index}][amount]`, price.amount.toString());
        formData.append(
          `pricing[${index}][isDefault]`,
          price.isDefault ? 'true' : 'false'
        );
      });
    }

    // Add availability
    if (filteredData.availability && Array.isArray(filteredData.availability)) {
      filteredData.availability.forEach((slot, index) => {
        if (slot.day) formData.append(`availability[${index}][day]`, slot.day);
        if (slot.startTime)
          formData.append(`availability[${index}][startTime]`, slot.startTime);
        if (slot.endTime)
          formData.append(`availability[${index}][endTime]`, slot.endTime);
        formData.append(
          `availability[${index}][isAvailable]`,
          slot.isAvailable ? 'true' : 'false'
        );
      });
    }

    if (rawFiles && rawFiles.length > 0) {
      rawFiles.forEach(file => {
        formData.append('files', file);
      });
    }

    // Add removed image IDs
    if (removedImageIds && removedImageIds.length > 0) {
      formData.append('removeImageIds', JSON.stringify(removedImageIds));
    }

    const response = await apiClient.put<APIResponse<Facility>>(
      `/facilities/${id}`,
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
      throw new Error(error.response?.data?.message || 'Something went wrong');
    } else {
      console.error('Unexpected error:', (error as Error).message);
      throw error;
    }
  }
};

const deleteFacility = async (id: string, accessToken: string) => {
  try {
    const response = await apiClient.delete<APIResponse<Facility>>(
      `/facilities/${id}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
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

const leaveReview = async (
  id: string,
  accessToken: string,
  body: {
    rating: number;
    comment: string;
  }
) => {
  try {
    const response = await apiClient.post<APIResponse<Facility>>(
      `/facilities/${id}/review`,
      body,
      { headers: { Authorization: `Bearer ${accessToken}` } }
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

interface GetReviewParams {
  page?: number;
  limit?: number;
}

const getReviews = async (id: string, params?: GetReviewParams) => {
  try {
    const response = await apiClient.get<APIResponse<Facility>>(
      `/facilities/${id}/reviews`,
      {
        params: {
          ...(params?.page && { page: params.page }),
          ...(params?.limit && { limit: params.limit })
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
  createFacility,
  getAllFacilites,
  getFacilityById,
  updateFacility,
  deleteFacility,
  leaveReview,
  getReviews
};
