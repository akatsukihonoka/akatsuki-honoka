import { cn } from "@/lib/utils";

export function PageContainer({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-xl px-5 md:max-w-2xl lg:max-w-3xl", className)}>
      {children}
    </div>
  );
}
