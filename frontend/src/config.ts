export type ThemeVariant = 'light' | 'dark' | 'auto';
export type NavPositionVariant = 'horizontal' | 'vertical' | 'combo' | 'dual';
export type NavTopShapeVariant = 'default' | 'slim';
export type NavbarAppearanceVariant = 'default' | 'darker';
export interface Config {
  isNavbarVerticalCollapsed: boolean;
  openNavbarVertical: boolean;
  theme: ThemeVariant;
  navbarVerticalAppearance: NavbarAppearanceVariant;
  navbarTopAppearance: NavbarAppearanceVariant;
  navbarPosition: NavPositionVariant;
  navbarTopShape: NavTopShapeVariant;
  isRTL: boolean;
  isDark: boolean;
  bodyClass?: string;
  isChatWidgetVisible: boolean;
}

export const initialConfig: Config = {
  isNavbarVerticalCollapsed: false,
  openNavbarVertical: false, // for responsive
  theme: 'light',
  navbarTopAppearance: 'default',
  navbarVerticalAppearance: 'default',
  navbarPosition: 'vertical',
  navbarTopShape: 'default',
  isRTL: false,
  isDark: false,
  isChatWidgetVisible: true
};
