import type { ReactNode, SVGProps } from 'react';
import type { IconName } from './scope';

export interface SidebarProps {
  user?: {
    name?: string;
    email?: string;
    avatar?: string;
  } | null;
  collapsed: boolean;
  onToggle: () => void;
  navigation: { gatewayUrl?: string; governanceAdminUrl?: string; chatUrl?: string };
}

export interface NavItem {
  labelKey: string;
  path: string;
  icon: IconName;
  capability?: string | string[];
}

export interface HeaderProps {
  titleKey: string;
  onSearchClick?: () => void;
  children?: ReactNode;
}

export interface CommandMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export interface CommandItemProps {
  icon?: IconName;
  label: string;
  keywords?: string[];
  onSelect: () => void;
}

export interface SettingsDialogProps {
  open: boolean;
  onClose: () => void;
}

export interface GovernanceIconProps extends SVGProps<SVGSVGElement> {
  name:
    | 'overview'
    | 'usage'
    | 'shield'
    | 'term-list'
    | 'users'
    | 'audit'
    | 'chat'
    | 'home'
    | 'slide-in'
    | 'slide-out'
    | 'account-settings'
    | 'sign-out';
}
