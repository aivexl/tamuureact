import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-md bg-slate-50 border border-slate-100/50", className)}
      {...props}
    />
  )
}

export { Skeleton }
