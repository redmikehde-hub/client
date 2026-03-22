import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const Button = ({ 
  children, 
  loading = false, 
  disabled = false,
  variant = 'primary', 
  size = 'md',
  className = '',
  icon: Icon,
  iconPosition = 'left',
  ...props 
}) => {
  const isDisabled = disabled || loading;
  
  const baseClasses = 'relative font-semibold cursor-pointer flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-gradient-to-r from-primary to-neon-purple text-white shadow-lg shadow-primary/30 hover:shadow-primary/50',
    secondary: 'bg-white/10 text-white border border-white/10 hover:bg-white/20 hover:border-primary/30',
    success: 'bg-gradient-to-r from-success to-emerald-500 text-white shadow-lg shadow-success/30',
    danger: 'bg-gradient-to-r from-danger to-red-600 text-white shadow-lg shadow-danger/30',
    ghost: 'bg-transparent text-text-secondary hover:bg-white/5 hover:text-white',
    outline: 'bg-transparent text-primary border border-primary hover:bg-primary/10',
  };
  
  const sizes = {
    sm: 'py-2 px-4 text-xs rounded-lg',
    md: 'py-3 px-6 text-sm rounded-xl',
    lg: 'py-4 px-8 text-base rounded-2xl',
  };
  
  return (
    <motion.button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={isDisabled}
      whileHover={!isDisabled ? { scale: 1.02 } : {}}
      whileTap={!isDisabled ? { scale: 0.98 } : {}}
      {...props}
    >
      {loading && (
        <Loader2 
          size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} 
          className="animate-spin" 
        />
      )}
      {!loading && Icon && iconPosition === 'left' && <Icon size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} />}
      <span className={loading ? 'opacity-80' : ''}>{children}</span>
      {!loading && Icon && iconPosition === 'right' && <Icon size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} />}
      
      {loading && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
      )}
    </motion.button>
  );
};

export default Button;

export const LoadingSpinner = ({ size = 'md' }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };
  
  return (
    <div className="flex items-center justify-center">
      <Loader2 className={`${sizes[size]} animate-spin text-primary`} />
    </div>
  );
};

export const ButtonSpinner = ({ text = 'Loading...', size = 'md' }) => {
  const sizes = {
    sm: 'py-2 px-4 text-xs',
    md: 'py-3 px-6 text-sm',
    lg: 'py-4 px-8 text-base',
  };
  
  return (
    <div className={`${sizes[size]} bg-gradient-to-r from-primary to-neon-purple text-white rounded-xl flex items-center justify-center gap-2`}>
      <Loader2 className="w-4 h-4 animate-spin" />
      <span>{text}</span>
    </div>
  );
};
