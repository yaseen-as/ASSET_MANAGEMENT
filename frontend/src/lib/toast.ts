import { toast } from 'sonner';

export const showToast = {
  success: (message: string, description?: string) => {
    toast.success(message, {
      description,
      duration: 4000,
    });
  },

  error: (message: string, description?: string) => {
    toast.error(message, {
      description,
      duration: 6000,
    });
  },

  warning: (message: string, description?: string) => {
    toast.warning(message, {
      description,
      duration: 5000,
    });
  },

  info: (message: string, description?: string) => {
    toast.info(message, {
      description,
      duration: 4000,
    });
  },

  loading: (message: string) => {
    return toast.loading(message);
  },

  dismiss: (toastId?: string | number) => {
    if (toastId) {
      toast.dismiss(toastId);
    } else {
      toast.dismiss();
    }
  },

  promise: <T>(
    promise: Promise<T>,
    {
      loading,
      success,
      error,
    }: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    }
  ) => {
    return toast.promise(promise, {
      loading,
      success,
      error,
    });
  },
};

// Validation toast messages
export const validationToasts = {
  requiredFields: () => showToast.error('Required fields missing', 'Please fill in all required fields'),
  fullNameRequired: () => showToast.error('Full name required', 'Please enter your full name'),
  passwordMismatch: () => showToast.error('Password mismatch', 'Passwords do not match'),
  passwordTooShort: () => showToast.error('Password too short', 'Password must be at least 6 characters long'),
  invalidEmail: () => showToast.error('Invalid email', 'Please enter a valid email address'),
  networkError: () => showToast.error('Network error', 'Please check your internet connection and try again'),
};

// Auth toast messages
export const authToasts = {
  loginSuccess: () => showToast.success('Welcome back!', 'You have successfully logged in'),
  signupSuccess: () => showToast.success('Account created!', 'Welcome to Asset Manager!'),
  logoutSuccess: () => showToast.success('Goodbye!', 'You have been logged out'),
  authError: (message: string) => showToast.error('Authentication failed', message),
};

// Portfolio toast messages
export const portfolioToasts = {
  holdingAdded: (symbol: string) => showToast.success('Holding added', `${symbol} has been added to your portfolio`),
  holdingUpdated: (symbol: string) => showToast.success('Holding updated', `${symbol} has been updated`),
  holdingDeleted: (symbol: string) => showToast.success('Holding removed', `${symbol} has been removed from your portfolio`),
  syncSuccess: () => showToast.success('Portfolio synced', 'Your portfolio has been synchronized'),
  syncError: () => showToast.error('Sync failed', 'Unable to synchronize your portfolio'),
};

// Market data toast messages
export const marketToasts = {
  priceUpdated: (symbol: string, price: number) => 
    showToast.info('Price update', `${symbol}: ₹${price.toFixed(2)}`),
  dataError: () => showToast.error('Market data unavailable', 'Unable to fetch market data'),
};

// Alert toast messages
export const alertToasts = {
  alertCreated: (symbol: string) => showToast.success('Alert created', `Price alert set for ${symbol}`),
  alertTriggered: (symbol: string, price: number) => 
    showToast.warning('Price alert triggered!', `${symbol} has reached ₹${price.toFixed(2)}`),
  alertDeleted: (symbol: string) => showToast.success('Alert removed', `Price alert for ${symbol} has been deleted`),
};