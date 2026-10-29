import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { AccessDenied, PermissionsUnavailable } from '@/components/shared';
import { AccessPage } from '@/components/access';
import { SystemCapabilities } from '@/constants';
import { useCapabilities, usePilotMode } from '@/hooks';

type Tab = 'groups' | 'roles';

interface AccessSearch {
  tab?: string;
}

function isValidTab(value?: string): value is Tab {
  return value === 'groups' || value === 'roles';
}

export const Route = createFileRoute('/_app/access')({
  head: ({ matches }) => ({
    meta: [
      {
        title: matches.some((match) => match.context.pilotEnabled)
          ? 'AIMO · Admin Panel · Groups & Membership'
          : 'AIMO · Chat Admin Panel · Access management',
      },
    ],
  }),
  validateSearch: (search: Record<string, unknown>): AccessSearch => ({
    tab: typeof search.tab === 'string' ? search.tab : undefined,
  }),
  component: AccessRoute,
});

function AccessRoute() {
  const { tab } = Route.useSearch();
  const pilotEnabled = usePilotMode();
  const { hasCapability, isLoading, isError } = useCapabilities();
  const navigate = useNavigate({ from: '/access' });

  if (isLoading) return null;
  if (isError) return <PermissionsUnavailable />;

  const canReadRoles = !pilotEnabled && hasCapability(SystemCapabilities.READ_ROLES);
  const canReadGroups = hasCapability(SystemCapabilities.READ_GROUPS);

  if (!canReadRoles && !canReadGroups) {
    return <AccessDenied />;
  }

  const defaultTab: Tab = canReadRoles ? 'roles' : 'groups';
  const requestedTab: Tab = isValidTab(tab) ? tab : defaultTab;
  const activeTab: Tab =
    (requestedTab === 'roles' && !canReadRoles) || (requestedTab === 'groups' && !canReadGroups)
      ? defaultTab
      : requestedTab;

  const handleTabChange = (value: string) => {
    if (isValidTab(value)) {
      navigate({ search: { tab: value } });
    }
  };

  return (
    <AccessPage
      activeTab={activeTab}
      onTabChange={handleTabChange}
      canReadRoles={canReadRoles}
      canReadGroups={canReadGroups}
    />
  );
}
