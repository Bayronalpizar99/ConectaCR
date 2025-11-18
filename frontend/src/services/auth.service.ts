import { api } from '../lib/api';
import { User } from '../types';

// Tipos para los datos de registro y login, puedes moverlos a 'types' si prefieres
type RegisterData = {
  name: string;
  email: string;
  password: string;
};

type LoginData = {
  email: string;
  password: string;
};

export const authService = {
  register: async (data: RegisterData): Promise<any> => {
    return api.post('auth/register', data);
  },

  login: async (data: LoginData): Promise<{ user: User; session: any }> => {
    const response = await api.post('auth/login', data);
    // Adaptamos la respuesta de Supabase a lo que el frontend espera
    return {
      user: {
        id: response.user.id,
        email: response.user.email,
        name: response.user.user_metadata.name,
        role: response.user.user_metadata.role,
      },
      session: response.session,
    };
  },

  logout: async (): Promise<void> => {
    // Aquí iría la llamada a Supabase para invalidar el token si es necesario
    // Por ahora, solo limpiaremos el estado local
    return Promise.resolve();
  },
};
