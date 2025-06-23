import { Config, initialConfig } from 'config';
import { setItemToStore } from 'helpers/utils';

//Action types
export const SET_CONFIG = 'SET_CONFIG';
export const REFRESH = 'REFRESH';
export const RESET = 'RESET';

//Action ts type
export type ACTIONTYPE =
  | { type: typeof SET_CONFIG; payload: Partial<Config> }
  | { type: typeof REFRESH }
  | { type: typeof RESET };

export const configReducer = (state: Config, action: ACTIONTYPE) => {
  switch (action.type) {
    case SET_CONFIG: {
      const { payload } = action;
      Object.keys(payload).forEach(key => {
        if (
          [
            'theme',
            'navbarTopShape',
            'navbarPosition',
            'navbarTopAppearance',
            'navbarVerticalAppearance',
            'isRTL',
            'isDark',
            'isNavbarVerticalCollapsed',
            'isChatWidgetVisible'
          ].includes(key)
        ) {
          setItemToStore(key, String(payload[key as keyof Config]));
        }
      });
      return {
        ...state,
        ...payload
      };
    }
    case REFRESH:
      return {
        ...state
      };
    case RESET:
      localStorage.clear();
      return {
        ...initialConfig
      };
    default:
      return state;
  }
};
