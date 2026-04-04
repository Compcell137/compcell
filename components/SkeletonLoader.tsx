"use client";

export function SkeletonLoader({ count = 1, type = 'product' }: { count?: number; type?: 'product' | 'row' | 'card' }) {
  if (type === 'product') {
    return (
      <div className="space-y-4">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="bg-gray-800/50 rounded-lg p-4 animate-pulse">
            <div className="h-48 bg-gray-700 rounded-lg mb-3"></div>
            <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-700 rounded w-1/2 mb-3"></div>
            <div className="h-6 bg-gray-700 rounded w-1/3"></div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'row') {
    return (
      <div className="space-y-3">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 bg-gray-800/50 p-3 rounded-lg animate-pulse">
            <div className="h-12 w-12 bg-gray-700 rounded-lg flex-shrink-0"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-700 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-gray-800/50 rounded-lg p-4 animate-pulse">
          <div className="h-6 bg-gray-700 rounded w-2/3 mb-3"></div>
          <div className="h-4 bg-gray-700 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-700 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-700 rounded w-1/2"></div>
        </div>
      ))}
    </div>
  );
}
