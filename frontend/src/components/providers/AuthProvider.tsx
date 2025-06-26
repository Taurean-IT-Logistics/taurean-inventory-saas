import { Provider } from 'react-redux';
import { StateManagement } from 'lib';
import React from 'react';

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  return <Provider store={StateManagement.store}>{children}</Provider>;
};

export default AuthProvider;
