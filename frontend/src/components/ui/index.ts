import React from 'react';

// Re-export all UI components
export { Button } from './Button';

// Layout Components
export const Container = ({ children, fluid = false, className = '' }: { 
  children: React.ReactNode; 
  fluid?: boolean; 
  className?: string;
}) => (
  <div className={`${fluid ? 'w-full' : 'container mx-auto px-4 max-w-7xl'} ${className}`}>
    {children}
  </div>
);

export const Row = ({ children, className = '' }: { 
  children: React.ReactNode; 
  className?: string;
}) => (
  <div className={`flex flex-wrap -mx-3 ${className}`}>
    {children}
  </div>
);

export const Col = ({ 
  children, 
  xs, 
  sm, 
  md, 
  lg, 
  xl, 
  className = '' 
}: { 
  children: React.ReactNode;
  xs?: number;
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
  className?: string;
}) => {
  const getColClasses = () => {
    const classes = ['px-3'];
    
    if (xs) classes.push(`w-${xs}/12`);
    if (sm) classes.push(`sm:w-${sm}/12`);
    if (md) classes.push(`md:w-${md}/12`);
    if (lg) classes.push(`lg:w-${lg}/12`);
    if (xl) classes.push(`xl:w-${xl}/12`);
    
    return classes.join(' ');
  };

  return (
    <div className={`${getColClasses()} ${className}`}>
      {children}
    </div>
  );
};

// Card Components
export const Card = ({ 
  children, 
  className = '',
  border,
  ...props 
}: { 
  children: React.ReactNode; 
  className?: string;
  border?: string;
  [key: string]: any;
}) => (
  <div className={`card ${className}`} {...props}>
    {children}
  </div>
);

Card.Body = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`card-body ${className}`}>
    {children}
  </div>
);

Card.Header = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`card-header ${className}`}>
    {children}
  </div>
);

Card.Img = ({ src, alt, className = '', ...props }: { 
  src: string; 
  alt: string; 
  className?: string; 
  [key: string]: any;
}) => (
  <img src={src} alt={alt} className={`w-full ${className}`} {...props} />
);

// Form Components
export const Form = ({ children, onSubmit, className = '' }: { 
  children: React.ReactNode; 
  onSubmit?: (e: React.FormEvent) => void;
  className?: string;
}) => (
  <form onSubmit={onSubmit} className={className}>
    {children}
  </form>
);

Form.Group = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`mb-4 ${className}`}>
    {children}
  </div>
);

Form.Label = ({ children, htmlFor, className = '' }: { 
  children: React.ReactNode; 
  htmlFor?: string;
  className?: string;
}) => (
  <label htmlFor={htmlFor} className={`block text-sm font-medium mb-2 ${className}`}>
    {children}
  </label>
);

Form.Control = React.forwardRef<HTMLInputElement | HTMLTextAreaElement, {
  as?: 'input' | 'textarea' | 'select';
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<any>) => void;
  className?: string;
  [key: string]: any;
}>(({ as = 'input', className = '', ...props }, ref) => {
  const Component = as as any;
  return (
    <Component 
      ref={ref}
      className={`form-control ${className}`} 
      {...props}
    />
  );
});

Form.Control.displayName = 'FormControl';

// Alert Component
export const Alert = ({ 
  children, 
  variant = 'primary', 
  className = '',
  show = true,
  onClose 
}: { 
  children: React.ReactNode; 
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';
  className?: string;
  show?: boolean;
  onClose?: () => void;
}) => {
  if (!show) return null;

  const variantClasses = {
    primary: 'bg-primary-100 border-primary-200 text-primary-800',
    secondary: 'bg-gray-100 border-gray-200 text-gray-800',
    success: 'bg-success-100 border-success-200 text-success-800',
    danger: 'bg-danger-100 border-danger-200 text-danger-800',
    warning: 'bg-warning-100 border-warning-200 text-warning-800',
    info: 'bg-info-100 border-info-200 text-info-800',
  };

  return (
    <div className={`border rounded-md p-4 ${variantClasses[variant]} ${className}`}>
      {onClose && (
        <button onClick={onClose} className="float-right text-lg font-bold">
          ×
        </button>
      )}
      {children}
    </div>
  );
};

// Input Group Component
export const InputGroup = ({ children, className = '' }: { 
  children: React.ReactNode; 
  className?: string;
}) => (
  <div className={`flex ${className}`}>
    {children}
  </div>
);

InputGroup.Text = ({ children, className = '' }: { 
  children: React.ReactNode; 
  className?: string;
}) => (
  <span className={`inline-flex items-center px-3 border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm ${className}`}>
    {children}
  </span>
);

// Stack Component
export const Stack = ({ 
  children, 
  direction = 'vertical', 
  gap = 3, 
  className = '' 
}: { 
  children: React.ReactNode; 
  direction?: 'horizontal' | 'vertical';
  gap?: number;
  className?: string;
}) => (
  <div className={`flex ${direction === 'horizontal' ? 'flex-row' : 'flex-col'} gap-${gap} ${className}`}>
    {children}
  </div>
);