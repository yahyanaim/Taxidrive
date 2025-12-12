# Wingy Restaurant Website

A modern, responsive Next.js website for Wingy Restaurant featuring beautiful design, mobile-first approach, and comprehensive layout components.

## 🎨 Design System

### Color Palette
- **Sand**: `#F7F3E9` - Primary background color
- **Chocolate**: `#4A3B2A` - Primary text and dark elements
- **Chocolate Light**: `#6B4F3A` - Secondary text
- **Chocolate Dark**: `#3D2F20` - Darker accents
- **Gold**: `#D4A574` - Primary accent color
- **Gold Light**: `#E6C495` - Light accent
- **Gold Dark**: `#C49563` - Darker accent
- **Cream**: `#FEFCF7` - Card backgrounds
- **Brown Light**: `#8B6F47` - Supporting elements
- **Brown Dark**: `#5D4E37` - Darker supporting elements

### Typography
- **Primary Font**: Geist Sans (with fallback to system fonts)
- **Monospace Font**: Geist Mono
- Responsive typography scaling from mobile to desktop

### Spacing & Layout
- Mobile-first responsive design
- Container-based layout with custom breakpoints
- Custom spacing scales (18, 88, 128 units)
- Maximum width constraints for optimal readability

## 📁 Project Structure

```
wingy-site/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── fonts/             # Font files (GeistVF, GeistMonoVF)
│   │   ├── globals.css        # Global styles and Tailwind
│   │   ├── layout.tsx         # RootLayout component
│   │   └── page.tsx           # Home page
│   ├── components/
│   │   ├── common/            # Reusable utility components
│   │   │   ├── CTAButton.tsx  # Call-to-action button
│   │   │   ├── DishCard.tsx   # Menu item card
│   │   │   └── SectionHeading.tsx # Section headings
│   │   └── layout/            # Layout-specific components
│   │       ├── Footer.tsx     # Site footer
│   │       └── Navbar.tsx     # Navigation bar
│   └── data/                  # Centralized data modules
│       ├── contact.ts         # Contact information & hours
│       ├── dishes.ts          # Menu items and featured dishes
│       ├── nav.ts             # Navigation links
│       └── social.ts          # Social media links
├── package.json
├── tailwind.config.ts         # Tailwind configuration
├── tsconfig.json             # TypeScript configuration
├── next.config.mjs           # Next.js configuration
└── postcss.config.mjs        # PostCSS configuration
```

## 🧩 Components

### Layout Components

#### RootLayout (`src/app/layout.tsx`)
- **Purpose**: Main layout wrapper for all pages
- **Features**:
  - Font integration (Geist Sans & Mono)
  - SEO metadata configuration
  - Responsive body classes (`bg-sand text-chocolate`)
  - Includes Navbar and Footer on all pages
  - Proper semantic HTML structure

#### Navbar (`src/components/layout/Navbar.tsx`)
- **Purpose**: Primary site navigation
- **Features**:
  - Responsive design (desktop + mobile)
  - Mobile menu with hamburger toggle
  - Active link highlighting
  - Scroll-based background opacity
  - Logo with emoji branding
  - Smooth transitions and animations
  - Accessibility features (aria-labels, focus management)

#### Footer (`src/components/layout/Footer.tsx`)
- **Purpose**: Site footer with contact and company info
- **Features**:
  - Multi-column responsive layout
  - Contact information with icons
  - Business hours display
  - Social media links
  - Quick navigation links
  - Copyright and legal links
  - Consistent color scheme

### Common Components

#### CTAButton (`src/components/common/CTAButton.tsx`)
- **Purpose**: Reusable call-to-action button
- **Features**:
  - Multiple variants (primary, secondary, outline)
  - Size options (sm, md, lg)
  - Link or button functionality
  - Disabled state support
  - Hover animations
  - Consistent with design system

#### SectionHeading (`src/components/common/SectionHeading.tsx`)
- **Purpose**: Consistent section headers
- **Features**:
  - Multiple heading levels (h1-h6)
  - Optional subtitle support
  - Alignment options (left, center, right)
  - Responsive typography
  - Consistent spacing

#### DishCard (`src/components/common/DishCard.tsx`)
- **Purpose**: Menu item display card
- **Features**:
  - Dish information display
  - Price and category labels
  - Spicy indicator emoji
  - Order button integration
  - Hover effects
  - Responsive design
  - Image placeholder support

## 📊 Data Structure

### Navigation (`src/data/nav.ts`)
```typescript
interface NavLink {
  name: string;
  href: string;
  description?: string;
}
```

### Dishes (`src/data/dishes.ts`)
```typescript
interface Dish {
  id: string;
  name: string;
  description: string;
  price: string;
  image?: string;
  category: 'wings' | 'sides' | 'drinks' | 'specials';
  featured?: boolean;
  spicy?: boolean;
}
```

### Contact Info (`src/data/contact.ts`)
```typescript
interface ContactInfo {
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  phone: string;
  email: string;
  hours: {
    [key: string]: {
      open: string;
      close: string;
      closed?: boolean;
    };
  };
}
```

### Social Links (`src/data/social.ts`)
```typescript
interface SocialLink {
  platform: string;
  url: string;
  handle?: string;
  icon: string;
}
```

## 🎨 Tailwind Configuration

### Custom Colors
- All Wingy brand colors defined as Tailwind utilities
- CSS custom properties for theming support
- Opacity modifiers for design flexibility

### Custom Gradients
- `gradient-warm`: Sand to cream gradient
- `gradient-chocolate`: Chocolate color gradient
- `gradient-gold`: Gold accent gradient

### Animations
- `fade-in`: Smooth opacity transition
- `slide-up`: Upward slide with fade

### Container Configuration
- Responsive container with custom padding
- Centered alignment
- Mobile-first breakpoints

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- pnpm (recommended) or npm

### Installation
```bash
cd wingy-site
pnpm install
```

### Development
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

### Building for Production
```bash
pnpm build
pnpm start
```

### Type Checking
```bash
pnpm typecheck
```

### Linting
```bash
pnpm lint
```

## 📱 Responsive Design

### Breakpoints
- **Mobile**: Default (base styles)
- **Small**: 640px (sm:)
- **Medium**: 768px (md:)
- **Large**: 1024px (lg:)
- **Extra Large**: 1280px (xl:)
- **2XL**: 1536px (2xl:)

### Mobile-First Approach
- Base styles optimized for mobile
- Progressive enhancement for larger screens
- Touch-friendly interface elements
- Readable typography at all sizes

## 🎯 Key Features

### Accessibility
- Semantic HTML structure
- ARIA labels and descriptions
- Keyboard navigation support
- Focus management
- Color contrast compliance
- Screen reader friendly

### Performance
- Optimized font loading
- Efficient CSS with Tailwind
- Minimal JavaScript bundle
- Image optimization ready
- Lazy loading compatible

### SEO
- Comprehensive metadata
- Open Graph tags
- Twitter Card support
- Canonical URLs
- Structured data ready
- robots.txt support

## 🔧 Customization

### Adding New Pages
1. Create route in `src/app/`
2. Import and use layout components
3. Add navigation links in `src/data/nav.ts`

### Modifying Colors
1. Update `tailwind.config.ts` colors section
2. Adjust CSS custom properties in `globals.css`

### Adding New Components
1. Place in appropriate directory (`common/` or `layout/`)
2. Follow established patterns and naming conventions
3. Update relevant data modules if needed

## 📄 License

This project is part of the Wingy Restaurant website implementation.
