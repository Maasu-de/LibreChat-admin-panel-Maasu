import { describe, it, expect } from 'vitest';
import { groupsRedirectRequired } from './governance';

describe('governed navigation', () => {
  it.each(['/', '/users', '/grants', '/configuration', '/help', '/missing'])('redirects hidden route %s', (path) => {
    expect(groupsRedirectRequired(true, path, '')).toBe(true);
  });
  it.each(['', '?tab=roles', '?tab=unknown'])('redirects hidden or missing tab %s', (search) => {
    expect(groupsRedirectRequired(true, '/access', search)).toBe(true);
  });
  it('opens Groups directly and retains ordinary navigation outside governed mode', () => {
    expect(groupsRedirectRequired(true, '/access', '?tab=groups')).toBe(false);
    expect(groupsRedirectRequired(false, '/grants', '')).toBe(false);
  });
});
