'use client';

import { siteConfig } from '@/content/site';
import { cn } from '@/lib/utils';
import { Check, ExternalLink, MapPin, Share2 } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

function HeaderButton({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  return (
    <a
      href={href}
      target={href.startsWith('http') ? '_blank' : undefined}
      rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
      className="inline-flex h-9 items-center justify-center gap-1.5 rounded-full border border-border bg-background/80 px-4 text-sm text-muted-foreground backdrop-blur-sm transition-all hover:border-primary hover:text-foreground"
    >
      {label}
      {href.startsWith('http') && <ExternalLink className="h-3.5 w-3.5" />}
    </a>
  );
}

function ShareButton() {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: siteConfig.title,
          text: siteConfig.description,
          url,
        });
        return;
      } catch {
        return;
      }
    }

    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <button
      type="button"
      onClick={() => void handleShare()}
      className="inline-flex h-9 items-center justify-center gap-1.5 rounded-full border border-border bg-background/80 px-4 text-sm text-muted-foreground backdrop-blur-sm transition-all hover:border-primary hover:text-foreground"
    >
      {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
      {copied ? 'Copied' : 'Share'}
    </button>
  );
}

export default function SiteHeader() {
  const { profile } = siteConfig;
  const initials = profile.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

  return (
    <header className="flex flex-col gap-y-4">
      <div className="flex items-start justify-between gap-4">
        {profile.avatar ? (
          <Image
            src={profile.avatar}
            alt={profile.name}
            width={100}
            height={100}
            className="h-[100px] w-[100px] rounded-full object-cover"
          />
        ) : (
          <div className="flex h-[100px] w-[100px] items-center justify-center rounded-full bg-primary/10 font-cal text-3xl text-primary">
            {initials}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-end gap-2">
          <ShareButton />
          {profile.actions.map((action) => (
            <HeaderButton key={action.href} href={action.href} label={action.label} />
          ))}
        </div>
      </div>

      <div className="flex items-center gap-x-2">
        <h1 className="min-w-0 bg-transparent font-cal text-4xl text-foreground md:text-5xl lg:text-6xl">
          {profile.name}
        </h1>
      </div>

      <div
        className="prose prose-sm mx-auto max-w-none text-foreground dark:prose-invert lg:prose-lg prose-headings:font-cal prose-p:m-0 prose-p:text-foreground prose-code:rounded prose-code:bg-muted prose-code:px-1 prose-code:py-0.5"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: trusted local config content
        dangerouslySetInnerHTML={{ __html: profile.bioHtml }}
      />

      {(profile.handle || profile.role || profile.location) && (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-muted-foreground text-sm">
          {profile.handle && <span>{profile.handle}</span>}
          {profile.role && <span>{profile.role}</span>}
          {profile.location && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {profile.location}
            </span>
          )}
        </div>
      )}
    </header>
  );
}
