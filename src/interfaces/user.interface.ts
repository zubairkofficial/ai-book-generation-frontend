export interface UpdateUserPayload {
  name: string;
  email: string;
  oldPassword?: string;
  newPassword?: string;
} 