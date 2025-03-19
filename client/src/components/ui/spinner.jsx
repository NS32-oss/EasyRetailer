import { cn } from "@/lib/utils"

export function Spinner({ size = "md", className }) {
  return (
    <div
      className={cn(
        "inline-block animate-spin rounded-full border-2 border-solid border-current border-r-transparent",
        {
          "h-4 w-4": size === "sm",
          "h-8 w-8": size === "md",
          "h-12 w-12": size === "lg",
        },
        className,
      )}
      role="status"
    >
      <span className="sr-only">Loading...</span>
    </div>
  )
}