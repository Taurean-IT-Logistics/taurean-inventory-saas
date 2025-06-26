import Config from 'config/index';

export * as UserController from './user';
export * as FacilityController from './facilty';
export * as InventoryItemController from './inventoryItem';
export * as BookingController from './booking';
export * as TransactionController from './transaction';

const API_BASE_URL = `${Config.API_URL}/resources/`;

export const getResourceUrl = (path: string): string => {
  if (!path) return '';

  // Normalize path for all OS (especially Windows backslashes)
  const normalizedPath = path.replace(/\\/g, '/');

  return `${API_BASE_URL}${normalizedPath}`;
};
