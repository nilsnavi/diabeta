// Mock Telegram WebApp SDK
window.WebApp = {
  ready: () => {},
  expand: () => {},
  initData: 'test_init_data',
  colorScheme: 'light',
  themeParams: {},
};

declare global {
  interface Window {
    WebApp: {
      ready: () => void;
      expand: () => void;
      initData: string;
      colorScheme: 'light' | 'dark';
      themeParams: Record<string, any>;
    };
  }
}

export {};
