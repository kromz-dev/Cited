import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"
import { cn } from "cn"

/**
 * Champ de saisie. Hauteur 36 px dans l'application, 44 px (`size="lg"`)
 * dans les formulaires marketing et d'inscription. Toujours associé à un
 * `<label htmlFor>` visible ; l'erreur se signale par `aria-invalid` et un
 * message texte sous le champ, jamais par la couleur seule.
 */
function Input({
  className,
  type,
  fieldSize = "default",
  ...props
}: React.ComponentProps<"input"> & { fieldSize?: "default" | "lg" }) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      data-size={fieldSize}
      className={cn(
        "h-9 w-full min-w-0 rounded-sm border border-line-strong bg-surface px-3 text-sm text-ink outline-none transition-[border-color,box-shadow,background-color] duration-(--duration-1) ease-(--ease-brand)",
        "placeholder:text-ink-3 selection:bg-cobalt-soft",
        "file:mr-3 file:inline-flex file:h-7 file:rounded-xs file:border-0 file:bg-surface-2 file:px-2 file:type-table file:font-medium file:text-ink",
        "hover:border-ink-2 focus-visible:border-cobalt focus-visible:ring-3 focus-visible:ring-cobalt/25 focus-visible:outline-none",
        "disabled:cursor-not-allowed disabled:border-line disabled:bg-surface-2 disabled:text-ink-2",
        "aria-invalid:border-stop aria-invalid:ring-3 aria-invalid:ring-stop/20",
        "data-[size=lg]:h-11 data-[size=lg]:px-3.5 data-[size=lg]:text-base",
        className
      )}
      {...props}
    />
  )
}

export { Input }
