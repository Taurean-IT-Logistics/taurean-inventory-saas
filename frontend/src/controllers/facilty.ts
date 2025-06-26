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

export { createFacility, getAllFacilites, getFacilityById };
