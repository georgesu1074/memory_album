export default function LoadingSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden animate-pulse">
      {/* Image skeleton */}
      <div className="aspect-square bg-gray-200" />
      
      {/* Content skeleton */}
      <div className="p-3">
        {/* Text lines */}
        <div className="space-y-2 mb-3">
          <div className="h-3 bg-gray-200 rounded w-full" />
          <div className="h-3 bg-gray-200 rounded w-4/5" />
          <div className="h-3 bg-gray-200 rounded w-3/5" />
        </div>
        
        {/* Footer */}
        <div className="flex justify-between">
          <div className="h-3 bg-gray-200 rounded w-20" />
          <div className="h-3 bg-gray-200 rounded w-16" />
        </div>
      </div>
    </div>
  )
}