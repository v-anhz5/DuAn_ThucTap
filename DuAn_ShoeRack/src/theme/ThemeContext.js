import React from 'react';

export const ThemeContext = React.createContext({
  themeColors: {
    primary: '#3ec6a7',
    background: '#fff',
    text: '#222',
    textSecondary: '#888',
    border: '#e0e0e0',
    gray: '#f2f2f2',
    grayLight: '#f6f6f6',
    danger: '#e53935',
    shadow: '#000',
  },
  toggleTheme: () => {},
  theme: 'light',
}); 