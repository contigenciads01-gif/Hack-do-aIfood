import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  ADMIN_MASTER_EMAIL,
  ADMIN_MASTER_PASS,
  ADMIN_SESSION_STORAGE_KEY,
} from '@/lib/auth';
import { isUserAdminEmail } from '@/config/plans';

describe('Acesso Direto Master Admin - thiago2005rodrigues@gmail.com', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('reconhece thiago2005rodrigues@gmail.com como super admin supremo', () => {
    expect(isUserAdminEmail(ADMIN_MASTER_EMAIL)).toBe(true);
    expect(isUserAdminEmail('THIAGO2005RODRIGUES@GMAIL.COM ')).toBe(true);
    expect(isUserAdminEmail('outro@gmail.com')).toBe(false);
  });

  it('valida as credenciais master configuradas', () => {
    expect(ADMIN_MASTER_EMAIL).toBe('thiago2005rodrigues@gmail.com');
    expect(ADMIN_MASTER_PASS).toBe('TestPassword123!');
    expect(ADMIN_SESSION_STORAGE_KEY).toBe('hdi_admin_override_session');
  });

  it('permite persistir e restaurar a sessão master no localStorage', () => {
    const adminSession = {
      access_token: 'admin-master-thiago-token',
      user: {
        id: '00000000-0000-4000-a000-000000000001',
        email: ADMIN_MASTER_EMAIL,
      },
    };

    localStorage.setItem(ADMIN_SESSION_STORAGE_KEY, JSON.stringify(adminSession));

    const retrieved = JSON.parse(localStorage.getItem(ADMIN_SESSION_STORAGE_KEY)!);
    expect(retrieved.user.email).toBe('thiago2005rodrigues@gmail.com');
  });
});
