export interface ContactInfo {
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
  social: {
    platform: string;
    url: string;
    handle?: string;
  }[];
}

export const contactInfo: ContactInfo = {
  address: {
    street: '123 Wing Street',
    city: 'Flavor Town',
    state: 'FT',
    zip: '12345',
  },
  phone: '(555) 123-WING',
  email: 'hello@wingyrestaurant.com',
  hours: {
    monday: {
      open: '11:00 AM',
      close: '10:00 PM',
    },
    tuesday: {
      open: '11:00 AM',
      close: '10:00 PM',
    },
    wednesday: {
      open: '11:00 AM',
      close: '10:00 PM',
    },
    thursday: {
      open: '11:00 AM',
      close: '10:00 PM',
    },
    friday: {
      open: '11:00 AM',
      close: '11:00 PM',
    },
    saturday: {
      open: '11:00 AM',
      close: '11:00 PM',
    },
    sunday: {
      open: '12:00 PM',
      close: '9:00 PM',
    },
  },
  social: [
    {
      platform: 'Facebook',
      url: 'https://facebook.com/wingyrestaurant',
      handle: '@wingyrestaurant',
    },
    {
      platform: 'Instagram',
      url: 'https://instagram.com/wingyrestaurant',
      handle: '@wingyrestaurant',
    },
    {
      platform: 'Twitter',
      url: 'https://twitter.com/wingyrestaurant',
      handle: '@wingywings',
    },
  ],
};

export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  return phone;
};

export const getCurrentDayHours = (): { open: string; close: string; closed?: boolean } | null => {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const today = days[new Date().getDay()];
  return contactInfo.hours[today] || null;
};
