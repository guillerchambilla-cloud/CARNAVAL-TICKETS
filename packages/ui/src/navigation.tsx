'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { UserRole } from '@repo/auth';

const baseLinks = [
  { label: 'Inicio',              href: '/'          },
  { label: 'Entrada Tiempo Real', href: '/recorrido' },
  { label: 'Rol de Entrada',      href: '/programa'  },
  { label: 'Danzas',              href: '/danzas'    },
];

const clienteLinks = [
  { label: 'Graderías',           href: '/graderias'   },
  { label: 'Mis asientos',        href: '/misAsientos' },
  { label: 'Reventa de Asientos', href: '/reventa'     },
];

const duenoLinks = [
  { label: 'Panel Gradería',      href: '/panel-graderia'          },
   { label: 'Reportes',            href: '/reportes'                },
  { label: 'Mis Asientos',        href: '/misAsientos'             },
  { label: 'Reventas',            href: '/reventa'                 },
  { label: 'Verificar entrada',   href: '/panel-graderia/verificar' },
];

export function getLinks(role?: UserRole | null) {
  const [inicio, ...resto] = baseLinks;
  if (role === 'cliente') return [inicio!, ...clienteLinks, ...resto];
  if (role === 'duenioGrad') return [inicio!, ...duenoLinks];
  return baseLinks;
}

type NavProps = {
  onClose?: () => void;
  mobile?: boolean;
  role?: UserRole | null;
};

export default function Nav({ onClose, mobile = false, role }: NavProps) {
  const pathname = usePathname();
  const links = getLinks(role);

  return (
    <nav
      className={
        mobile
          ? 'flex flex-col gap-1'
          : 'flex items-center gap-1 text-[15px]'
      }
    >
      {links.map(({ label, href }) => {
        const active =
          pathname === href || (href !== '/' && pathname.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            onClick={onClose}
            className={
              mobile
                ? `rounded-lg px-3 py-2.5 text-[15px] font-medium transition-colors ${
                    active
                      ? 'bg-[#fdf1f1] text-[#c71f1f]'
                      : 'text-[#1c1717] hover:bg-[#fdf1f1] hover:text-[#c71f1f]'
                  }`
                : `relative whitespace-nowrap rounded-full px-3.5 py-2 font-medium transition-colors ${
                    active
                      ? 'bg-[#fdf1f1] text-[#c71f1f] font-semibold'
                      : 'text-[#595252] hover:bg-gray-50 hover:text-[#1c1717]'
                  }`
            }
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}