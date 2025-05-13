
// Re-export everything from the new modular structure
export * from './droits';

// Re-export notification types separately to avoid naming conflicts
export { notificationsService } from './notificationsService';
export type { Notification, Alerte, UserDroit } from './types';
