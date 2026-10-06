import { describe, expect, it } from 'vitest';
import { resolveNavigationUrls } from './navigation';

describe('cross-application navigation', () => {
  it('uses the Gateway entry route for Chat when configured', () => {
    expect(
      resolveNavigationUrls('https://gateway.example.test/', 'https://chat.example.test/chat'),
    ).toEqual({
      gatewayUrl: 'https://gateway.example.test',
      chatUrl: 'https://gateway.example.test/api/auth/open-chat',
    });
  });

  it('uses the configured Chat base path without a Gateway', () => {
    expect(resolveNavigationUrls(undefined, 'https://chat.example.test/chat/')).toEqual({
      gatewayUrl: undefined,
      chatUrl: 'https://chat.example.test/chat/c/new',
    });
  });

  it('does not expose unsupported URL schemes', () => {
    expect(resolveNavigationUrls('javascript:alert(1)', 'data:text/html,unsafe')).toEqual({
      gatewayUrl: undefined,
      chatUrl: undefined,
    });
  });
});
