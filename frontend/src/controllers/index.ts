import Config from 'config/index';

export * as UserController from './user';
export * as FacilityController from './facilty';
export * as InventoryItemController from './inventoryItem';
export * as BookingController from './booking';
export * as TransactionController from './transaction';
export * as TaxController from './tax';

const API_BASE_URL = `${Config.API_URL}/resources/`;

export const getResourceUrl = (path: string): string => {
  if (!path) return '';

  // Normalize path for all OS (especially Windows backslashes)
  const normalizedPath = path.replace(/\\/g, '/');

  if (path.includes('http') || !normalizedPath.includes('uploads/')) {
    return path;
  }

  return `${API_BASE_URL}${normalizedPath}`;
};
