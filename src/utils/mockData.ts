import { Report, User } from '../types';

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

export const MOCK_REPORTS: Report[] = [
  {
    id: '1',
    userId: '2',
    userName: 'Juan Pérez',
    category: 'bache',
    title: 'Bache grande en Av. Principal',
    description: 'Hay un bache muy grande que está causando daños a los vehículos. Urge reparación.',
    location: {
      lat: 9.9334,
      lng: -84.0844,
      address: 'Av. Principal, San José'
    },
    imageUrl: 'https://images.unsplash.com/photo-1709934730506-fba12664d4e4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3Rob2xlJTIwcm9hZCUyMGRhbWFnZXxlbnwxfHx8fDE3NjA0NjI3Mzd8MA&ixlib=rb-4.1.0&q=80&w=1080',
    status: 'en_progreso',
    createdAt: '2025-10-10T10:30:00Z',
    updatedAt: '2025-10-12T14:20:00Z'
  },
  {
    id: '2',
    userId: '2',
    userName: 'Juan Pérez',
    category: 'alumbrado',
    title: 'Luz de calle no funciona',
    description: 'La luz de la calle está apagada hace una semana. La zona queda muy oscura por la noche.',
    location: {
      lat: 9.9280,
      lng: -84.0907,
      address: 'Calle 5, Barrio Amón'
    },
    imageUrl: 'https://images.unsplash.com/photo-1742119193536-7d228ef7f466?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicm9rZW4lMjBzdHJlZXQlMjBsaWdodHxlbnwxfHx8fDE3NjA0NjI3Mzh8MA&ixlib=rb-4.1.0&q=80&w=1080',
    status: 'recibido',
    createdAt: '2025-10-13T16:45:00Z',
    updatedAt: '2025-10-13T16:45:00Z'
  },
  {
    id: '3',
    userId: '3',
    userName: 'María González',
    category: 'semaforo',
    title: 'Semáforo en amarillo intermitente',
    description: 'El semáforo de este cruce está en amarillo intermitente desde ayer. Genera confusión.',
    location: {
      lat: 9.9350,
      lng: -84.0780,
      address: 'Cruce Paseo Colón con Calle 40'
    },
    imageUrl: 'https://images.unsplash.com/photo-1694301744244-9f026c0e1419?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cmFmZmljJTIwbGlnaHQlMjBtYWxmdW5jdGlvbnxlbnwxfHx8fDE3NjA0ODkwNjV8MA&ixlib=rb-4.1.0&q=80&w=1080',
    status: 'resuelto',
    createdAt: '2025-10-08T08:15:00Z',
    updatedAt: '2025-10-11T11:00:00Z'
  },
  {
    id: '4',
    userId: '4',
    userName: 'Carlos Rodríguez',
    category: 'inundacion',
    title: 'Calle inundada por lluvia',
    description: 'La calle se inunda cada vez que llueve. El alcantarillado no funciona correctamente.',
    location: {
      lat: 9.9400,
      lng: -84.0950,
      address: 'Av. Segunda, Barrio México'
    },
    imageUrl: 'https://images.unsplash.com/photo-1657069342866-2d11c2509b02?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmbG9vZGVkJTIwc3RyZWV0fGVufDF8fHx8MTc2MDQ4OTA2NXww&ixlib=rb-4.1.0&q=80&w=1080',
    status: 'en_progreso',
    createdAt: '2025-10-11T12:00:00Z',
    updatedAt: '2025-10-13T09:30:00Z'
  },
  {
    id: '5',
    userId: '2',
    userName: 'Juan Pérez',
    category: 'alcantarilla',
    title: 'Alcantarilla tapada con basura',
    description: 'La alcantarilla está completamente obstruida. Genera mal olor y puede causar inundaciones.',
    location: {
      lat: 9.9250,
      lng: -84.0820,
      address: 'Calle 15, San Pedro'
    },
    status: 'recibido',
    createdAt: '2025-10-14T07:20:00Z',
    updatedAt: '2025-10-14T07:20:00Z'
  },
  {
    id: '6',
    userId: '5',
    userName: 'Ana Martínez',
    category: 'fuga_agua',
    title: 'Fuga de agua en tubería principal',
    description: 'Hay una fuga grande de agua potable. Se está desperdiciando mucha agua.',
    location: {
      lat: 9.9380,
      lng: -84.0880,
      address: 'Barrio Escalante'
    },
    status: 'en_progreso',
    createdAt: '2025-10-12T15:30:00Z',
    updatedAt: '2025-10-13T10:00:00Z'
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

// Get reports from localStorage or use mock data
export const getReports = (): Report[] => {
  try {
    const stored = localStorage.getItem('reports');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Error loading reports:', e);
  }
  return MOCK_REPORTS;
};

// Save reports to localStorage
export const saveReports = (reports: Report[]): void => {
  try {
    localStorage.setItem('reports', JSON.stringify(reports));
  } catch (e) {
    console.error('Error saving reports:', e);
  }
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
