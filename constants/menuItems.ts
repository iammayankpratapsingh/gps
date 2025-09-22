export interface MenuItem {
  id: number;
  title: string;
  icon: string;
  color: string;
  action?: () => void;
}

export const createMenuItems = (
  onOpenThemeManagement: () => void,
  onDeleteAccount: () => void,
  onOpenDefaultMapType: () => void,
  onOpenManageNotification: () => void,
  onOpenPrivacyPolicy: () => void,
  onOpenShare: () => void,
  onOpenRateUs: () => void,
  onOpenPreviousRoutes: () => void,
  onOpenNotifications: () => void
): MenuItem[] => [
  { id: 1, title: 'Default Map Type', icon: 'map', color: '#0097b2', action: onOpenDefaultMapType },
  { id: 2, title: 'Manage Notification', icon: 'settings', color: '#0097b2', action: onOpenManageNotification },
  { id: 3, title: 'Privacy Policy', icon: 'security', color: '#0097b2', action: onOpenPrivacyPolicy },
  { id: 4, title: 'Share', icon: 'share', color: '#0097b2', action: onOpenShare },
  { id: 5, title: 'Rate Us', icon: 'star', color: '#0097b2', action: onOpenRateUs },
  { id: 6, title: 'Manage Theme', icon: 'palette', color: '#0097b2', action: onOpenThemeManagement },
  { id: 7, title: 'Previous Routes', icon: 'route', color: '#0097b2', action: onOpenPreviousRoutes },
  { id: 8, title: 'Notifications', icon: 'notifications', color: '#0097b2', action: onOpenNotifications },
  { id: 9, title: 'Delete Account', icon: 'delete', color: '#dc3545', action: onDeleteAccount },
];
