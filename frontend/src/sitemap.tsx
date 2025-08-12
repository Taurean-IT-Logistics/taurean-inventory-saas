import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faHourglassHalf } from '@fortawesome/free-regular-svg-icons';
import {
  Icon,
  UilChartPie,
  UilCube,
  UilDocumentLayoutRight,
  UilFilesLandscapesAlt,
  UilPuzzlePiece
} from '@iconscout/react-unicons';

export interface Route {
  name: string;
  icon?: IconProp | string | string[];
  iconSet?: 'font-awesome' | 'feather' | 'unicons';
  pages?: Route[];
  path?: string;
  pathName?: string;
  flat?: boolean;
  topNavIcon?: string;
  dropdownInside?: boolean;
  active?: boolean;
  new?: boolean;
  hasNew?: boolean;
  isNext?: boolean;
}

export interface RouteItems {
  label: string;
  horizontalNavLabel?: string;
  icon: Icon;
  labelDisabled?: boolean;
  pages: Route[];
  megaMenu?: boolean;
  active?: boolean;
}

export const routes: RouteItems[] = [
  {
    label: 'dashboard',
    horizontalNavLabel: 'home',
    active: true,
    icon: UilChartPie,
    labelDisabled: true,
    pages: [
      {
        name: 'home',
        icon: 'pie-chart',
        active: true,
        flat: true,
        pages: [
          {
            name: 'e-commerce',
            path: '/',
            pathName: 'default-dashboard',
            topNavIcon: 'shopping-cart',
            active: true
          },
          {
            name: 'project-management',
            path: '/dashboard/project-management',
            pathName: 'project-management-dashbaord',
            topNavIcon: 'clipboard',
            active: true
          },
          {
            name: 'CRM',
            path: '/dashboard/crm',
            pathName: 'crm',
            topNavIcon: 'phone',
            active: true
          },
          {
            name: 'Travel Agency',
            path: '/dashboard/travel-agency',
            pathName: 'travel-agency',
            topNavIcon: 'briefcase',
            active: true
          },
          {
            name: 'social-feed',
            path: '/apps/social/feed',
            pathName: 'social-feed',
            topNavIcon: 'share-2',
            active: true
          }
        ]
      }
    ]
  },
  {
    label: 'apps',
    icon: UilCube,
    pages: [
      {
        name: 'e-commerce',
        active: true,
        icon: 'shopping-cart',
        pages: [
          {
            name: 'admin',
            active: true,
            pages: [
              {
                name: 'add-product',
                path: '/apps/e-commerce/admin/add-product',
                pathName: 'e-commerce-add-product',
                active: true
              },
              {
                name: 'products',
                path: '/apps/e-commerce/admin/products',
                pathName: 'e-commerce-products',
                active: true
              },
              {
                name: 'customers',
                path: '/apps/e-commerce/admin/customers',
                pathName: 'e-commerce-customers',
                active: true
              },
              {
                name: 'customer-details',
                path: '/apps/e-commerce/admin/customer-details',
                pathName: 'e-commerce-customer-details',
                active: true
              },
              {
                name: 'orders',
                path: '/apps/e-commerce/admin/orders',
                pathName: 'e-commerce-orders',
                active: true
              },
              {
                name: 'order-details',
                path: '/apps/e-commerce/admin/order-details',
                pathName: 'e-commerce-order-details',
                active: true
              },
              {
                name: 'refund',
                path: '/apps/e-commerce/admin/refund',
                pathName: 'e-commerce-refund',
                active: true
              }
            ]
          },
          {
            name: 'customer',
            active: true,
            pages: [
              {
                name: 'homepage',
                path: 'apps/e-commerce/customer/homepage',
                pathName: 'e-commerce-fe-home',
                active: true
              },
              {
                name: 'product-details',
                path: 'apps/e-commerce/customer/product-details',
                pathName: 'e-commerce-fe-product-details',
                active: true
              },
              {
                name: 'products-filter',
                path: 'apps/e-commerce/customer/products-filter',
                pathName: 'e-commerce-fe-product-filter',
                active: true
              },
              {
                name: 'cart',
                path: 'apps/e-commerce/customer/cart',
                pathName: 'e-commerce-fe-cart',
                active: true
              },
              {
                name: 'checkout',
                path: 'apps/e-commerce/customer/checkout',
                pathName: 'e-commerce-fe-checkout',
                active: true
              },
              {
                name: 'shipping-info',
                path: 'apps/e-commerce/customer/shipping-info',
                pathName: 'e-commerce-fe-shipping-info',
                active: true
              },
              {
                name: 'profile',
                path: 'apps/e-commerce/customer/profile',
                pathName: 'e-commerce-fe-profile',
                active: true
              },
              {
                name: 'favorite-stores',
                path: 'apps/e-commerce/customer/favorite-stores',
                pathName: 'e-commerce-fe-favorite-stores',
                active: true
              },
              {
                name: 'wishlist',
                path: 'apps/e-commerce/customer/wishlist',
                pathName: 'e-commerce-fe-wishlist',
                active: true
              },
              {
                name: 'order-tracking',
                path: 'apps/e-commerce/customer/order-tracking',
                pathName: 'e-commerce-fe-order-tracking',
                active: true
              },
              {
                name: 'invoice',
                path: 'apps/e-commerce/customer/invoice',
                pathName: 'e-commerce-fe-invoice',
                active: true
              }
            ]
          }
        ]
      },
      {
        name: 'CRM',
        icon: 'phone',
        active: true,
        pages: [
          {
            name: 'analytics',
            path: '/apps/crm/analytics',
            pathName: 'crm-analytics',
            active: true
          },
          {
            name: 'deals',
            path: '/apps/crm/deals',
            pathName: 'crm-deals',
            active: true
          },
          {
            name: 'deal-details',
            path: '/apps/crm/deal-details',
            pathName: 'crm-deal-details',
            active: true
          },
          {
            name: 'leads',
            path: '/apps/crm/leads',
            pathName: 'crm-leads',
            active: true
          },
          {
            name: 'lead details',
            path: '/apps/crm/lead-details',
            pathName: 'crm-lead-details',
            active: true
          },
          {
            name: 'reports',
            path: '/apps/crm/reports',
            pathName: 'crm-reports',
            active: true
          },
          {
            name: 'report details',
            path: '/apps/crm/report-details',
            pathName: 'crm-report-details',
            active: true
          },
          {
            name: 'add-contact',
            path: '/apps/crm/add-contact',
            pathName: 'crm-add-contact',
            active: true
          }
        ]
      },
      {
        name: 'project-management',
        icon: 'clipboard',
        active: true,
        pages: [
          {
            name: 'create new',
            path: '/apps/project-management/create-new',
            pathName: 'project-management-create-new',
            active: true
          },
          {
            name: 'project-list-view',
            path: '/apps/project-management/project-list-view',
            pathName: 'project-management-project-list-view',
            active: true
          },
          {
            name: 'project-card-view',
            path: '/apps/project-management/project-card-view',
            pathName: 'project-management-project-card-view',
            active: true
          },
          {
            name: 'project-board-view',
            path: '/apps/project-management/project-board-view',
            pathName: 'project-management-project-board-view',
            active: true
          },
          {
            name: 'todo-list',
            path: '/apps/project-management/todo-list',
            pathName: 'project-management-todo-list',
            active: true
          },
          {
            name: 'project-details',
            path: '/apps/project-management/project-details',
            pathName: 'project-management-project-details',
            active: true
          }
        ]
      },
      {
        name: 'travel-agency',
        hasNew: true,
        icon: 'briefcase',
        active: true,
        pages: [
          {
            name: 'landing',
            path: '/apps/travel-agency/landing',
            pathName: 'travel-agency-landing',
            active: true
          },
          {
            name: 'hotel',
            active: true,
            pages: [
              {
                name: 'admin',
                active: true,
                pages: [
                  {
                    name: 'add-property',
                    path: '/apps/travel-agency/hotel/admin/add-property',
                    pathName: 'travel-agency-add-property',
                    active: true
                  },
                  {
                    name: 'add-room',
                    path: 'apps/travel-agency/hotel/admin/add-room',
                    pathName: 'travel-agency-add-room',
                    active: true
                  },
                  {
                    name: 'room-listing',
                    path: 'apps/travel-agency/hotel/admin/room-listing',
                    pathName: 'travel-agency-room-listing',
                    active: true
                  },
                  {
                    name: 'search-room',
                    path: 'apps/travel-agency/hotel/admin/search-room',
                    pathName: 'travel-agency-search-room',
                    active: true
                  }
                ]
              },
              {
                name: 'customer',
                active: true,
                pages: [
                  {
                    name: 'homepage',
                    path: '/apps/travel-agency/hotel/customer/homepage',
                    pathName: 'hotel-homepage',
                    active: true
                  },
                  {
                    name: 'hotel-details',
                    path: '/apps/travel-agency/hotel/customer/hotel-details',
                    pathName: 'hotel-details',
                    active: true
                  },
                  {
                    name: 'hotel-compare',
                    path: '/apps/travel-agency/hotel/customer/hotel-compare',
                    pathName: 'hotel-compare',
                    active: true
                  },
                  {
                    name: 'checkout',
                    path: '/apps/travel-agency/hotel/customer/checkout',
                    pathName: 'hotel-checkout',
                    active: true
                  },
                  {
                    name: 'payment',
                    path: '/apps/travel-agency/hotel/customer/payment',
                    pathName: 'hotel-payment',
                    active: true
                  },
                  {
                    name: 'gallery',
                    path: '/apps/travel-agency/hotel/customer/gallery',
                    pathName: 'hotel-gallery',
                    active: true
                  }
                ]
              }
            ]
          },
          {
            name: 'flight',
            active: true,
            pages: [
              {
                name: 'homepage',
                active: true,
                path: '/apps/travel-agency/flight/homepage',
                pathName: 'flight-homepage'
              },
              {
                name: 'booking',
                active: true,
                path: '/apps/travel-agency/flight/booking',
                pathName: 'flight-booking'
              },
              {
                name: 'payment',
                active: true,
                path: '/apps/travel-agency/flight/payment',
                pathName: 'flight-payment'
              }
            ]
          },
          {
            name: 'trip',
            active: true,
            new: true,
            pages: [
              {
                name: 'homepage',
                active: true,
                path: '/apps/travel-agency/trip/homepage',
                pathName: 'trip-homepage'
              },
              {
                name: 'trip-details',
                active: true,
                path: '/apps/travel-agency/trip/trip-details',
                pathName: 'trip-details'
              },
              {
                name: 'checkout',
                active: true,
                path: '/apps/travel-agency/trip/checkout',
                pathName: 'checkout'
              }
            ]
          }
        ]
      },
      {
        name: 'chat',
        icon: 'message-square',
        path: '/apps/chat',
        pathName: 'app-chat',
        active: true
      },
      {
        name: 'email',
        icon: 'mail',
        active: true,
        pages: [
          {
            name: 'inbox',
            path: '/apps/email/inbox',
            pathName: 'email-inbox',
            active: true
          },
          {
            name: 'email-detail',
            path: '/apps/email/email-detail',
            pathName: 'email-detail',
            active: true
          },
          {
            name: 'compose',
            path: '/apps/email/compose',
            pathName: 'email-compose',
            active: true
          }
        ]
      },
      {
        name: 'events',
        icon: 'bookmark',
        active: true,
        pages: [
          {
            name: 'create an event',
            path: '/apps/events/create-an-event',
            pathName: 'create-an-event',
            active: true
          },
          {
            name: 'Event detail',
            path: '/apps/events/event-detail',
            pathName: 'event-detail',
            active: true
          }
        ]
      },
      {
        name: 'kanban',
        icon: 'trello',
        active: true,
        pages: [
          {
            name: 'Kanban',
            path: '/apps/kanban/kanban',
            pathName: 'app-kanban',
            active: true
          },
          {
            name: 'boards',
            path: '/apps/kanban/boards',
            pathName: 'kanban-boards',
            active: true
          },
          {
            name: 'create board',
            path: '/apps/kanban/create-board',
            pathName: 'create-kanban-board',
            active: true
          }
        ]
      },
      {
        name: 'social',
        icon: 'share-2',
        active: true,
        pages: [
          {
            name: 'profile',
            path: '/apps/social/profile',
            pathName: 'social-profile',
            active: true
          },
          {
            name: 'settings',
            path: '/apps/social/settings',
            pathName: 'settings',
            active: true
          }
        ]
      },
      {
        name: 'File manager',
        icon: 'folder',
        active: true,
        new: true,
        pages: [
          {
            name: 'Grid view',
            path: 'apps/file-manager/grid-view',
            pathName: 'file-grid-view',
            active: true
          },
          {
            name: 'List view',
            path: 'apps/file-manager/list-view',
            pathName: 'file-list-view',
            active: true
          }
        ]
      },
      {
        name: 'calendar',
        icon: 'calendar',
        path: 'apps/calendar',
        pathName: 'app-calendar',
        active: true
      }
    ]
  },
  {
    label: 'pages',
    icon: UilFilesLandscapesAlt,
    pages: [
      {
        name: 'starter',
        icon: 'compass',
        path: '/pages/starter',
        pathName: 'starter-page',
        active: true
      },
      {
        name: 'faq',
        icon: 'help-circle',
        active: true,
        pages: [
          {
            name: 'faq-accordion',
            path: '/pages/faq/faq-accordion',
            pathName: 'faq-accordion',
            active: true
          },
          {
            name: 'faq-tab',
            path: '/pages/faq/faq-tab',
            pathName: 'faq-tab',
            active: true,
            new: true
          }
        ]
      },
      {
        name: 'landing',
        icon: 'globe',
        active: true,
        pages: [
          {
            name: 'default',
            path: '/pages/landing/default',
            pathName: 'landing-default',
            active: true
          },
          {
            name: 'alternate',
            path: '/pages/landing/alternate',
            pathName: 'landing-alternate',
            active: true,
            new: true
          }
        ]
      },
      {
        name: 'pricing',
        icon: 'tag',
        active: true,
        pages: [
          {
            name: 'pricing-column',
            path: '/pages/pricing/pricing-column',
            pathName: 'pricing-column',
            active: true
          },
          {
            name: 'pricing-grid',
            path: 'pages/pricing/pricing-grid',
            pathName: 'pricing-grid',
            active: true
          }
        ]
      },
      {
        name: 'notifications',
        icon: 'bell',
        path: '/pages/notifications',
        pathName: 'notifications-page',
        active: true
      },
      {
        name: 'members',
        icon: 'users',
        path: '/pages/members',
        pathName: 'members-page',
        active: true
      },
      {
        name: 'timeline',
        icon: 'clock',
        path: '/pages/timeline',
        pathName: 'timeline-page',
        active: true
      },
      {
        name: 'coming-soon',
        iconSet: 'font-awesome',
        icon: faHourglassHalf,
        path: '/pages/coming-soon',
        pathName: 'coming-soon',
        active: true
      },
      {
        name: 'errors',
        icon: 'alert-triangle',
        active: true,
        pages: [
          {
            name: '403',
            path: 'pages/errors/403',
            pathName: 'error403',
            active: true
          },
          {
            name: '404',
            path: 'pages/errors/404',
            pathName: 'error404',
            active: true
          },
          {
            name: '500',
            path: 'pages/errors/500',
            pathName: 'error500',
            active: true
          }
        ]
      },
      {
        name: 'authentication',
        icon: 'lock',
        active: true,
        pages: [
          {
            name: 'simple',
            active: true,
            pages: [
              {
                name: 'sign-in',
                path: '/pages/authentication/simple/sign-in',
                pathName: 'simple-signin',
                active: true
              },
              {
                name: 'sign-up',
                path: '/pages/authentication/simple/sign-up',
                pathName: 'simple-signup',
                active: true
              },
              {
                name: 'sign-out',
                path: '/pages/authentication/simple/sign-out',
                pathName: 'simple-signout',
                active: true
              },
              {
                name: 'forgot-password',
                path: '/pages/authentication/simple/forgot-password',
                pathName: 'simple-forgot-password',
                active: true
              },
              {
                name: 'reset-password',
                path: '/pages/authentication/simple/reset-password',
                pathName: 'simple-reset-password',
                active: true
              },
              {
                name: 'lock-screen',
                path: '/pages/authentication/simple/lock-screen',
                pathName: 'simple-lock-screen',
                active: true
              },
              {
                name: '2FA',
                path: '/pages/authentication/simple/2FA',
                pathName: 'simple-2FA',
                active: true
              }
            ]
          },
          {
            name: 'split',
            active: true,
            pages: [
              {
                name: 'sign-in',
                path: '/pages/authentication/split/sign-in',
                pathName: 'split-signin',
                active: true
              },
              {
                name: 'sign-up',
                path: '/pages/authentication/split/sign-up',
                pathName: 'split-signup',
                active: true
              },
              {
                name: 'sign-out',
                path: '/pages/authentication/split/sign-out',
                pathName: 'split-signout',
                active: true
              },
              {
                name: 'forgot-password',
                path: '/pages/authentication/split/forgot-password',
                pathName: 'split-forgot-password',
                active: true
              },
              {
                name: 'reset-password',
                path: '/pages/authentication/split/reset-password',
                pathName: 'split-reset-password',
                active: true
              },
              {
                name: 'lock-screen',
                path: '/pages/authentication/split/lock-screen',
                pathName: 'split-lock-screen',
                active: true
              },
              {
                name: '2FA',
                path: '/pages/authentication/split/2FA',
                pathName: 'split-2FA',
                active: true
              }
            ]
          },
          {
            name: 'Card',
            active: true,
            pages: [
              {
                name: 'sign-in',
                path: 'pages/authentication/card/sign-in',
                pathName: 'card-signin',
                active: true
              },
              {
                name: 'sign-up',
                path: 'pages/authentication/card/sign-up',
                pathName: 'card-signup',
                active: true
              },
              {
                name: 'sign-out',
                path: 'pages/authentication/card/sign-out',
                pathName: 'card-signout',
                active: true
              },
              {
                name: 'forgot-password',
                path: 'pages/authentication/card/forgot-password',
                pathName: 'card-forgot-password',
                active: true
              },
              {
                name: 'reset-password',
                path: 'pages/authentication/card/reset-password',
                pathName: 'card-reset-password',
                active: true
              },
              {
                name: 'lock-screen',
                path: 'pages/authentication/card/lock-screen',
                pathName: 'card-lock-screen',
                active: true
              },
              {
                name: '2FA',
                path: '/pages/authentication/card/2FA',
                pathName: 'card-2FA',
                active: true
              }
            ]
          }
        ]
      },
      {
        name: 'layouts',
        icon: 'layout',
        active: true,
        pages: [
          {
            name: 'vertical-sidenav',
            path: '/pages/demo/vertical-sidenav',
            pathName: 'demo-vertical-sidenav',
            active: true
          },
          {
            name: 'dark-mode',
            path: '/pages/demo/dark-mode',
            pathName: 'demo-dark-mode',
            active: true
          },
          {
            name: 'sidenav-collapse',
            path: '/pages/demo/sidenav-collapse',
            pathName: 'demo-sidenav-collapse',
            active: true
          },
          {
            name: 'darknav',
            path: '/pages/demo/darknav',
            pathName: 'demo-darknav',
            active: true
          },
          {
            name: 'topnav-slim',
            path: '/pages/demo/topnav-slim',
            pathName: 'demo-topnav-slim',
            active: true
          },
          {
            name: 'navbar-top-slim',
            path: '/pages/demo/navbar-top-slim',
            pathName: 'demo-navbar-top-slim',
            active: true
          },
          {
            name: 'navbar-top',
            path: '/pages/demo/navbar-top',
            pathName: 'demo-navbar-top',
            active: true
          },
          {
            name: 'horizontal-slim',
            path: '/pages/demo/horizontal-slim',
            pathName: 'demo-horizontal-slim',
            active: true
          },
          {
            name: 'combo-nav',
            path: '/pages/demo/combo-nav',
            pathName: 'demo-combo-nav',
            active: true
          },
          {
            name: 'combo-nav-slim',
            path: '/pages/demo/combo-nav-slim',
            pathName: 'demo-combo-nav-slim',
            active: true
          },
          {
            name: 'dual-nav',
            path: '/pages/demo/dual-nav',
            pathName: 'demo-dual-nav',
            active: true
          }
        ]
      }
    ]
  },
  {
    label: 'modules',
    active: true,
    icon: UilPuzzlePiece,
    megaMenu: true, // works for navbar top
    pages: [
      {
        name: 'forms',
        icon: 'file-text',
        active: true,
        pages: [
          {
            name: 'basic',
            active: true,
            pages: [
              {
                name: 'form-control',
                path: '/modules/forms/form-control',
                pathName: 'form-control',
                active: true
              },
              {
                name: 'input-group',
                path: '/modules/forms/input-group',
                pathName: 'form-input-group',
                active: true
              },
              {
                name: 'select',
                path: '/modules/forms/select',
                pathName: 'form-select',
                active: true
              },
              {
                name: 'checks',
                path: '/modules/forms/checks',
                pathName: 'form-checks',
                active: true
              },
              {
                name: 'range',
                path: '/modules/forms/range',
                pathName: 'form-range',
                active: true
              },
              {
                name: 'floating-labels',
                path: '/modules/forms/floating-labels',
                pathName: 'floating-labels',
                active: true
              },
              {
                name: 'layout',
                path: '/modules/forms/layout',
                pathName: 'form-layout',
                active: true
              }
            ]
          },
          {
            name: 'advance',
            active: true,
            pages: [
              {
                name: 'advance-select',
                path: '/modules/forms/advance-select',
                pathName: 'advance-select',
                active: true
              },
              {
                name: 'date-picker',
                path: '/modules/forms/date-picker',
                pathName: 'date-picker',
                active: true
              },
              {
                name: 'editor',
                path: '/modules/forms/editor',
                pathName: 'editor',
                active: true
              },
              {
                name: 'emoji-button',
                path: '/modules/forms/emoji-button',
                pathName: 'emoji-button',
                active: true
              },
              {
                name: 'file-uploader',
                path: '/modules/forms/file-uploader',
                pathName: 'file-uploader',
                active: true
              },
              {
                name: 'range',
                path: '/modules/forms/advance/range',
                pathName: 'range',
                active: true
              },
              {
                name: 'rating',
                path: '/modules/forms/rating',
                pathName: 'rating',
                active: true
              }
            ]
          },
          {
            name: 'validation',
            path: '/modules/forms/validation',
            pathName: 'forms-validation',
            active: true
          },
          {
            name: 'wizard',
            path: '/modules/forms/wizard',
            pathName: 'forms-wizard',
            active: true,
            new: true
          }
        ]
      },

      {
        name: 'icons',
        icon: 'grid',
        active: true,
        pages: [
          {
            name: 'feather',
            path: '/modules/icons/feather',
            pathName: 'icons-feather',
            active: true
          },
          {
            name: 'font awesome',
            path: '/modules/icons/font-awesome',
            pathName: 'icons-font-awesome',
            active: true
          },
          {
            name: 'unicons',
            path: '/modules/icons/unicons',
            pathName: 'icons-unicons',
            active: true
          }
        ]
      },
      {
        name: 'tables',
        icon: 'columns',
        active: true,
        pages: [
          {
            name: 'Basic tables',
            path: '/modules/tables/basic-tables',
            pathName: 'basic-tables',
            active: true
          },
          {
            name: 'Advance tables',
            path: '/modules/tables/advance-tables',
            pathName: 'advance-tables',
            active: true
          }
        ]
      },
      {
        name: 'charts',
        icon: 'bar-chart-2',
        active: true,
        pages: [
          {
            name: 'ECharts',
            path: '/modules/charts/e-charts',
            pathName: 'e-charts',
            active: true
          },
          {
            name: 'gantt-chart',
            path: '/modules/charts/gantt-chart',
            pathName: 'gantt-chart',
            active: true
          }
        ]
      },
      {
        name: 'components',
        icon: 'package',
        active: true,
        hasNew: true,
        pages: [
          {
            name: 'accordion',
            pathName: 'components-accordion',
            path: '/modules/components/accordion',
            active: true
          },
          {
            name: 'avatar',
            pathName: 'components-avatar',
            path: '/modules/components/avatar',
            active: true
          },
          {
            name: 'alerts',
            pathName: 'components-alerts',
            path: '/modules/components/alerts',
            active: true
          },
          {
            name: 'badge',
            pathName: 'components-badge',
            path: '/modules/components/badge',
            active: true
          },
          {
            name: 'breadcrumb',
            pathName: 'components-breadcrumb',
            path: '/modules/components/breadcrumb',
            active: true
          },
          {
            name: 'buttons',
            pathName: 'components-buttons',
            path: '/modules/components/button',
            active: true
          },
          {
            name: 'calendar',
            pathName: 'components-calendar',
            path: '/modules/components/calendar',
            active: true
          },
          {
            name: 'card',
            pathName: 'components-card',
            path: '/modules/components/card',
            active: true
          },
          {
            name: 'carousel',
            active: true,
            pages: [
              {
                name: 'bootstrap',
                path: '/modules/components/carousel/bootstrap',
                pathName: 'components-bs-carousel',
                active: true
              },
              {
                name: 'swiper',
                path: '/modules/components/carousel/swiper',
                pathName: 'swiper-carousel',
                active: true
              }
            ]
          },
          {
            name: 'collapse',
            pathName: 'components-bs-collapse',
            path: '/modules/components/collapse',
            active: true
          },
          {
            name: 'dropdown',
            pathName: 'components-bs-dropdown',
            path: '/modules/components/dropdown',
            active: true
          },
          {
            name: 'list-group',
            pathName: 'components-bs-list-group',
            path: '/modules/components/list-group',
            active: true
          },
          {
            name: 'countup',
            pathName: 'components-countup',
            path: '/modules/components/countup',
            active: true
          },
          {
            name: 'draggable',
            pathName: 'components-draggable',
            path: '/modules/components/draggable',
            active: true,
            new: true
          },
          {
            name: 'modals',
            pathName: 'components-modal',
            path: '/modules/components/modal',
            active: true
          },
          {
            name: 'navs-_and_-Tabs',
            active: true,
            pages: [
              {
                name: 'navs',
                pathName: 'components-navs',
                path: '/modules/components/navs-and-tabs/navs',
                active: true
              },
              {
                name: 'navbar',
                pathName: 'navbar',
                path: '/modules/components/navs-and-tabs/navbar',
                active: true
              },
              {
                name: 'tabs',
                pathName: 'components-tabs',
                path: '/modules/components/navs-and-tabs/tabs',
                active: true
              }
            ]
          },
          {
            name: 'pictures',
            active: true,
            pages: [
              {
                name: 'Lightbox',
                pathName: 'lightbox',
                path: '/modules/components/pictures/lightbox',
                active: true
              }
            ]
          },
          {
            name: 'offcanvas',
            pathName: 'components-offcanvas',
            path: '/modules/components/offcanvas',
            active: true
          },
          {
            name: 'progress-bar',
            pathName: 'basic-progress-bar',
            path: '/modules/components/progress-bar',
            active: true
          },
          {
            name: 'placeholder',
            pathName: 'components-placeholder',
            path: '/modules/components/placeholder',
            active: true
          },
          {
            name: 'pagination',
            path: '/modules/components/pagination',
            pathName: 'components-pagination',
            active: true
          },
          {
            name: 'popovers',
            path: '/modules/components/popovers',
            pathName: 'components-popovers',
            active: true
          },
          {
            name: 'spinners',
            path: '/modules/components/spinners',
            pathName: 'components-spinners',
            active: true
          },
          {
            name: 'toast',
            path: '/modules/components/toast',
            pathName: 'components-toast',
            active: true
          },
          {
            name: 'tooltips',
            path: '/modules/components/tooltips',
            pathName: 'components-bs-tooltips',
            active: true
          }
        ]
      },
      {
        name: 'utilities',
        icon: 'tool',
        active: true,
        pages: [
          {
            name: 'background',
            path: '/modules/utilities/background',
            pathName: 'utilities-background',
            active: true
          },
          {
            name: 'borders',
            path: '/modules/utilities/borders',
            pathName: 'utilities-borders',
            active: true
          },
          {
            name: 'colors',
            path: '/modules/utilities/colors',
            pathName: 'utilities-colors',
            active: true
          },
          {
            name: 'display',
            path: '/modules/utilities/display',
            pathName: 'utilities-display',
            active: true
          },
          {
            name: 'grid',
            path: '/modules/utilities/grid',
            pathName: 'utilities-grid',
            active: true
          },
          {
            name: 'flex',
            path: '/modules/utilities/flex',
            pathName: 'utilities-flex',
            active: true
          },
          {
            name: 'stack',
            path: '/modules/utilities/stack',
            pathName: 'utilities-stack',
            active: true
          },
          {
            name: 'float',
            path: '/modules/utilities/float',
            pathName: 'utilities-float',
            active: true
          },
          {
            name: 'interactions',
            path: '/modules/utilities/interactions',
            pathName: 'utilities-interactions',
            active: true
          },
          {
            name: 'opacity',
            path: '/modules/utilities/opacity',
            pathName: 'utilities-opacity',
            active: true
          },
          {
            name: 'overflow',
            path: '/modules/utilities/overflow',
            pathName: 'utilities-overflow',
            active: true
          },
          {
            name: 'position',
            path: '/modules/utilities/position',
            pathName: 'utilities-position',
            active: true
          },
          {
            name: 'shadows',
            path: '/modules/utilities/shadows',
            pathName: 'utilities-shadows',
            active: true
          },
          {
            name: 'sizing',
            path: '/modules/utilities/sizing',
            pathName: 'utilities-sizing',
            active: true
          },
          {
            name: 'spacing',
            path: '/modules/utilities/spacing',
            pathName: 'utilities-spacing',
            active: true
          },
          {
            name: 'Typography',
            path: '/modules/utilities/typography',
            pathName: 'utilities-typography',
            active: true
          },
          {
            name: 'vertical-align',
            path: '/modules/utilities/vertical-align',
            pathName: 'utilities-vertical-align',
            active: true
          },
          {
            name: 'visibility',
            path: '/modules/utilities/visibility',
            pathName: 'utilities-visibility',
            active: true
          }
        ]
      },
      {
        name: 'widgets',
        icon: 'server',
        path: '/widgets',
        active: true
      },
      {
        name: 'multi-level',
        icon: 'layers',
        active: true,
        pages: [
          {
            name: 'level-two',
            active: true,
            pages: [
              {
                name: 'item-1',
                path: '#!',
                active: true
              },
              {
                name: 'item-2',
                path: '#!',
                active: true
              }
            ]
          },
          {
            name: 'level-three',
            active: true,
            pages: [
              {
                name: 'item-3',
                path: '#!',
                active: true
              },
              {
                name: 'item-4',
                path: '#!',
                active: true,
                pages: [
                  {
                    name: 'item-5',
                    path: '#!',
                    active: true
                  },
                  {
                    name: 'item-6',
                    path: '#!',
                    active: true
                  }
                ]
              }
            ]
          },
          {
            name: 'level-four',
            active: true,
            pages: [
              {
                name: 'item-6',
                path: '#!',
                active: true
              },
              {
                name: 'item-7',
                active: true,
                pages: [
                  {
                    name: 'item-8',
                    path: '#!',
                    active: true
                  },
                  {
                    name: 'item-9',
                    active: true,
                    pages: [
                      {
                        name: 'item-10',
                        path: '#!',
                        active: true
                      },
                      {
                        name: 'item-11',
                        path: '#!',
                        active: true
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  {
    label: 'documentation',
    icon: UilDocumentLayoutRight,
    active: true,
    pages: [
      {
        name: 'getting-started',
        icon: 'life-buoy',
        path: '/documentation/getting-started',
        pathName: 'getting-started',
        active: true
      },
      {
        name: 'customization',
        icon: 'settings',
        dropdownInside: true,
        active: true,
        pages: [
          {
            name: 'configuration',
            path: '/documentation/customization/configuration',
            pathName: 'doc-configuration',
            active: true
          },
          {
            name: 'color',
            path: '/documentation/customization/color',
            pathName: 'doc-color',
            active: true,
            new: true
          },
          {
            name: 'styling',
            path: '/documentation/customization/styling',
            pathName: 'doc-styling',
            active: true
          },
          {
            name: 'dark-mode',
            path: '/documentation/customization/dark-mode',
            pathName: 'doc-styling',
            active: true
          }
          // {
          //   name: 'plugin',
          //   path: 'documentation/customization/plugin',
          //   pathName: 'doc-plugin'
          // }
        ]
      },
      {
        name: 'design-file',
        icon: 'figma',
        path: '/documentation/design-file',
        pathName: 'doc-design-file',
        active: true
      },
      {
        name: 'changelog',
        icon: 'git-merge',
        path: '/changelog',
        pathName: 'changelog',
        active: true
      },
      {
        name: 'migrations',
        icon: 'fast-forward',
        path: '/migrations',
        pathName: 'migrations',
        active: true
      },
      {
        name: 'showcase',
        icon: 'monitor',
        path: '/showcase',
        pathName: 'showcase',
        active: true
      }
    ]
  }
];
