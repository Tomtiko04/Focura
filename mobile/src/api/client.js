import axios from 'axios';
import { API_BASE_URL } from 'focura-shared';

// NOTE: If testing on a physical device, replace localhost with your LAN IP
export const api = axios.create({
  baseURL: API_BASE_URL,
  // Authorization header will be configured by authStore when a token is present
});
