export interface Dish {
  id: string;
  name: string;
  description: string;
  price: string;
  image?: string;
  category: 'wings' | 'sides' | 'drinks' | 'specials';
  featured?: boolean;
  spicy?: boolean;
}

export const featuredDishes: Dish[] = [
  {
    id: '1',
    name: 'Buffalo Wings',
    description: 'Crispy chicken wings tossed in our signature buffalo sauce',
    price: '$12.99',
    category: 'wings',
    featured: true,
    spicy: true,
  },
  {
    id: '2',
    name: 'Honey BBQ Wings',
    description: 'Sweet and smoky wings with a honey BBQ glaze',
    price: '$13.99',
    category: 'wings',
    featured: true,
  },
  {
    id: '3',
    name: 'Garlic Parmesan Wings',
    description: 'Wings tossed in garlic butter with fresh parmesan',
    price: '$14.99',
    category: 'wings',
    featured: true,
  },
  {
    id: '4',
    name: 'Loaded Nachos',
    description: 'Crispy tortilla chips topped with cheese, jalapeños, and sour cream',
    price: '$9.99',
    category: 'sides',
    featured: true,
  },
  {
    id: '5',
    name: 'Mozzarella Sticks',
    description: 'Golden fried mozzarella with marinara sauce',
    price: '$8.99',
    category: 'sides',
    featured: true,
  },
  {
    id: '6',
    name: 'Wingy Special Burger',
    description: 'Juicy beef patty with special sauce, lettuce, and tomato',
    price: '$11.99',
    category: 'specials',
    featured: true,
  },
];

export const allDishes: Dish[] = [
  ...featuredDishes,
  {
    id: '7',
    name: 'Spicy Korean Wings',
    description: 'Wings glazed with spicy Korean gochujang sauce',
    price: '$15.99',
    category: 'wings',
    spicy: true,
  },
  {
    id: '8',
    name: 'Lemon Pepper Wings',
    description: 'Zesty lemon pepper seasoning on crispy wings',
    price: '$13.99',
    category: 'wings',
  },
  {
    id: '9',
    name: 'French Fries',
    description: 'Crispy golden fries with sea salt',
    price: '$4.99',
    category: 'sides',
  },
  {
    id: '10',
    name: 'Onion Rings',
    description: 'Beer-battered onion rings with ranch dipping sauce',
    price: '$6.99',
    category: 'sides',
  },
];
