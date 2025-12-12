import React from 'react';

interface SectionHeadingProps {
  children: React.ReactNode;
  subtitle?: string;
  alignment?: 'left' | 'center' | 'right';
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

const SectionHeading: React.FC<SectionHeadingProps> = ({
  children,
  subtitle,
  alignment = 'center',
  className = '',
  as: Component = 'h2',
}) => {
  const alignmentClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  const baseClasses = 'font-bold text-chocolate mb-4';
  const subtitleClasses = 'text-chocolate-light text-base md:text-lg font-normal mt-2 max-w-2xl mx-auto';

  return (
    <div className={`mb-12 ${alignmentClasses[alignment]}`}>
      <Component className={`${baseClasses} ${className}`}>
        {children}
      </Component>
      {subtitle && (
        <p className={subtitleClasses}>
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default SectionHeading;
