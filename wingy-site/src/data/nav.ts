export interface NavLink {
  name: string;
  href: string;
  description?: string;
}

export const navLinks: NavLink[] = [
  {
    name: 'Home',
    href: '/',
    description: 'Welcome to Wingy',
  },
  {
    name: 'Menu',
    href: '/menu',
    description: 'Delicious wings and more',
  },
  {
    name: 'About',
    href: '/about',
    description: 'Our story and values',
  },
  {
    name: 'Contact',
    href: '/contact',
    description: 'Get in touch with us',
  },
];

export const desktopNavLinks = navLinks.filter(link => link.name !== 'Home');
