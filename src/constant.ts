export const BASE_URl="http://localhost:3000/api/v1"
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