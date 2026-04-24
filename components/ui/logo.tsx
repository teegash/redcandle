import Image from "next/image";
import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-3">
      <span className="brand-frame flex size-12 items-center justify-center rounded-[1.15rem] p-1.5">
        <Image
          src="https://images.pexels.com/photos/37237271/pexels-photo-37237271.png"
          alt="RedCandle logo"
          width={48}
          height={48}
          className="size-full rounded-[0.9rem] object-cover"
          priority
        />
      </span>
      <span className="flex flex-col">
        <span className="brand-kicker">RedCandle</span>
        <span className="metal-text text-sm font-semibold">Signal Atelier</span>
      </span>
    </Link>
  );
}
