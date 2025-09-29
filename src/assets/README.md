# Assets Directory

This directory contains all static assets used in the Proclean 1987 application.

## Structure

```text
src/assets/
├── icons/          # SVG icons and logos
│   └── logo.svg    # Main application logo
├── images/         # Raster images (PNG, JPG, etc.)
├── fonts/          # Custom fonts
└── index.ts        # Asset exports for easy importing
```

## Usage

### SVG Icons as React Components

Import SVGs as React components for better performance and customization:

```tsx
import { Logo } from '@/assets';

// Use in component
<Logo className="h-8 w-8 text-primary" />
```

### SVG as URL

If you need the SVG as a URL (for img tags, etc.):

```tsx
import logoUrl from '@/assets/icons/logo.svg';

// Use in component
<img src={logoUrl} alt="Proclean 1987 Logo" className="h-8 w-8" />
```

### Adding New Assets

1. **Icons**: Add SVG files to `icons/` folder
2. **Images**: Add raster images to `images/` folder  
3. **Export**: Update `index.ts` to export new assets
4. **Import**: Use the exported assets in your components

### Best Practices

- Use SVGs for icons and simple graphics (scalable, customizable)
- Optimize images before adding them to the project
- Use meaningful file names
- Export assets from `index.ts` for consistent imports
- Add `alt` attributes for accessibility

## Current Assets

- **logo.svg**: Main Proclean 1987 application logo
  - Usage: Header, branding, loading screens
  - Dimensions: 200x200 viewBox, scalable
  - Colors: Inherits current text color via CSS
