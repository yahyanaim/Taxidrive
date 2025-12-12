import React from 'react';
import { Dish } from '@/data/dishes';
import CTAButton from './CTAButton';

interface DishCardProps {
  dish: Dish;
  onOrder?: (dish: Dish) => void;
  className?: string;
}

const DishCard: React.FC<DishCardProps> = ({
  dish,
  onOrder,
  className = '',
}) => {
  return (
    <div className={`bg-cream rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden ${className}`}>
      {dish.image && (
        <div className="h-48 bg-gradient-warm flex items-center justify-center">
          <span className="text-chocolate-light text-sm">Image placeholder</span>
        </div>
      )}
      
      <div className="p-6">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-semibold text-chocolate">{dish.name}</h3>
          <div className="flex items-center gap-2">
            {dish.spicy && (
              <span className="text-red-500 text-sm" title="Spicy">🌶️</span>
            )}
            <span className="text-gold font-bold">{dish.price}</span>
          </div>
        </div>
        
        <p className="text-chocolate-light text-sm mb-4 leading-relaxed">
          {dish.description}
        </p>
        
        <div className="flex justify-between items-center">
          <span className="inline-block bg-gold/20 text-chocolate px-2 py-1 rounded-full text-xs font-medium">
            {dish.category.charAt(0).toUpperCase() + dish.category.slice(1)}
          </span>
          
          <CTAButton
            size="sm"
            onClick={() => onOrder?.(dish)}
            className="ml-auto"
          >
            Order Now
          </CTAButton>
        </div>
      </div>
    </div>
  );
};

export default DishCard;
