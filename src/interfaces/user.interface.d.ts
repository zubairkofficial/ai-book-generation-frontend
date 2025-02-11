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
    twoFactorSecret: string | null;
    role: string;
  }
  
  export interface UpdateUserPayload {
    name?: string;
    email?: string;
    password?: string;
    phoneNumber?: string | null;
  }