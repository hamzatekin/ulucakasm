import { writable } from 'svelte/store';

export const popupStore = writable({ isPopupOpen: false, component: null });
