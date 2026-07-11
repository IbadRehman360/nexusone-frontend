import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { Loader2 } from "lucide-react"
import { cn } from "@/src/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-70 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        // ── Primary ────────────────────────────────────────────────────────────
        default:
          "bg-info/20 border border-info/40 text-info-400 shadow-xs hover:bg-info/28 hover:border-info/55",
        destructive:
          "bg-destructive text-primary shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        // ── Neutral ────────────────────────────────────────────────────────────
        outline:
          "border border-border/40 bg-background text-foreground shadow-xs hover:bg-muted/30 hover:border-border/60",
        ghost:
          "text-foreground/70 hover:text-foreground hover:bg-muted/20",
        // ── Danger ─────────────────────────────────────────────────────────────
        danger:
          "bg-destructive text-primary shadow-xs hover:bg-destructive/80 focus-visible:ring-destructive/20",
        "danger-outline":
          "border border-destructive/20 bg-destructive/10 text-destructive hover:bg-destructive/20 disabled:opacity-50",
        "danger-ghost":
          "text-destructive hover:bg-destructive/10",
        // ── Misc ───────────────────────────────────────────────────────────────
        secondary:
          "bg-background text-muted-foreground shadow-xs hover:bg-background/80",
        link:
          "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm:      "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5 text-xs",
        lg:      "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon:    "size-9 rounded-md",
        "icon-sm": "size-7 rounded-lg p-1.5",
      },
    },
    defaultVariants: {
      variant: "default",
      size:    "default",
    },
  },
)

interface ButtonProps
  extends React.ComponentProps<"button">,
    VariantProps<typeof buttonVariants> {
  asChild?:   boolean
  loading?:   boolean
  leftIcon?:  React.ReactNode
  rightIcon?: React.ReactNode
}

function Button({
  className,
  variant,
  size,
  asChild = false,
  loading,
  leftIcon,
  rightIcon,
  children,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <Loader2 className="animate-spin size-4" />
      ) : leftIcon || rightIcon ? (
        <>
          {leftIcon}
          {children}
          {rightIcon}
        </>
      ) : (
        children
      )}
    </Comp>
  )
}

export { Button, buttonVariants }
export type { ButtonProps }
