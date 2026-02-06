"use client";
import { Provider } from 'react-redux';
import { store } from './store';
import { ReduxPersist } from './ReduxPersist';

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <ReduxPersist />
      {children}
    </Provider>
  );
}
