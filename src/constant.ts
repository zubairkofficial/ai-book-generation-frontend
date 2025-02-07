export const BASE_URl="http://localhost:3000/api/v1"
// export const BASE_URl="http://98.81.186.4/backend/api/v1"
export enum ToastType {
    SUCCESS = 'success',
    ERROR = 'error',
    WARNING = 'warning',
    INFO = 'info',
  }

  export type Toast = {
    id: string;
    message: string;
    type: ToastType; // Use the enum here
  };