import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-orange-400 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-orange-500 text-white shadow-sm hover:bg-orange-600",
        secondary:
          "bg-white text-neutral-700 border border-neutral-200 shadow-sm hover:bg-neutral-50",
        outline:
          "border border-orange-300 text-orange-600 bg-transparent hover:bg-orange-50",
        ghost: "bg-transparent text-neutral-600 hover:bg-neutral-100",
        link: "text-orange-600 underline-offset-4 hover:underline p-0 h-auto",
      },
      size: {
        default: "h-12 px-6 py-3 has-[>svg]:px-5",
        sm: "h-9 px-4 text-sm",
        lg: "h-14 px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
