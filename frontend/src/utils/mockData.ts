import { User } from '../types';

export const MOCK_USERS: User[] = [
  {
    id: '1',
    email: 'admin@municipalidad.com',
    name: 'Administrador Municipal',
    role: 'admin'
  },
  {
    id: '2',
    email: 'ciudadano@ejemplo.com',
    name: 'Juan Pérez',
    role: 'citizen'
  }
];

// Mock login function
export const mockLogin = (email: string, password: string): User | null => {
  const user = MOCK_USERS.find(u => u.email === email);
  if (user && password === 'password') {
    return user;
  }
  return null;
};

// Get current user from localStorage
export const getCurrentUser = (): User | null => {
  try {
    const stored = localStorage.getItem('currentUser');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Error loading user:', e);
  }
  return null;
};

// Save current user to localStorage
export const saveCurrentUser = (user: User | null): void => {
  try {
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('currentUser');
    }
  } catch (e) {
    console.error('Error saving user:', e);
  }
};
