import axios from 'axios';
import { serviceBaseUrl } from '../constants/appConstant';
import { RegisterFormData, LoginFormData } from '../types/forms';

const API = serviceBaseUrl;
// Create Axios instance
export const api = axios.create({
  baseURL: serviceBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const verifyTokenService = async () => {
  try {
    const response = await axios.post(
      `${serviceBaseUrl}/verifyToken`,
      {},
      {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    return { success: true, data: response.data };
  } catch (error: unknown) {
    console.error('Error verifying token:', error);

    if (axios.isAxiosError(error)) {
      return { success: false, message: error.message };
    }

    return { success: false, message: 'An unknown error occurred' };
  }
};

export const loginUser = async (data: LoginFormData): Promise<any> => {
  try {
    const response = await axios.post(`${serviceBaseUrl}/login`, data, {
      withCredentials: true,
    });

    if (!response.data) {
      throw new Error("Failed to login");
    }
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.status === 401) {
      throw new Error("Invalid username or password");
    } else {
      throw error;
    }
  }
};

export const registerUser = async (data: RegisterFormData): Promise<any> => {
  try {
    const response = await axios.post(`${serviceBaseUrl}/register`, data, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error: any) {
    console.error("Registration Error:", error.response ? error.response.data : error.message);
    throw error;
  }
};

export const logout = async (): Promise<any> => {
  try {
    const response = await axios.post(`${serviceBaseUrl}/logout`);
    return response.data.code;
  } catch (error) {
    throw error;
  }
};
