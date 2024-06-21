import { cn } from '@/utils/misc'

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-secondary-500', className)}
      {...props}
    />
  )
}

export { Skeleton }
