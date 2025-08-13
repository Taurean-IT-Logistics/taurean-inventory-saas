'use client';

import { useEffect } from 'react';
import { useAppContext } from '../providers/AppProvider';
import useToggleStyle from '../hooks/useToggleStyle';
import EcommerceLayout from '../layouts/EcommerceLayout';
import Homepage from '../pages/customer/Homepage';

export default function Page() {
  const { isStylesheetLoaded } = useToggleStyle();
  const {
    config: { theme }
  } = useAppContext();

  // Automatically scrolls to top whenever pathname changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!isStylesheetLoaded) {
    return (
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          backgroundColor: theme === 'dark' ? '#000' : '#fff'
        }}
      />
    );
  }

  return (
    <EcommerceLayout>
      <Homepage />
    </EcommerceLayout>
  );
}