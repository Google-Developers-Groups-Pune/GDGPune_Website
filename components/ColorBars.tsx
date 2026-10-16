import { cn } from "@/lib/cn";

const colors = ["bg-google-blue", "bg-google-green", "bg-google-yellow", "bg-google-red"];

type ColorBarsProps = {
  className?: string;
  barClassName?: string;
};

/** The four Google-colour pills used as a divider throughout the brand. */
export function ColorBars({ className, barClassName }: ColorBarsProps) {
  return (
    <div aria-hidden="true" className={cn("flex", className)}>
      {colors.map((color) => (
        <span key={color} className={cn("block rounded-full", color, barClassName)} />
      ))}
    </div>
  );
}
