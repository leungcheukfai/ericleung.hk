import { siteConfig } from '@/content/site';
import Image from 'next/image';
import Link from 'next/link';

const PILL =
  'inline-flex h-9 items-center justify-center gap-1.5 rounded-full border border-border bg-background/80 px-4 text-sm text-muted-foreground backdrop-blur-sm transition-all hover:border-primary hover:text-foreground';

/** Compact version of the home header: who wrote this, and the way back. */
export default function BlogHeader() {
  const { profile } = siteConfig;
  return (
    <header className="flex items-center justify-between gap-4">
      <Link href="/" className="flex items-center gap-3">
        {profile.avatar ? (
          <Image
            src={profile.avatar}
            alt=""
            width={44}
            height={44}
            sizes="44px"
            className="h-11 w-11 rounded-full object-cover"
          />
        ) : null}
        <span className="font-cal text-foreground text-xl">{profile.name}</span>
      </Link>
      <nav className="flex items-center gap-2">
        <Link href="/" className={PILL}>
          Home
        </Link>
        <Link href="/blog" className={PILL}>
          Blog
        </Link>
      </nav>
    </header>
  );
}
