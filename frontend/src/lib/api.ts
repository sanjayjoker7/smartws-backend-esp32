/**
 * API Client for Django Backend
 * 
 * This module provides functions to communicate with the Django backend API.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Generic fetch wrapper with error handling
 */
async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const defaultOptions: RequestInit = {
    credentials: 'include', // Include cookies for session auth
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  const mergedOptions = { ...defaultOptions, ...options };

  // Don't set Content-Type for FormData
  if (options.body instanceof FormData) {
    delete (mergedOptions.headers as Record<string, string>)['Content-Type'];
  }

  const response = await fetch(url, mergedOptions);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(error.error || error.detail || 'Request failed');
  }

  return response.json();
}

// ==================== Bin Status APIs ====================

export interface BinData {
  id: number;
  type: 'wet' | 'reject' | 'recyclable' | 'hazardous';
  bin_type: string;
  label: string;
  fill_level: number;
  total_capacity: number;
  today_collection: number;
  yesterday_collection: number;
  total_collection: number;
  last_updated: string;
}

/**
 * Fetch all bin statuses
 */
export async function fetchBins(): Promise<BinData[]> {
  return fetchAPI<BinData[]>('/bins/');
}

/**
 * Fetch a specific bin by type
 */
export async function fetchBinByType(binType: string): Promise<BinData> {
  return fetchAPI<BinData>(`/bins/${binType}/`);
}

/**
 * Update bin status
 */
export async function updateBinStatus(
  binType: string,
  data: Partial<BinData>
): Promise<BinData> {
  return fetchAPI<BinData>(`/bins/${binType}/`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

// ==================== Classification APIs ====================

export interface Classification {
  id: number;
  image: string;
  waste_type: string;
  confidence: number;
  esp32_device_id: string;
  processed: boolean;
  created_at: string;
}

/**
 * Fetch classification history
 */
export async function fetchClassifications(params?: {
  waste_type?: string;
  start_date?: string;
  end_date?: string;
}): Promise<Classification[]> {
  const searchParams = new URLSearchParams();
  if (params?.waste_type) searchParams.append('waste_type', params.waste_type);
  if (params?.start_date) searchParams.append('start_date', params.start_date);
  if (params?.end_date) searchParams.append('end_date', params.end_date);

  const query = searchParams.toString();
  return fetchAPI<Classification[]>(`/classifications/${query ? `?${query}` : ''}`);
}

// ==================== Collection History APIs ====================

export interface CollectionHistory {
  id: number;
  bin_type: string;
  date: string;
  total_collected: number;
  classification_count: number;
  created_at: string;
}

/**
 * Fetch collection history
 */
export async function fetchCollectionHistory(binType?: string): Promise<CollectionHistory[]> {
  const query = binType ? `?bin_type=${binType}` : '';
  return fetchAPI<CollectionHistory[]>(`/history/${query}`);
}

// ==================== Auth APIs ====================

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

export interface AuthResponse {
  message: string;
  user: User;
}

export interface CurrentUserResponse {
  authenticated: boolean;
  user: User | null;
}

/**
 * Login user
 */
export async function loginUser(email: string, password: string): Promise<AuthResponse> {
  return fetchAPI<AuthResponse>('/auth/login/', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

/**
 * Register new user
 */
export async function registerUser(data: {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
  first_name?: string;
  last_name?: string;
}): Promise<AuthResponse> {
  return fetchAPI<AuthResponse>('/auth/register/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Logout user
 */
export async function logoutUser(): Promise<{ message: string }> {
  return fetchAPI<{ message: string }>('/auth/logout/', {
    method: 'POST',
  });
}

/**
 * Get current authenticated user
 */
export async function getCurrentUser(): Promise<CurrentUserResponse> {
  return fetchAPI<CurrentUserResponse>('/auth/user/');
}

// ==================== ESP32 Classification API ====================

export interface ClassifyResponse {
  waste_type: string;
  confidence: number;
  classification_id: number;
}

/**
 * Classify waste from image (for testing - normally done by ESP32)
 */
export async function classifyWaste(image: File, deviceId?: string): Promise<ClassifyResponse> {
  const formData = new FormData();
  formData.append('image', image);
  if (deviceId) formData.append('device_id', deviceId);

  return fetchAPI<ClassifyResponse>('/classify/', {
    method: 'POST',
    body: formData,
  });
}

// ==================== Dashboard Data API ====================
export interface DashboardData {
  bins: BinData[];
  total: number;
  wet: number;
  reject: number;
  recycle: number;
  hazardous: number;
}

export async function fetchDashboardData(): Promise<DashboardData> {
  return fetchAPI<DashboardData>('/dashboard_data');
}