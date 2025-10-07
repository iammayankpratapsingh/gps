export interface MenuItem {
  id: number;
  titleKey: string;
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
  onOpenPreviousRoutes: () => void
): MenuItem[] => [
  { id: 1, titleKey: 'defaultMapType', icon: 'map', color: '#0097b2', action: onOpenDefaultMapType },
  { id: 2, titleKey: 'manageNotification', icon: 'settings', color: '#0097b2', action: onOpenManageNotification },
  { id: 3, titleKey: 'privacyPolicy', icon: 'security', color: '#0097b2', action: onOpenPrivacyPolicy },
  { id: 4, titleKey: 'share', icon: 'share', color: '#0097b2', action: onOpenShare },
  { id: 5, titleKey: 'rateUs', icon: 'star', color: '#0097b2', action: onOpenRateUs },
  { id: 6, titleKey: 'manageTheme', icon: 'palette', color: '#0097b2', action: onOpenThemeManagement },
  { id: 7, titleKey: 'previousRoutes', icon: 'route', color: '#0097b2', action: onOpenPreviousRoutes },
  { id: 8, titleKey: 'deleteAccount', icon: 'delete', color: '#dc3545', action: onDeleteAccount },
];
