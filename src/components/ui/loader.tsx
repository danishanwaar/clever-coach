interface LoaderProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Loader = ({ 
  message = "Loading...", 
  size = 'md',
  className = ""
}: LoaderProps) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  const isFullScreen = className.includes('min-h-screen') || !className;

  return (
    <div className={`flex items-center justify-center ${isFullScreen ? 'min-h-screen' : ''} ${className}`}>
      <div className="text-center">
        <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-primary mx-auto ${sizeClasses[size]}`}></div>
        <p className="mt-4 text-gray-600">{message}</p>
      </div>
    </div>
  );
};
