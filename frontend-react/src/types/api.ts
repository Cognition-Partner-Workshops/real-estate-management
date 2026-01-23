export interface ApiResponse<T = unknown> {
  status: number;
  message?: string;
  data: T;
}

export interface ApiError {
  status: number;
  message: string;
  errors?: Record<string, string[]>;
}
