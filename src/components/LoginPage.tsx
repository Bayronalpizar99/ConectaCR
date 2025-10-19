import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
// import { Shield, MapPin, AlertTriangle } from 'lucide-react'; // Importaciones eliminadas
import { mockLogin, saveCurrentUser } from '../utils/mockData';
import { User } from '../types';

interface LoginPageProps {
  onLogin: (user: User) => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const user = mockLogin(email, password);
    if (user) {
      saveCurrentUser(user);
      onLogin(user);
    } else {
      setError('Credenciales incorrectas. Use password como contraseña.');
    }
  };

  const handleDemoLogin = (role: 'citizen' | 'admin') => {
    const demoEmail = role === 'admin' ? 'admin@municipalidad.com' : 'ciudadano@ejemplo.com';
    const user = mockLogin(demoEmail, 'password');
    if (user) {
      saveCurrentUser(user);
      onLogin(user);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Ajuste clave:
        Cambiamos 'max-w-md' por 'sm:max-w-lg'
        'w-full' -> para móviles
        'sm:max-w-lg' -> para limitar el ancho en pantallas 'sm' (640px) y superiores
      */}
      <Card className="shadow-xl w-full sm:max-w-lg">
        <CardHeader>
          <CardTitle>{isRegistering ? 'Crear Cuenta' : 'Iniciar Sesión'}</CardTitle>
          <CardDescription>
            {isRegistering 
              ? 'Regístrate para comenzar a reportar problemas' 
              : 'Accede a tu cuenta para gestionar reportes'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegistering && (
              <div className="space-y-2">
                <Label htmlFor="name">Nombre completo</Label>
                <Input id="name" placeholder="Juan Pérez" />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="correo@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input 
                id="password" 
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full">
              {isRegistering ? 'Registrarse' : 'Ingresar'}
            </Button>
          </form>

          <div className="mt-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-2 text-slate-500">o</span>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <Button 
                type="button" 
                variant="outline" 
                className="w-full"
                onClick={() => handleDemoLogin('citizen')}
              >
                Demo como Ciudadano
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                className="w-full"
                onClick={() => handleDemoLogin('admin')}
              >
                Demo como Administrador
              </Button>
            </div>
          </div>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-primary hover:underline"
            >
              {isRegistering ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
            </button>
          </div>

          <div className="mt-4 p-3 bg-muted rounded-lg">
            <p className="text-muted-foreground">
              <strong>Demo:</strong> usa "password" como contraseña
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}