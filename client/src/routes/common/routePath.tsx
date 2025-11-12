export const isAuthRoute = (pathname: string): boolean => {
    return Object.values(AUTH_ROUTES).includes(pathname);
  };
  
  export const AUTH_ROUTES = {
    SIGN_IN: "/",
    SIGN_UP: "/sign-up",
  };
  
  export const PROTECTED_ROUTES = {
    OVERVIEW: "/overview",
    TRANSACTIONS: "/transaction",
    REPORTS: "/reports",
    SETTINGS: "/settings",
    SETTINGS_APPEARANCE: "/settings/appearance",
    SETTINGS_ABOUT: "/settings/about",
    SETTINGS_BILLING: "/settings/billing",
  };
