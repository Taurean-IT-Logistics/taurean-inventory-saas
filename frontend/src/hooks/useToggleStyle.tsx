import { useAppContext } from 'providers/AppProvider';
import { useEffect, useState } from 'react';
import is from 'is_js';
import { REFRESH, SET_CONFIG } from 'reducers/ConfigReducer';
import { getSystemTheme } from 'helpers/utils';

const publicUrl = import.meta.env.VITE_PUBLIC_URL;

const useToggleStyle = () => {
  const [isStylesheetLoaded, setIsStylesheetLoaded] = useState(false);
  const {
    config: { theme, isRTL },
    configDispatch
  } = useAppContext();

  const HTMLClassList = document.documentElement.classList;

  useEffect(() => {
    if (is.windows()) HTMLClassList.add('windows');
    if (is.chrome()) HTMLClassList.add('chrome');
    if (is.firefox()) HTMLClassList.add('firefox');
    if (is.safari()) HTMLClassList.add('safari');
    if (is.mac()) HTMLClassList.add('osx');
  }, []);

  useEffect(() => {
    setIsStylesheetLoaded(false);

    const oldStyles = Array.from(
      document.querySelectorAll('link.theme-stylesheet')
    );

    // Create new theme link
    const themeLink = document.createElement('link');
    themeLink.rel = 'stylesheet';
    themeLink.href = `${publicUrl}css/theme${isRTL ? '.rtl' : ''}.css`;
    themeLink.className = 'theme-stylesheet';

    // Create new user link
    const userLink = document.createElement('link');
    userLink.rel = 'stylesheet';
    userLink.href = `${publicUrl}css/user${isRTL ? '.rtl' : ''}.css`;
    userLink.className = 'theme-stylesheet';

    // Append both to head but don’t remove old until both load
    let loadedCount = 0;
    const onLoad = () => {
      loadedCount += 1;
      if (loadedCount === 2) {
        oldStyles.forEach(link => link.remove());
        setIsStylesheetLoaded(true);
      }
    };

    themeLink.onload = onLoad;
    userLink.onload = onLoad;

    // Append new styles
    document.head.appendChild(themeLink);
    document.head.appendChild(userLink);

    document.documentElement.setAttribute('dir', isRTL ? 'rtl' : 'ltr');
  }, [isRTL]);

  useEffect(() => {
    const mode = theme === 'auto' ? getSystemTheme() : theme;

    configDispatch({
      type: SET_CONFIG,
      payload: { isDark: mode === 'dark' }
    });

    document.documentElement.setAttribute('data-bs-theme', mode);
    configDispatch({ type: REFRESH });
  }, [theme]);

  return { isStylesheetLoaded };
};

export default useToggleStyle;
