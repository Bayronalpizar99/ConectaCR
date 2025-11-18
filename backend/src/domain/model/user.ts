export type UserRole = 'citizen' | 'admin';

export class User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}
