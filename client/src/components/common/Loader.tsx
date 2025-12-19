
interface LoaderProps {
  fullScreen?: boolean;
  message?: string;
}

export default function Loader({ fullScreen = false, message }: LoaderProps) {
  const loaderContent = (
    <div className="flex flex-col items-center justify-center gap-4">
      {/* Animated Spinner */}
      <div className="relative w-16 h-16">
        {/* Outer ring */}
        <div className="absolute inset-0 border-4 border-blue-200 dark:border-blue-900 rounded-full"></div>
        {/* Spinning ring */}
        <div className="absolute inset-0 border-4 border-transparent border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin"></div>
        {/* Inner pulsing dot */}
        <div className="absolute inset-0 m-auto w-3 h-3 bg-blue-600 dark:bg-blue-400 rounded-full animate-pulse"></div>
      </div>

      {/* Loading text */}
      {message && (
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 animate-pulse">
          {message}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white dark:bg-gray-950 z-[100] flex items-center justify-center">
        {loaderContent}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-12">
      {loaderContent}
    </div>
  );
}

// Skeleton loader for cards/tables
export function SkeletonLoader({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-4 animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="h-16 bg-gray-200 dark:bg-gray-800 rounded-xl"
        ></div>
      ))}
    </div>
  );
}

// Page loader with branding
export function PageLoader({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center">
      <div className="text-center">
        {/* Logo or Brand Name */}
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-8">
          EasyRetailer
        </h1>

        {/* Animated Loader */}
        <div className="relative w-20 h-20 mx-auto mb-6">
          <div className="absolute inset-0 border-4 border-blue-200 dark:border-blue-900 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-transparent border-t-blue-600 dark:border-t-blue-400 border-r-purple-600 dark:border-r-purple-400 rounded-full animate-spin"></div>
          <div className="absolute inset-0 m-auto w-4 h-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full animate-pulse"></div>
        </div>

        <p className="text-lg font-medium text-gray-700 dark:text-gray-300 animate-pulse">
          {message}
        </p>
      </div>
    </div>
  );
}
