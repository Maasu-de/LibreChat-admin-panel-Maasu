import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_app/users')({
  head: () => ({ meta: [{ title: 'AIMO · Groups & Membership · User management' }] }),
  beforeLoad: () => {
    throw redirect({ to: '/' });
  },
  component: () => null,
});
