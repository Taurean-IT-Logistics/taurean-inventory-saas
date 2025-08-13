# Phoenix App Migration: Vite + Bootstrap → Next.js + Tailwind CSS

This document outlines the migration from Vite with Bootstrap to Next.js with Tailwind CSS.

## Major Changes

### 1. Build System
- **Before**: Vite with React
- **After**: Next.js 14 with App Router

### 2. Styling System
- **Before**: Bootstrap 5.3.5 + SCSS
- **After**: Tailwind CSS 3.3.5 with Phoenix color system

### 3. Icons
- **Before**: FontAwesome icons
- **After**: Lucide React icons

### 4. Routing
- **Before**: React Router DOM
- **After**: Next.js App Router

## Phoenix Color System in Tailwind

The custom Phoenix color palette has been preserved in Tailwind:

```css
/* Primary colors (Blue) */
primary-50 to primary-1000

/* Secondary colors (Gray) */
secondary-50 to secondary-1100

/* Status colors */
success-50 to success-1000 (Green)
danger-50 to danger-1000 (Red)  
warning-50 to warning-1000 (Orange)
info-50 to info-1000 (Cyan)

/* Body/Background colors */
body-50 to body-1100
```

## Component Conversion Guide

### Bootstrap → Tailwind Equivalents

| Bootstrap | Tailwind Equivalent |
|-----------|-------------------|
| `Container` | `container mx-auto px-4 max-w-7xl` |
| `Row` | `grid grid-cols-12` or `flex` |
| `Col md={6}` | `col-span-6` or `w-1/2` |
| `Card` | `card` (custom class) |
| `Button variant="primary"` | `btn btn-primary` |
| `text-muted` | `text-gray-600 dark:text-gray-400` |
| `fw-semibold` | `font-semibold` |
| `mb-3` | `mb-3` |
| `d-flex` | `flex` |
| `align-items-center` | `items-center` |

### Icon Migration

| FontAwesome | Lucide React |
|-------------|--------------|
| `faCheck` | `Check` |
| `faStar` | `Star` |
| `faMapMarkerAlt` | `MapPin` |
| `faUsers` | `Users` |
| `faClock` | `Clock` |
| `faWifi` | `Wifi` |
| `faParking` | `Car` |
| `faUtensils` | `Utensils` |
| `faDesktop` | `Monitor` |
| `faSnowflake` | `Snowflake` |
| `faCalendarAlt` | `Calendar` |

## Theme System

The app now uses `next-themes` with the existing Phoenix theme system:

```tsx
// Access theme in components
const { theme, setTheme } = useTheme()

// Toggle dark mode
setTheme(theme === 'dark' ? 'light' : 'dark')
```

## Development Commands

```bash
# Development
npm run dev

# Build
npm run build

# Start production server
npm run start

# Lint
npm run lint
```

## File Structure Changes

```
src/
├── app/                    # Next.js App Router pages
│   ├── globals.css        # Tailwind CSS imports + Phoenix variables
│   ├── layout.tsx         # Root layout with providers
│   ├── page.tsx          # Homepage
│   ├── sign-in/
│   ├── sign-up/
│   └── facilities/
├── components/            # React components (unchanged)
├── providers/
│   └── ThemeProvider.tsx  # Next.js theme integration
├── pages/                 # Legacy page components (to be migrated)
├── hooks/                 # Custom hooks (unchanged)
├── lib/                   # Utilities
└── types/                 # TypeScript types (unchanged)
```

## Remaining Tasks

1. **Component Migration**: Continue converting Bootstrap components to Tailwind
2. **Route Migration**: Move remaining pages to Next.js App Router structure
3. **Layout Updates**: Ensure all layouts work with new theming system
4. **Testing**: Test all functionality with new build system

## Notes

- Dark mode is now handled by Tailwind's `dark:` modifier classes
- All Phoenix colors are preserved and accessible in Tailwind
- The existing Redux store and business logic remain unchanged
- Custom components like badges, buttons, cards have Tailwind equivalents in `globals.css`