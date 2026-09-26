import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

/**
 * Étiquette neutre : plan, rôle, compteur, canal d'alerte.
 * Pour un verdict (Lu / Refusé / Vide / Inconnu), utiliser `<Verdict>` :
 * il porte une forme et un mot, pas seulement une couleur.
 */
const badgeVariants = cva(
  "group/badge inline-flex h-6 w-fit shrink-0 items-center justify-center gap-1 rounded-xs border px-2 type-caption font-medium whitespace-nowrap [&>svg]:pointer-events-none [&>svg]:size-3",
  {
    variants: {
      variant: {
        default: "border-line bg-surface-2 text-ink-2",
        ink: "border-transparent bg-ink text-paper",
        outline: "border-line-strong bg-transparent text-ink",
        info: "border-transparent bg-cobalt-soft text-cobalt",
        ok: "border-transparent bg-ok-soft text-ok",
        stop: "border-transparent bg-stop-soft text-stop",
        warn: "border-transparent bg-warn-soft text-warn",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant }), className),
      },
      props
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  })
}

export { Badge, badgeVariants }
