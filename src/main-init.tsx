
import { initializeApp } from './utils/app-init';

// Initialize application
export function initApp() {
  initializeApp().catch(error => {
    console.error("Error during app initialization:", error);
  });
}
