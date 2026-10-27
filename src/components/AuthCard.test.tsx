import { ClickUIProvider } from '@clickhouse/click-ui';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthCard } from './AuthCard';

const { fetchMock, updateSession } = vi.hoisted(() => ({
  fetchMock: vi.fn<typeof fetch>(),
  updateSession: vi.fn(),
}));
vi.mock('@tanstack/react-router', () => ({
  useRouter: () => ({ invalidate: vi.fn(), navigate: vi.fn() }),
}));
vi.mock('@tanstack/react-start', () => ({
  createServerFn: () => ({
    handler: (handler: (...args: never[]) => unknown) => handler,
    inputValidator: () => ({ handler: (handler: (...args: never[]) => unknown) => handler }),
  }),
}));
vi.mock('@/server/session', () => ({
  SESSION_CONFIG: { revalidationInterval: 60_000, idleTimeout: 30 * 60 * 1000 },
  useAppSession: async () => ({ data: {}, update: updateSession }),
}));
vi.mock('@/hooks', async () => {
  const { default: translations } = await import('../locales/en/translation.json');
  return { useLocalize: () => (key: keyof typeof translations) => translations[key] };
});

afterEach(cleanup);
beforeEach(() => {
  fetchMock.mockReset();
  updateSession.mockReset();
  vi.stubEnv('API_SERVER_URL', 'http://librechat.test');
  vi.stubEnv('GOVERNANCE_PILOT_ENABLED', 'true');
  vi.stubGlobal('fetch', fetchMock);
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

function show(props: React.ComponentProps<typeof AuthCard> = {}) {
  return render(
    <QueryClientProvider client={new QueryClient()}>
      <ClickUIProvider theme="light">
        <AuthCard {...props} />
      </ClickUIProvider>
    </QueryClientProvider>,
  );
}

describe('mandatory SSO', () => {
  it('shows an unavailable state with no local credential form when LibreChat rejects SSO', async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 503 }));

    show();

    await waitFor(() =>
      expect(
        screen.getByText(/Single sign-on is unavailable or misconfigured/),
      ).toBeInTheDocument(),
    );
    expect(screen.queryByLabelText(/email/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/password/i)).not.toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      'http://librechat.test/api/admin/oauth/openid/check',
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
  });

  it('keeps local credentials hidden after automatic SSO fails', async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 200 }));
    updateSession.mockRejectedValueOnce(new Error('session store unavailable'));

    show({ autoRedirectSso: true });

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
