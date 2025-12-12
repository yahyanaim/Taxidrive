import React from 'react';
import CTAButton from '@/components/common/CTAButton';
import SectionHeading from '@/components/common/SectionHeading';
import DishCard from '@/components/common/DishCard';
import { featuredDishes } from '@/data/dishes';

export default function HomePage() {
  const handleOrder = (dish: any) => {
    console.log('Ordering:', dish.name);
    // Here you would typically integrate with an ordering system
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-warm py-20 md:py-32">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-chocolate mb-6 animate-fade-in">
            Welcome to <span className="text-gold">Wingy</span>
          </h1>
          <p className="text-lg md:text-xl text-chocolate-light mb-8 max-w-2xl mx-auto leading-relaxed animate-slide-up">
            Experience the most delicious wings in Flavor Town with over 20 unique flavors, 
            from classic buffalo to exotic fusion. Your taste adventure starts here!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up">
            <CTAButton href="/menu" size="lg">
              View Our Menu
            </CTAButton>
            <CTAButton href="/contact" variant="outline" size="lg">
              Order Now
            </CTAButton>
          </div>
        </div>
      </section>

      {/* Featured Dishes Section */}
      <section className="py-16 md:py-24 bg-cream/30">
        <div className="container mx-auto px-4">
          <SectionHeading 
            as="h2"
            className="text-3xl md:text-4xl lg:text-5xl"
          >
            Our Most Popular Wings
          </SectionHeading>
          <SectionHeading 
            as="h3"
            subtitle="Discover why our customers keep coming back for more"
            alignment="center"
          >
            Featured Dishes
          </SectionHeading>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredDishes.slice(0, 6).map((dish) => (
              <DishCard
                key={dish.id}
                dish={dish}
                onOrder={handleOrder}
                className="animate-slide-up"
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-chocolate text-sand">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready for the Best Wings Ever?
          </h2>
          <p className="text-lg md:text-xl mb-8 text-sand/80 max-w-2xl mx-auto">
            Join thousands of satisfied customers who have discovered their perfect flavor combination.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <CTAButton href="/menu" variant="secondary" size="lg">
              Browse Full Menu
            </CTAButton>
            <CTAButton href="/contact" variant="outline" size="lg" className="border-sand text-sand hover:bg-sand hover:text-chocolate">
              Contact Us
            </CTAButton>
          </div>
        </div>
      </section>
    </div>
  );
}
