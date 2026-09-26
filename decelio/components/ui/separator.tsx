"use client"

import { Separator as SeparatorPrimitive } from "@base-ui/react/separator"
import { cn } from "cn"

/** Filet de séparation, 1 px, couleur `line`. `strong` pour la règle sous un en-tête de tableau. */
function Separator({
  className,
  orientation = "horizontal",
  strong = false,
  ...props
}: SeparatorPrimitive.Props & { strong?: boolean }) {
  return (
    <SeparatorPrimitive
      data-slot="separator"
      orientation={orientation}
      className={cn(
        "shrink-0 data-horizontal:h-px data-horizontal:w-full data-vertical:w-px data-vertical:self-stretch",
        strong ? "bg-ink" : "bg-line",
        className
      )}
      {...props}
    />
  )
}

export { Separator }
