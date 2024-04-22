import { Skeleton } from '@/components/ui/skeleton'
import { SkeletonCard } from '.'

export function SkeletonLoading({
  type,
}: {
  type: 'form' | 'full' | 'one-line' | 'avatar' | 'chart'
}) {
  switch (type) {
    case 'full':
      return (
        <div className="my-10 flex flex-col gap-y-10">
          <div className="flex gap-10">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
          <div className="flex gap-x-10">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
          <div className="flex gap-x-10">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
          <div className="flex gap-x-10">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </div>
      )
    case 'chart':
      return (
        <div className="ml-6 flex flex-col gap-y-10">
          <div className="flex gap-10">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </div>
      )
    case 'avatar':
      return (
        <div className="flex items-center space-x-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      )
    case 'one-line':
      return <Skeleton className="h-4 w-[250px]" />
    default:
      return (
        <div className="flex flex-col space-y-3">
          <Skeleton className="h-[125px] w-[250px] rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
      )
  }
}
