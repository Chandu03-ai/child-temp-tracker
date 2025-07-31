export interface LoginFormData {
  username: string;
  password: string;
}
export type LoginCredentials = LoginFormData;
export interface RegisterFormData {
  username: string;
  email: string;
  password: string;
}

  export interface User {
    id: string;
    name: string;
    email: string;
  }