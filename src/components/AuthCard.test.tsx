import { ClickUIProvider } from '@clickhouse/click-ui';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthCard } from './AuthCard';

const { login } = vi.hoisted(() => ({ login: vi.fn() }));
vi.mock('@tanstack/react-router', () => ({
  useRouter: () => ({ invalidate: vi.fn(), navigate: vi.fn() }),
}));
vi.mock('@/hooks', async () => {
  const { default: translations } = await import('../locales/en/translation.json');
  return { useLocalize: () => (key: keyof typeof translations) => translations[key] };
});
vi.mock('@/server', () => ({
  adminLoginFn: vi.fn(),
  adminVerify2FAFn: vi.fn(),
  openidLoginFn: login,
  openIdCheckOptions: { queryKey: ['sso'], queryFn: vi.fn() },
}));

afterEach(cleanup);
beforeEach(() => {
  login.mockReset();
});
function show(props: React.ComponentProps<typeof AuthCard>) {
  return render(
    <QueryClientProvider client={new QueryClient()}>
      <ClickUIProvider theme="light">
        <AuthCard {...props} />
      </ClickUIProvider>
    </QueryClientProvider>,
  );
}

describe('mandatory SSO', () => {
  it('shows an unavailable state with no local credential form', () => {
    show({ ssoOnly: true, ssoAvailable: false });
    expect(screen.getByText(/Single sign-on is unavailable or misconfigured/)).toBeInTheDocument();
    expect(screen.queryByLabelText(/email/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/password/i)).not.toBeInTheDocument();
  });

  it('keeps local credentials hidden after automatic SSO fails', async () => {
    login.mockResolvedValue({ error: true });
    show({ ssoOnly: true, ssoAvailable: true, autoRedirectSso: true });
    await waitFor(() =>
      expect(
        screen.getByText(/Single sign-on is unavailable or misconfigured/),
      ).toBeInTheDocument(),
    );
    expect(screen.queryByLabelText(/password/i)).not.toBeInTheDocument();
  });

  it('preserves the ordinary local login form outside SSO-only mode', () => {
    show({ ssoOnly: false, ssoAvailable: false });
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });
});
