import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description: string;
  align?: "left" | "center";
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
}: SectionHeadingProps) {
  return (
    <div className={cn("max-w-3xl", align === "center" && "mx-auto text-center")}>
      {eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}
      <h2 className="section-title mt-4 text-white">
        <span className="bg-gradient-to-r from-white via-stone-100 to-red-100 bg-clip-text text-transparent">
          {title}
        </span>
      </h2>
      <p className="subtle-copy mt-4 text-base sm:text-lg">{description}</p>
    </div>
  );
}
