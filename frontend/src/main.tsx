import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { router } from 'Routes';
import AppProvider from 'providers/AppProvider';
import BreakpointsProvider from 'providers/BreakpointsProvider';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProvider>
      <BreakpointsProvider>
        <RouterProvider router={router} />
      </BreakpointsProvider>
    </AppProvider>
  </StrictMode>
);
