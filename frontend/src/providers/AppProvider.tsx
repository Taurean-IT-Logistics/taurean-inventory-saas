import React, {
  createContext,
  Dispatch,
  PropsWithChildren,
  useContext,
  useEffect,
  useReducer
} from 'react';
import { getColor, getItemFromStore } from 'helpers/utils';
import { Config, initialConfig } from 'config';
import { ACTIONTYPE, configReducer, SET_CONFIG } from 'reducers/ConfigReducer';

interface AppContextInterFace {
  config: Config;
  configDispatch: Dispatch<ACTIONTYPE>;
  toggleTheme: () => void;
  setConfig: (payload: Partial<Config>) => void;
  getThemeColor: (name: string) => string;
}

export const AppContext = createContext({} as AppContextInterFace);

const AppProvider = ({ children }: PropsWithChildren) => {
  const configState: Config = {
    isNavbarVerticalCollapsed: getItemFromStore(
      'isNavbarVerticalCollapsed',
      initialConfig.isNavbarVerticalCollapsed
    ),
    openNavbarVertical: initialConfig.openNavbarVertical,
    theme: getItemFromStore('theme', initialConfig.theme),
    navbarTopAppearance: getItemFromStore(
      'navbarTopAppearance',
      initialConfig.navbarTopAppearance
    ),
    navbarVerticalAppearance: getItemFromStore(
      'navbarVerticalAppearance',
      initialConfig.navbarVerticalAppearance
    ),
    navbarPosition: getItemFromStore(
      'navbarPosition',
      initialConfig.navbarPosition
    ),
    navbarTopShape: getItemFromStore(
      'navbarTopShape',
      initialConfig.navbarTopShape
    ),
    isRTL: getItemFromStore('isRTL', initialConfig.isRTL),
    isDark: getItemFromStore('isDark', initialConfig.isDark),
    isChatWidgetVisible: getItemFromStore(
      'isChatWidgetVisible',
      initialConfig.isChatWidgetVisible
    )
  };

  const [config, configDispatch] = useReducer(configReducer, configState);

  const setConfig = (payload: Partial<Config>) => {
    configDispatch({
      type: SET_CONFIG,
      payload
    });
  };

  const toggleTheme = () => {
    configDispatch({
      type: SET_CONFIG,
      payload: {
        theme: config.isDark ? 'light' : 'dark'
      }
    });
  };

  const getThemeColor = (name: string) => {
    return getColor(name);
  };

  // Handle DOM attribute updates
  useEffect(() => {
    if (config.navbarTopShape === 'slim') {
      document.documentElement.setAttribute(
        'data-navbar-horizontal-shape',
        'slim'
      );
    } else {
      document.documentElement.removeAttribute('data-navbar-horizontal-shape');
    }

    document.documentElement.setAttribute(
      'data-navigation-type',
      config.navbarPosition
    );

    if (config.isNavbarVerticalCollapsed) {
      document.documentElement.classList.add('navbar-vertical-collapsed');
    } else {
      document.documentElement.classList.remove('navbar-vertical-collapsed');
    }
  }, [
    config.navbarTopShape,
    config.navbarPosition,
    config.isNavbarVerticalCollapsed
  ]);

  // Separate useEffect to fix navbarTopShape if needed
  useEffect(() => {
    if (
      config.navbarPosition === 'dual' &&
      config.navbarTopShape !== 'default'
    ) {
      setConfig({ navbarTopShape: 'default' });
    }
  }, [config.navbarPosition, config.navbarTopShape]);

  return (
    <AppContext.Provider
      value={{ config, setConfig, toggleTheme, getThemeColor, configDispatch }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);

export default AppProvider;
