import { DefaultUser } from 'next-auth';
import { UserRole } from '@prisma/client';

declare module 'next-auth' {
  interface User extends DefaultUser {
    role: UserRole;
  }
  
  interface Session {
    user: User;
  }
} 