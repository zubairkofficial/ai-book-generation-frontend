// interfaces/user.interface.ts
export interface UserInterface {
  id: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  name: string;
  email: string;
  password: string;
  phoneNumber: string | null;
  isEmailVerified: boolean;
  availableAmount: number;
  hasUsedFreeTrial: boolean;
  twoFactorSecret: string | null;
  role: string;
  isNewUser: boolean;
  status: 'PENDING_PAYMENT' | 'PENDING_APPROVAL' | 'ACTIVE' | 'REJECTED';
  paymentStatus: 'UNPAID' | 'PAID';
}

export interface UpdateUserPayload {
  name?: string;
  email?: string;
  password?: string;
  phoneNumber?: string | null;
}