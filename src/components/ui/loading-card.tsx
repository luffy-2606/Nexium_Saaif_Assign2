import { cn } from "@/lib/utils"

interface LoadingCardProps {
  className?: string
  lines?: number
}

export function LoadingCard({ className, lines = 3 }: LoadingCardProps) {
  return (
    <div className={cn("glass rounded-2xl p-8 slide-up", className)}>
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-gradient-to-r from-gray-300 to-gray-400 rounded-lg shimmer"></div>
          <div className="h-4 bg-gradient-to-r from-gray-300 to-gray-400 rounded w-32 shimmer"></div>
        </div>
        
        <div className="space-y-3">
          {Array.from({ length: lines }).map((_, i) => (
            <div 
              key={i} 
              className={cn(
                "h-4 bg-gradient-to-r from-gray-300 to-gray-400 rounded shimmer",
                i === lines - 1 ? "w-3/4" : "w-full"
              )}
              style={{ animationDelay: `${i * 0.1}s` }}
            ></div>
          ))}
        </div>
      </div>
    </div>
  )
} 