import { USERS } from './data';

export type UserRole = 'admin' | 'cliente' | 'duenioGrad';
export const DEMO_ROLE_KEY = 'tickest_demo_role';

export interface User {
  id: string;
  usuario: string;
  email: string;
  name: string;
  numeroCelular: string;
  cuentaBanco?: string;
  role: UserRole;
}

function notifyAuthChange() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('auth-change'));
  }
}

export async function login(identificador: string, password: string): Promise<User> {
  const found = USERS.find(
    (u) =>
      (u.usuario === identificador || u.email === identificador) &&
      u.password === password
  );
  if (!found) throw new Error('Credenciales inválidas');

  const { password: _pw, ...user } = found;
  return user;
}

// Simula el flujo de "Continuar con Google": no hay OAuth real ni backend,
// solo se identifica al usuario demo por su email (sin password) para que
// la experiencia se sienta como un login social.
export async function loginWithGoogle(email: string): Promise<User> {
  await new Promise((r) => setTimeout(r, 1100));

  const found = USERS.find((u) => u.email === email);
  if (!found) throw new Error('No existe una cuenta de Google vinculada a este usuario');

  const { password: _pw, ...user } = found;
  return user;
}

interface GoogleIdTokenPayload {
  sub: string;
  email: string;
  email_verified?: boolean;
  name?: string;
  given_name?: string;
}

function decodeGoogleIdToken(idToken: string): GoogleIdTokenPayload {
  const payload = idToken.split('.')[1];
  if (!payload) throw new Error('Token de Google inválido');

  // atob espera base64 estándar; el JWT viene en base64url.
  const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
  const json = decodeURIComponent(
    atob(base64)
      .split('')
      .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
      .join('')
  );
  return JSON.parse(json);
}

// Login real con Google (Google Identity Services) sin backend propio: no hay
// forma de verificar la firma del JWT del lado del cliente, así que esto NO
// es seguro para producción (cualquiera podría fabricar un token y pasar la
// verificación) — sirve para que la app funcione mientras no exista un
// backend (apps/api) que valide el token contra Google.
export function loginWithGoogleCredential(idToken: string): User {
  const payload = decodeGoogleIdToken(idToken);
  if (!payload.email) throw new Error('La cuenta de Google no tiene un email');

  const existente = USERS.find((u) => u.email.toLowerCase() === payload.email.toLowerCase());
  if (existente) {
    const { password: _pw, ...user } = existente;
    return user;
  }

  return {
    id: `google:${payload.sub}`,
    usuario: payload.email.split('@')[0] ?? payload.email,
    email: payload.email,
    name: payload.name || payload.given_name || payload.email,
    numeroCelular: '',
    role: 'cliente',
  };
}

export function getRedirectForUser(user: User, fallbackUrl?: string | null): string {
  if (user.role === 'admin') {
    return '/dashboard';
  }
  if (user.role === 'duenioGrad') {
    return '/panel-graderia';
  }
  return fallbackUrl || '/graderias';
}

export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') return null;
  try {
    const saved = localStorage.getItem('tickest_user');
    if (saved) return JSON.parse(saved) as User;
    return setDemoRole('cliente');
  } catch {
    return getDemoUser('cliente');
  }
}

export function getDemoUser(role: UserRole): User {
  const id = role === 'admin' ? '1' : role === 'duenioGrad' ? '3' : '2';
  const { password: _password, ...user } = USERS.find((item) => item.id === id)!;
  return user;
}

export function setDemoRole(role: UserRole): User {
  if (typeof window === 'undefined') return getDemoUser(role);
  const user = getDemoUser(role);
  localStorage.setItem(DEMO_ROLE_KEY, role);
  localStorage.setItem('tickest_user', JSON.stringify(user));
  notifyAuthChange();
  return user;
}

export function logout(): void {
  setDemoRole('cliente');
}
