export interface SocialLink {
  platform: string;
  url: string;
  handle?: string;
  icon: string;
}

export const socialLinks: SocialLink[] = [
  {
    platform: 'Facebook',
    url: 'https://facebook.com/wingyrestaurant',
    handle: '@wingyrestaurant',
    icon: '📘',
  },
  {
    platform: 'Instagram',
    url: 'https://instagram.com/wingyrestaurant',
    handle: '@wingyrestaurant',
    icon: '📷',
  },
  {
    platform: 'Twitter',
    url: 'https://twitter.com/wingyrestaurant',
    handle: '@wingywings',
    icon: '🐦',
  },
  {
    platform: 'TikTok',
    url: 'https://tiktok.com/@wingyrestaurant',
    handle: '@wingyrestaurant',
    icon: '🎵',
  },
  {
    platform: 'Yelp',
    url: 'https://yelp.com/biz/wingy-restaurant',
    handle: 'Wingy Restaurant',
    icon: '⭐',
  },
];

export const getSocialIcon = (platform: string): string => {
  const social = socialLinks.find(link => link.platform.toLowerCase() === platform.toLowerCase());
  return social?.icon || '🔗';
};

export const getSocialHandle = (platform: string): string | undefined => {
  const social = socialLinks.find(link => link.platform.toLowerCase() === platform.toLowerCase());
  return social?.handle;
};
