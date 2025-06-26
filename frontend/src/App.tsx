import useToggleStyle from 'hooks/useToggleStyle';
import { useAppContext } from 'providers/AppProvider';
import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

const App = () => {
  const { isStylesheetLoaded } = useToggleStyle();
  const { pathname } = useLocation();

  const {
    config: { theme }
  } = useAppContext();

  // Automatically scrolls to top whenever pathname changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <>
      {!isStylesheetLoaded ? (
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
      ) : (
        <>
          <Outlet />
        </>
      )}
    </>
  );
};

export default App;
