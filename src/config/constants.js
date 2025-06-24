// App constants
export const APP_NAME = 'NM-DigitalHUB';
export const APP_VERSION = '1.0.0';
export const COMPANY_NAME = 'NM Digital Hub';

// Colors (Hebrew/RTL friendly color scheme)
export const COLORS = {
  // Primary colors
  primary: '#007AFF',
  primaryDark: '#0056CC',
  primaryLight: '#4DA6FF',
  
  // Secondary colors
  secondary: '#5856D6',
  secondaryDark: '#3A39A0',
  secondaryLight: '#8B8AE6',
  
  // Status colors
  success: '#34C759',
  warning: '#FF9500',
  error: '#FF3B30',
  info: '#007AFF',
  
  // Neutral colors
  background: '#F8F9FA',
  surface: '#FFFFFF',
  text: '#1C1C1E',
  textSecondary: '#6C757D',
  border: '#E5E5EA',
  placeholder: '#999999',
  
  // Ticket priority colors
  urgent: '#FF3B30',
  high: '#FF9500',
  normal: '#007AFF',
  low: '#34C759',
  
  // Ticket status colors
  open: '#FF9500',
  in_progress: '#007AFF',
  resolved: '#34C759',
  closed: '#6C757D',
  
  // Order status colors
  pending: '#FF9500',
  paid: '#34C759',
  provisioned: '#007AFF',
  cancelled: '#FF3B30',
  failed: '#FF3B30',
};

// Typography
export const FONTS = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
  light: 'System',
};

export const FONT_SIZES = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

// Spacing
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Screen dimensions helpers
export const SCREEN_BREAKPOINTS = {
  small: 375,
  medium: 768,
  large: 1024,
};

// Animation durations
export const ANIMATION_DURATION = {
  fast: 200,
  normal: 300,
  slow: 500,
};

// API constants
export const API_ENDPOINTS = {
  AUTH: '/auth',
  MOBILE: '/mobile',
  WHATSAPP: '/whatsapp',
};

// Storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
  APP_SETTINGS: 'app_settings',
  CACHE_VERSION: 'cache_version',
  LAST_SYNC: 'last_sync',
};

// Hebrew/RTL support
export const RTL_SUPPORT = {
  isRTL: true,
  defaultLanguage: 'he',
  supportedLanguages: ['he', 'en'],
};

// Ticket priorities
export const TICKET_PRIORITIES = [
  { value: 'low', label: 'נמוכה', color: COLORS.low },
  { value: 'normal', label: 'רגילה', color: COLORS.normal },
  { value: 'high', label: 'גבוהה', color: COLORS.high },
  { value: 'urgent', label: 'דחופה', color: COLORS.urgent },
];

// Ticket statuses
export const TICKET_STATUSES = [
  { value: 'open', label: 'פתוח', color: COLORS.open },
  { value: 'in_progress', label: 'בטיפול', color: COLORS.in_progress },
  { value: 'resolved', label: 'נפתר', color: COLORS.resolved },
  { value: 'closed', label: 'סגור', color: COLORS.closed },
];

// Order statuses
export const ORDER_STATUSES = [
  { value: 'pending', label: 'ממתין', color: COLORS.pending },
  { value: 'paid', label: 'שולם', color: COLORS.paid },
  { value: 'provisioned', label: 'הופעל', color: COLORS.provisioned },
  { value: 'cancelled', label: 'בוטל', color: COLORS.cancelled },
  { value: 'failed', label: 'נכשל', color: COLORS.failed },
];

// User roles
export const USER_ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  STAFF: 'staff',
  CLIENT: 'client',
  RESELLER: 'reseller',
  VIEWER: 'viewer',
};

// Role labels in Hebrew
export const ROLE_LABELS = {
  [USER_ROLES.SUPER_ADMIN]: 'מנהל על',
  [USER_ROLES.ADMIN]: 'מנהל מערכת',
  [USER_ROLES.STAFF]: 'צוות תמיכה',
  [USER_ROLES.CLIENT]: 'לקוח',
  [USER_ROLES.RESELLER]: 'מוכר משנה',
  [USER_ROLES.VIEWER]: 'צפייה בלבד',
};

// Navigation routes
export const ROUTES = {
  // Auth stack
  LOGIN: 'Login',
  
  // Main tabs
  DASHBOARD: 'Dashboard',
  TICKETS: 'Tickets',
  CLIENTS: 'Clients',
  ORDERS: 'Orders',
  PROFILE: 'Profile',
  
  // Ticket stack
  TICKET_LIST: 'TicketList',
  TICKET_DETAIL: 'TicketDetail',
  TICKET_REPLY: 'TicketReply',
  
  // Client stack
  CLIENT_LIST: 'ClientList',
  CLIENT_DETAIL: 'ClientDetail',
  
  // Order stack
  ORDER_LIST: 'OrderList',
  ORDER_DETAIL: 'OrderDetail',
  
  // Profile stack
  PROFILE_SETTINGS: 'ProfileSettings',
  PROFILE_SESSIONS: 'ProfileSessions',
  PROFILE_ABOUT: 'ProfileAbout',
};

// Tab icons
export const TAB_ICONS = {
  [ROUTES.DASHBOARD]: 'home',
  [ROUTES.TICKETS]: 'ticket',
  [ROUTES.CLIENTS]: 'users',
  [ROUTES.ORDERS]: 'shopping-bag',
  [ROUTES.PROFILE]: 'user',
};

// Default pagination
export const PAGINATION = {
  PER_PAGE: 20,
  INITIAL_PAGE: 1,
};

// Cache settings
export const CACHE_SETTINGS = {
  TTL: 5 * 60 * 1000, // 5 minutes
  MAX_ENTRIES: 100,
};

// Push notification settings
export const NOTIFICATION_SETTINGS = {
  CHANNEL_ID: 'support-notifications',
  CHANNEL_NAME: 'Support Notifications',
  CHANNEL_DESCRIPTION: 'Notifications for support staff',
};

// Error messages in Hebrew
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'שגיאת רשת. אנא בדוק את החיבור לאינטרנט',
  UNAUTHORIZED: 'אין הרשאה. אנא התחבר מחדש',
  SERVER_ERROR: 'שגיאת שרת. אנא נסה שוב מאוחר יותר',
  VALIDATION_ERROR: 'שגיאת אימות. אנא בדוק את הנתונים שהוזנו',
  TOKEN_EXPIRED: 'תוקף ההתחברות פג. אנא התחבר מחדש',
  INSUFFICIENT_PERMISSIONS: 'אין הרשאות מספיקות לביצוע הפעולה',
};