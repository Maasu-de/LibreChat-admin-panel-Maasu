import { createFileRoute } from '@tanstack/react-router';
import { DashboardPage } from '@/components/dashboard';

export const Route = createFileRoute('/_app/')({
  head: () => ({ meta: [{ title: 'AIMO · Groups & Membership · Overview' }] }),
  component: DashboardRoute,
});

function DashboardRoute() {
  return <DashboardPage />;
}
