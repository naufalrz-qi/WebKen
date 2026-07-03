import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-md border border-transparent text-sm font-semibold whitespace-nowrap transition-all outline-none select-none focus-visible:ring-2 focus-visible:ring-interactive/35 active:translate-y-px disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-interactive text-white shadow-[0_10px_24px_-16px_hsl(var(--interactive))] hover:bg-interactive-hover",
        outline:
          "border-border bg-surface-1 hover:border-foreground/25 hover:bg-surface-2 hover:text-foreground",
        secondary:
          "bg-surface-2 text-foreground hover:bg-surface-3",
        ghost:
          "hover:bg-surface-2 hover:text-foreground",
        destructive:
          "bg-destructive/10 text-destructive hover:bg-destructive/20",
        link: "text-interactive underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 gap-2 px-4",
        xs: "h-6 gap-1 px-2 text-xs",
        sm: "h-8 gap-1.5 px-3 text-[13px]",
        lg: "h-11 gap-2 px-6 text-base",
        icon: "size-9",
        "icon-xs": "size-6",
        "icon-sm": "size-8",
        "icon-lg": "size-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
