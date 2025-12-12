export type MenuSectionKey = 'tagines' | 'couscous' | 'pastries' | 'drinks';

export type Dish = {
  name: string;
  description: string;
  price: string;
  featured?: boolean;
};

export const menuSections: Array<{ key: MenuSectionKey; label: string; description: string }> = [
  {
    key: 'tagines',
    label: 'Tagines',
    description: 'Slow-braised stews with warm spices, preserved lemon, olives, and seasonal vegetables.',
  },
  {
    key: 'couscous',
    label: 'Couscous',
    description: 'Steamed couscous topped with tender meats, saffron broth, and market vegetables.',
  },
  {
    key: 'pastries',
    label: 'Pastries',
    description: 'Honeyed, nut-filled treats and flaky breads baked fresh daily.',
  },
  {
    key: 'drinks',
    label: 'Drinks',
    description: 'From mint tea to fruit juices, each sip is bright and refreshing.',
  },
];

export const menu: Record<MenuSectionKey, Dish[]> = {
  tagines: [
    {
      name: 'Chicken Tagine with Preserved Lemon',
      description: 'Saffron chicken, green olives, preserved lemon, and toasted almonds.',
      price: '$19',
      featured: true,
    },
    {
      name: 'Lamb Tagine with Prunes',
      description: 'Slow-cooked lamb shoulder with prunes, sesame, and cinnamon.',
      price: '$24',
      featured: true,
    },
    {
      name: 'Kefta Tagine',
      description: 'Spiced beef meatballs simmered in tomato sauce with a baked egg.',
      price: '$20',
      featured: true,
    },
    {
      name: 'Market Vegetable Tagine',
      description: 'Seasonal vegetables, chickpeas, and ras el hanout over saffron broth.',
      price: '$18',
    },
  ],
  couscous: [
    {
      name: 'Couscous Seven Vegetables',
      description: 'Classic couscous with zucchini, carrots, cabbage, turnip, and chickpeas.',
      price: '$17',
      featured: true,
    },
    {
      name: 'Chicken Couscous Tfaya',
      description: 'Caramelized onions, raisins, toasted almonds, and aromatic spices.',
      price: '$21',
    },
    {
      name: 'Lamb & Vegetable Couscous',
      description: 'Tender lamb with a light tomato broth and market vegetables.',
      price: '$23',
    },
  ],
  pastries: [
    {
      name: 'Almond Briouats',
      description: 'Crisp pastry triangles filled with almonds and orange blossom honey.',
      price: '$8',
      featured: true,
    },
    {
      name: 'Chebakia',
      description: 'Sesame cookies shaped by hand and glazed with honey.',
      price: '$7',
    },
    {
      name: 'Msemen',
      description: 'Flaky pan-fried bread served with honey and butter.',
      price: '$6',
    },
    {
      name: 'Date & Walnut Ghriba',
      description: 'Crumbly cookies with toasted walnuts and fragrant dates.',
      price: '$7',
    },
  ],
  drinks: [
    {
      name: 'Moroccan Mint Tea',
      description: 'Fresh spearmint and green tea served in a traditional pour.',
      price: '$5',
      featured: true,
    },
    {
      name: 'Orange Blossom Lemonade',
      description: 'House lemonade finished with orange blossom water.',
      price: '$6',
    },
    {
      name: 'Avocado Smoothie',
      description: 'Creamy avocado shake blended with dates and milk.',
      price: '$8',
    },
    {
      name: 'Spiced Moroccan Coffee',
      description: 'Strong espresso with a hint of cardamom.',
      price: '$4',
    },
  ],
};

export function getFeaturedDishes(limit = 6) {
  const all = menuSections.flatMap(({ key, label }) =>
    menu[key]
      .filter((dish) => dish.featured)
      .map((dish) => ({ ...dish, section: label })),
  );

  return all.slice(0, limit);
}
