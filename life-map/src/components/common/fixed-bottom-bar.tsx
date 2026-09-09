import { cn } from "@/lib/utils";

export function FixedBottomBar({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "sticky bottom-0 left-0 right-0 z-10 border-t border-neutral-200 bg-white/90 backdrop-blur safe-bottom",
        className
      )}
    >
      <div className="mx-auto flex w-full max-w-xl flex-col gap-2 px-5 pt-4 md:max-w-2xl lg:max-w-3xl">
        {children}
      </div>
    </div>
  );
}
