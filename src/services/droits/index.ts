
// Re-export the droits service
export * from './droits';

// Re-export notification types separately to avoid naming conflicts
export { notificationsService } from './notificationsService';
export type { Notification, Alerte } from './types';

