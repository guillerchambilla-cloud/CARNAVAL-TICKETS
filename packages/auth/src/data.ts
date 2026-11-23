import type { UserRole } from './auth';

export interface MockUser {
  id: string;
  usuario: string;       // 🆕 username para login
  email: string;
  password: string;
  name: string;
  numeroCelular: string; // 🆕
  cuentaBanco?: string;  // 🆕 solo aplica a duenioGrad
  role: UserRole;
}

export const USERS: MockUser[] = [
  {
    id: '1',
    usuario: 'admin',
    email: 'admin@tickest.com',
    password: 'admin123',
    name: 'Admin',
    numeroCelular: '+591 700 00001',
    role: 'admin',
  },
  {
    id: '2',
    usuario: 'jperez',
    email: 'cliente@tickest.com',
    password: 'cliente123',
    name: 'Juan Pérez',
    numeroCelular: '+591 700 00002',
    role: 'cliente',
  },
  {
    id: '3',
    usuario: 'rquispe',
    email: 'conjunto@tickest.com',
    password: 'conjunto123',
    name: 'Ramiro Quispe',
    numeroCelular: '+591 700 00003',
    cuentaBanco: 'Banco Unión — Cta. 1234567890',
    role: 'duenioGrad',
  },
  {
    id: '4',
    usuario: 'jlopez',
    email: 'cliente2@tickest.com',
    password: 'cliente123',
    name: 'LOPEZ',
    numeroCelular: '+591 700 00002',
    role: 'cliente',
  },
];