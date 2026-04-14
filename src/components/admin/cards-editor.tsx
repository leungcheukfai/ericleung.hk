'use client';

import {
  resetAdminCardsAction,
  saveAdminCardsAction,
} from '@/app/admin/actions';
import SiteBentoGrid from '@/components/site/bento-grid';
import type { SiteRenderBreakpoint } from '@/components/site/breakpoint-context';
import {
  type SiteBooksCard,
  type SiteCard,
  type SiteCountdownCard,
  type SiteFavoritesCard,
  type SiteLinkCard,
  type SiteMapCard,
  type SitePodcastsCard,
  type SiteWeatherCard,
  type SiteYouTubeChannelsCard,
  getSiteCardTitle,
} from '@/content/site';
import { cn } from '@/lib/utils';
import type { BookMetadata } from '@/server/book-metadata';
import type { MusicMetadata } from '@/server/music-metadata';
import type { SiteMetricsSummary } from '@/server/site-analytics';
import type { YouTubeChannelMetadata } from '@/server/youtube-channel-metadata';
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  Copy,
  GripVertical,
  Monitor,
  Plus,
  RotateCcw,
  Save,
  Smartphone,
  Trash2,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { useEffect, useMemo, useState, useTransition } from 'react';
import type { LinkPreviewMap } from '../site/cards';

type EditorStatus = {
  kind: 'error' | 'success';
  message: string;
};

type ListCapableCard =
  | SitePodcastsCard
  | SiteYouTubeChannelsCard
  | SiteBooksCard
  | SiteFavoritesCard;

type ListItemRecord = Record<string, string | undefined>;

type ListFieldDescriptor = {
  key: string;
  label: string;
  placeholder?: string;
  type?: 'text' | 'url';
};

type DragState =
  | {
      kind: 'card';
      index: number;
    }
  | {
      kind: 'item';
      cardId: string;
      index: number;
    }
  | null;

const BENTO_SIZE_OPTIONS = [
  { value: '2x2', label: '2 x 2' },
  { value: '2x4', label: '2 x 4' },
  { value: '4x1', label: '4 x 1' },
  { value: '4x2', label: '4 x 2' },
  { value: '4x4', label: '4 x 4' },
  { value: '4x5', label: '4 x 5' },
] as const;

const CARD_TYPE_OPTIONS: Array<{ label: string; value: SiteCard['type'] }> = [
  { value: 'link', label: 'Link' },
  { value: 'note', label: 'Note' },
  { value: 'image', label: 'Image' },
  { value: 'map', label: 'Location map' },
  { value: 'github', label: 'GitHub' },
  { value: 'calendar', label: 'Book a time' },
  { value: 'email-collect', label: 'Email signup' },
  { value: 'music', label: 'Music' },
  { value: 'podcasts', label: 'Podcast list' },
  { value: 'youtube-channels', label: 'YouTube list' },
  { value: 'favorites', label: 'Things I like' },
  { value: 'books', label: 'Books' },
  { value: 'countdown', label: 'Countdown' },
  { value: 'weather', label: 'Weather' },
  { value: 'twitter', label: 'Tweet' },
  { value: 'views', label: 'Views' },
];

const LIST_FIELD_CONFIG: Record<
  ListCapableCard['type'],
  ListFieldDescriptor[]
> = {
  podcasts: [
    { key: 'title', label: 'Title', placeholder: 'All-In', type: 'text' },
    {
      key: 'publisher',
      label: 'Publisher',
      placeholder: 'All-In Podcast, LLC',
      type: 'text',
    },
    {
      key: 'href',
      label: 'Apple Podcasts URL',
      placeholder: 'https://podcasts.apple.com/...',
      type: 'url',
    },
    {
      key: 'artwork',
      label: 'Artwork URL',
      placeholder: 'https://...',
      type: 'url',
    },
  ],
  'youtube-channels': [
    {
      key: 'href',
      label: 'Channel URL',
      placeholder: 'https://www.youtube.com/@channel',
      type: 'url',
    },
    {
      key: 'title',
      label: 'Title override',
      placeholder: 'Leave blank to use preview title',
      type: 'text',
    },
    {
      key: 'artwork',
      label: 'Artwork override',
      placeholder: 'https://...',
      type: 'url',
    },
  ],
  books: [
    {
      key: 'href',
      label: 'Book URL',
      placeholder: 'https://a.co/...',
      type: 'url',
    },
    {
      key: 'title',
      label: 'Title',
      placeholder: 'The Almanack of Naval Ravikant',
      type: 'text',
    },
    {
      key: 'subtitle',
      label: 'Subtitle',
      placeholder: 'Eric Jorgenson',
      type: 'text',
    },
    {
      key: 'artwork',
      label: 'Artwork URL',
      placeholder: 'https://...',
      type: 'url',
    },
  ],
  favorites: [
    {
      key: 'title',
      label: 'Name',
      placeholder: 'SpaceX',
      type: 'text',
    },
    {
      key: 'tagline',
      label: 'Tagline',
      placeholder: 'Reusable rockets and Starship',
      type: 'text',
    },
    {
      key: 'href',
      label: 'Website URL',
      placeholder: 'https://www.spacex.com/',
      type: 'url',
    },
  ],
};

const INPUT_CLASS_NAME =
  'h-10 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20';
const TEXTAREA_CLASS_NAME =
  'min-h-28 w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20';
const SELECT_CLASS_NAME =
  'h-10 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20';

function reorderItems<T>(items: T[], fromIndex: number, toIndex: number) {
  if (fromIndex === toIndex) {
    return items;
  }

  const next = [...items];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
}

function isListCapableCard(card: SiteCard): card is ListCapableCard {
  return (
    card.type === 'podcasts' ||
    card.type === 'youtube-channels' ||
    card.type === 'books' ||
    card.type === 'favorites'
  );
}

function createCardId(cards: SiteCard[], prefix: string) {
  const base =
    prefix
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'card';

  let candidate = base;
  let suffix = 2;

  while (cards.some((card) => card.id === candidate)) {
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }

  return candidate;
}

function createDefaultListItem(type: ListCapableCard['type']) {
  switch (type) {
    case 'podcasts':
      return {
        title: 'New podcast',
        publisher: 'Publisher',
        href: 'https://podcasts.apple.com/',
        artwork: '',
      };
    case 'youtube-channels':
      return {
        href: 'https://www.youtube.com/',
        title: 'New channel',
        artwork: '',
      };
    case 'books':
      return {
        href: 'https://www.amazon.com/',
        title: 'New book',
        subtitle: 'Author',
        artwork: '',
      };
    case 'favorites':
      return {
        title: 'New favorite',
        tagline: 'Why it belongs here',
        href: 'https://example.com/',
      };
    default:
      return {
        title: 'New item',
      };
  }
}

function createDefaultCard(
  type: SiteCard['type'],
  cards: SiteCard[]
): SiteCard {
  const id = createCardId(cards, type);

  switch (type) {
    case 'link':
      return {
        id,
        type: 'link',
        size: { sm: '2x2', md: '2x2' },
        href: 'https://example.com/',
        label: 'New link',
        description: 'Short description',
      };
    case 'note':
      return {
        id,
        type: 'note',
        size: { sm: '4x2', md: '4x2' },
        html: '<p>Add your note here.</p>',
      };
    case 'image':
      return {
        id,
        type: 'image',
        size: { sm: '2x2', md: '2x2' },
        url: 'https://placehold.co/800x800/png',
        caption: 'Image caption',
      };
    case 'map':
      return {
        id,
        type: 'map',
        size: { sm: '2x2', md: '2x2' },
        latitude: 22.3193,
        longitude: 114.1694,
        label: 'Hong Kong',
      };
    case 'github':
      return {
        id,
        type: 'github',
        size: { sm: '4x2', md: '4x2' },
        username: 'leungcheukfai',
      };
    case 'email-collect':
      return {
        id,
        type: 'email-collect',
        size: { sm: '4x2', md: '4x2' },
        heading: 'Stay in the loop',
        description: 'Collect subscribers here.',
        buttonText: 'Subscribe',
      };
    case 'countdown':
      return {
        id,
        type: 'countdown',
        size: { sm: '2x2', md: '4x2' },
        title: 'Next launch',
        targetDate: new Date(
          Date.now() + 7 * 24 * 60 * 60 * 1000
        ).toISOString(),
        emoji: '🚀',
        repeat: 'none',
      };
    case 'weather':
      return {
        id,
        type: 'weather',
        size: { sm: '2x2', md: '2x2' },
        latitude: 22.3193,
        longitude: 114.1694,
        locationName: 'Hong Kong',
      };
    case 'twitter':
      return {
        id,
        type: 'twitter',
        size: { sm: '4x2', md: '4x2' },
        tweetId: '20',
      };
    case 'music':
      return {
        id,
        type: 'music',
        size: { sm: '4x2', md: '4x2' },
        url: 'https://music.apple.com/hk/album/cornfield-chase/1533983552?i=1533984393&l=en-GB',
      };
    case 'podcasts':
      return {
        id,
        type: 'podcasts',
        size: { sm: '4x4', md: '4x5' },
        title: 'Podcast channels',
        description: 'Shows I keep up with every week.',
        items: [createDefaultListItem('podcasts')],
      };
    case 'youtube-channels':
      return {
        id,
        type: 'youtube-channels',
        size: { sm: '4x4', md: '4x5' },
        title: 'YouTube channels',
        description: 'Channels I keep up with.',
        items: [createDefaultListItem('youtube-channels')],
      };
    case 'books':
      return {
        id,
        type: 'books',
        size: { sm: '4x4', md: '4x5' },
        title: 'Books',
        description: 'Books I keep revisiting and recommending.',
        items: [createDefaultListItem('books')],
      };
    case 'favorites':
      return {
        id,
        type: 'favorites',
        size: { sm: '4x4', md: '4x5' },
        title: 'Things I Like',
        description: 'Brands, tools, and products I keep coming back to.',
        items: [createDefaultListItem('favorites')],
      };
    case 'calendar':
      return {
        id,
        type: 'calendar',
        size: { sm: '2x2', md: '4x2' },
        url: 'https://cal.com/ericleung/30min',
        title: 'Book a time',
        description: 'Schedule a meeting with me',
      };
    case 'views':
      return {
        id,
        type: 'views',
        size: { sm: '2x2', md: '2x2' },
      };
    default:
      return {
        id,
        type: 'link',
        size: { sm: '2x2', md: '2x2' },
        href: 'https://example.com/',
        label: 'New link',
        description: 'Short description',
      };
  }
}

function duplicateCard(card: SiteCard, cards: SiteCard[]) {
  const clone = JSON.parse(JSON.stringify(card)) as SiteCard;
  clone.id = createCardId(cards, `${card.id}-copy`);
  return clone;
}

function getCardSummary(card: SiteCard) {
  switch (card.type) {
    case 'link':
      return card.description || card.href;
    case 'note':
      return 'Custom HTML note';
    case 'image':
      return card.caption || card.url;
    case 'map':
      return card.label || `${card.latitude}, ${card.longitude}`;
    case 'github':
      return `@${card.username}`;
    case 'email-collect':
      return card.description || 'Collect email subscribers';
    case 'countdown':
      return card.title || card.targetDate;
    case 'weather':
      return card.locationName || `${card.latitude}, ${card.longitude}`;
    case 'twitter':
      return `Tweet ${card.tweetId}`;
    case 'music':
      return card.url;
    case 'podcasts':
    case 'youtube-channels':
    case 'books':
    case 'favorites':
      return `${card.items.length} item${card.items.length === 1 ? '' : 's'}`;
    case 'calendar':
      return card.description || card.url;
    case 'views':
      return 'Shows your total site views';
    default:
      return card.id;
  }
}

function formatCardTypeLabel(type: SiteCard['type']) {
  return (
    CARD_TYPE_OPTIONS.find((option) => option.value === type)?.label ?? type
  );
}

function Panel({
  title,
  description,
  action,
  children,
  className,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        'rounded-2xl border border-border/60 bg-card p-5 shadow-sm',
        className
      )}
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="font-cal text-xl">{title}</h2>
          {description && (
            <p className="mt-1 text-muted-foreground text-sm">{description}</p>
          )}
        </div>
        {action}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <span className="font-medium text-sm">{label}</span>
      {children}
      {hint && <p className="text-muted-foreground text-xs">{hint}</p>}
    </div>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: 'text' | 'url' | 'number';
}) {
  return (
    <input
      type={type}
      value={value ?? ''}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
      className={INPUT_CLASS_NAME}
    />
  );
}

function NumberInput({
  value,
  onChange,
  placeholder,
  step = 'any',
}: {
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  step?: string;
}) {
  return (
    <input
      type="number"
      step={step}
      value={Number.isFinite(value) ? String(value) : ''}
      placeholder={placeholder}
      onChange={(event) => onChange(Number(event.target.value))}
      className={INPUT_CLASS_NAME}
    />
  );
}

function SizeSelect({
  value,
  onChange,
}: {
  value: SiteCard['size']['sm'];
  onChange: (value: SiteCard['size']['sm']) => void;
}) {
  return (
    <select
      value={value}
      onChange={(event) =>
        onChange(event.target.value as SiteCard['size']['sm'])
      }
      className={SELECT_CLASS_NAME}
    >
      {BENTO_SIZE_OPTIONS.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

function IconButton({
  label,
  onClick,
  disabled,
  children,
  className,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
      className={cn(
        'inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border/60 bg-background text-muted-foreground transition hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
    >
      {children}
    </button>
  );
}

function ListItemsEditor({
  card,
  dragState,
  onAddItem,
  onChangeItem,
  onMoveItem,
  onRemoveItem,
  onSetDragState,
}: {
  card: ListCapableCard;
  dragState: DragState;
  onAddItem: () => void;
  onChangeItem: (itemIndex: number, key: string, value: string) => void;
  onMoveItem: (fromIndex: number, toIndex: number) => void;
  onRemoveItem: (itemIndex: number) => void;
  onSetDragState: (dragState: DragState) => void;
}) {
  const fields = LIST_FIELD_CONFIG[card.type];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="font-medium text-sm">Items</h3>
          <p className="text-muted-foreground text-xs">
            Drag to reorder, then edit the text and URLs inline.
          </p>
        </div>
        <button
          type="button"
          onClick={onAddItem}
          className="hover:-translate-y-0.5 inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-border/60 bg-background px-3 text-sm transition hover:shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Add item
        </button>
      </div>

      <div className="space-y-3">
        {card.items.map((item, itemIndex) => (
          <div
            key={`${card.id}-${itemIndex}`}
            onDragOver={(event) => {
              if (
                dragState?.kind === 'item' &&
                dragState.cardId === card.id &&
                dragState.index !== itemIndex
              ) {
                event.preventDefault();
              }
            }}
            onDrop={(event) => {
              event.preventDefault();
              if (
                dragState?.kind === 'item' &&
                dragState.cardId === card.id &&
                dragState.index !== itemIndex
              ) {
                onMoveItem(dragState.index, itemIndex);
              }
              onSetDragState(null);
            }}
            className="rounded-2xl border border-border/60 bg-background/80 p-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div
                  draggable
                  onDragStart={() =>
                    onSetDragState({
                      kind: 'item',
                      cardId: card.id,
                      index: itemIndex,
                    })
                  }
                  onDragEnd={() => onSetDragState(null)}
                  className="inline-flex h-9 w-9 cursor-grab items-center justify-center rounded-xl border border-border/60 bg-muted/40 text-muted-foreground"
                >
                  <GripVertical className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium text-sm">Item {itemIndex + 1}</p>
                  <p className="text-muted-foreground text-xs">
                    Reorder or edit this entry
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <IconButton
                  label="Move item up"
                  onClick={() =>
                    onMoveItem(itemIndex, Math.max(itemIndex - 1, 0))
                  }
                  disabled={itemIndex === 0}
                >
                  <ArrowUp className="h-4 w-4" />
                </IconButton>
                <IconButton
                  label="Move item down"
                  onClick={() =>
                    onMoveItem(
                      itemIndex,
                      Math.min(itemIndex + 1, card.items.length - 1)
                    )
                  }
                  disabled={itemIndex === card.items.length - 1}
                >
                  <ArrowDown className="h-4 w-4" />
                </IconButton>
                <IconButton
                  label="Remove item"
                  onClick={() => onRemoveItem(itemIndex)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </IconButton>
              </div>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {fields.map((field) => (
                <Field key={field.key} label={field.label}>
                  <TextInput
                    value={(item as ListItemRecord)[field.key]}
                    type={field.type}
                    placeholder={field.placeholder}
                    onChange={(value) =>
                      onChangeItem(itemIndex, field.key, value)
                    }
                  />
                </Field>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminCardsEditor({
  initialCards,
  summary,
  previews,
  musicMetadataMap,
  youtubeChannelMetadataMap,
  bookMetadataMap,
  profileName,
  profileAvatar,
}: {
  initialCards: SiteCard[];
  summary: SiteMetricsSummary;
  previews: LinkPreviewMap;
  musicMetadataMap: Record<string, MusicMetadata | null>;
  youtubeChannelMetadataMap: Record<
    string,
    Record<string, YouTubeChannelMetadata | null>
  >;
  bookMetadataMap: Record<string, Record<string, BookMetadata | null>>;
  profileName: string;
  profileAvatar?: string;
}) {
  const [cards, setCards] = useState(initialCards);
  const [savedCards, setSavedCards] = useState(initialCards);
  const [selectedCardId, setSelectedCardId] = useState(
    initialCards[0]?.id ?? ''
  );
  const [newCardType, setNewCardType] = useState<SiteCard['type']>('link');
  const [previewMode, setPreviewMode] = useState<SiteRenderBreakpoint>('md');
  const [status, setStatus] = useState<EditorStatus | null>(null);
  const [dragState, setDragState] = useState<DragState>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (cards.length === 0) {
      setSelectedCardId('');
      return;
    }

    if (!cards.some((card) => card.id === selectedCardId)) {
      setSelectedCardId(cards[0].id);
    }
  }, [cards, selectedCardId]);

  const duplicateIds = useMemo(() => {
    const counts = new Map<string, number>();

    for (const card of cards) {
      counts.set(card.id, (counts.get(card.id) ?? 0) + 1);
    }

    return new Set(
      [...counts.entries()].filter(([, count]) => count > 1).map(([id]) => id)
    );
  }, [cards]);

  const selectedCard =
    cards.find((card) => card.id === selectedCardId) ?? cards[0] ?? null;
  const isDirty = JSON.stringify(cards) !== JSON.stringify(savedCards);

  function updateCard(cardId: string, updater: (card: SiteCard) => SiteCard) {
    setCards((currentCards) =>
      currentCards.map((card) => (card.id === cardId ? updater(card) : card))
    );
    setStatus(null);
  }

  function updateCardField(cardId: string, field: string, value: string) {
    updateCard(cardId, (card) => ({ ...card, [field]: value }) as SiteCard);
  }

  function updateCardSize(
    cardId: string,
    breakpoint: 'sm' | 'md',
    value: SiteCard['size']['sm']
  ) {
    updateCard(cardId, (card) => ({
      ...card,
      size: {
        ...card.size,
        [breakpoint]: value,
      },
    }));
  }

  function addCard() {
    const newCard = createDefaultCard(newCardType, cards);

    setCards((currentCards) => [...currentCards, newCard]);
    setSelectedCardId(newCard.id);
    setStatus({
      kind: 'success',
      message: `${formatCardTypeLabel(newCard.type)} card added. Finish editing it, then save.`,
    });
  }

  function moveCard(fromIndex: number, toIndex: number) {
    setCards((currentCards) => reorderItems(currentCards, fromIndex, toIndex));
    setStatus(null);
  }

  function duplicateSelectedCard() {
    if (!selectedCard) {
      return;
    }

    const clonedCard = duplicateCard(selectedCard, cards);

    setCards((currentCards) => {
      const cardIndex = currentCards.findIndex(
        (card) => card.id === selectedCard.id
      );
      const nextCards = [...currentCards];
      nextCards.splice(cardIndex + 1, 0, clonedCard);
      return nextCards;
    });
    setSelectedCardId(clonedCard.id);
    setStatus({
      kind: 'success',
      message:
        'Card duplicated. Update the new copy, then save when you are ready.',
    });
  }

  function removeCard(cardId: string) {
    setCards((currentCards) => {
      const cardIndex = currentCards.findIndex((card) => card.id === cardId);
      const nextCards = currentCards.filter((card) => card.id !== cardId);

      if (selectedCardId === cardId) {
        const nextSelection = nextCards[cardIndex] ?? nextCards[cardIndex - 1];
        setSelectedCardId(nextSelection?.id ?? '');
      }

      return nextCards;
    });
    setStatus(null);
  }

  function updateListCardItems(
    cardId: string,
    updater: (items: ListItemRecord[]) => ListItemRecord[]
  ) {
    updateCard(cardId, (card) => {
      if (!isListCapableCard(card)) {
        return card;
      }

      return {
        ...card,
        items: updater(card.items as ListItemRecord[]) as typeof card.items,
      };
    });
  }

  function addListItem(card: ListCapableCard) {
    updateListCardItems(card.id, (items) => [
      ...items,
      createDefaultListItem(card.type) as ListItemRecord,
    ]);
  }

  function moveListItem(
    card: ListCapableCard,
    fromIndex: number,
    toIndex: number
  ) {
    updateListCardItems(card.id, (items) =>
      reorderItems(items, fromIndex, toIndex)
    );
  }

  function updateListItemField(
    card: ListCapableCard,
    itemIndex: number,
    key: string,
    value: string
  ) {
    updateListCardItems(card.id, (items) =>
      items.map((item, index) =>
        index === itemIndex ? { ...item, [key]: value } : item
      )
    );
  }

  function removeListItem(card: ListCapableCard, itemIndex: number) {
    updateListCardItems(card.id, (items) =>
      items.filter((_, index) => index !== itemIndex)
    );
  }

  function saveCards() {
    setStatus(null);

    startTransition(() => {
      saveAdminCardsAction(cards).then((result) => {
        if (!result.ok || !result.cards) {
          setStatus({
            kind: 'error',
            message: result.message,
          });
          return;
        }

        setCards(result.cards);
        setSavedCards(result.cards);
        setSelectedCardId((current) =>
          result.cards.some((card) => card.id === current)
            ? current
            : (result.cards[0]?.id ?? '')
        );
        setStatus({
          kind: 'success',
          message: result.message,
        });
      });
    });
  }

  function resetCards() {
    if (
      !window.confirm(
        'Reset the editor back to the default cards from src/content/site.ts?'
      )
    ) {
      return;
    }

    setStatus(null);

    startTransition(() => {
      resetAdminCardsAction().then((result) => {
        if (!result.ok || !result.cards) {
          setStatus({
            kind: 'error',
            message: result.message,
          });
          return;
        }

        setCards(result.cards);
        setSavedCards(result.cards);
        setSelectedCardId(result.cards[0]?.id ?? '');
        setStatus({
          kind: 'success',
          message: result.message,
        });
      });
    });
  }

  function renderSelectedCardFields(card: SiteCard) {
    switch (card.type) {
      case 'link':
        return (
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Destination URL">
              <TextInput
                type="url"
                value={card.href}
                onChange={(value) => updateCardField(card.id, 'href', value)}
              />
            </Field>
            <Field label="Variant">
              <select
                value={card.variant ?? 'default'}
                onChange={(event) =>
                  updateCard(card.id, (currentCard) => ({
                    ...currentCard,
                    variant:
                      event.target.value === 'default'
                        ? undefined
                        : (event.target.value as SiteLinkCard['variant']),
                  }))
                }
                className={SELECT_CLASS_NAME}
              >
                <option value="default">Default</option>
                <option value="spotlight">Spotlight project</option>
              </select>
            </Field>
            <Field label="Title">
              <TextInput
                value={card.label}
                onChange={(value) => updateCardField(card.id, 'label', value)}
              />
            </Field>
            <Field label="Description">
              <TextInput
                value={card.description}
                onChange={(value) =>
                  updateCardField(card.id, 'description', value)
                }
              />
            </Field>
          </div>
        );
      case 'note':
        return (
          <Field
            label="HTML content"
            hint="Trusted HTML only. This renders directly on the public site."
          >
            <textarea
              value={card.html}
              onChange={(event) =>
                updateCardField(card.id, 'html', event.target.value)
              }
              className={TEXTAREA_CLASS_NAME}
            />
          </Field>
        );
      case 'image':
        return (
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Image URL">
              <TextInput
                type="url"
                value={card.url}
                onChange={(value) => updateCardField(card.id, 'url', value)}
              />
            </Field>
            <Field label="Optional link URL">
              <TextInput
                type="url"
                value={card.href}
                onChange={(value) => updateCardField(card.id, 'href', value)}
              />
            </Field>
            <Field label="Caption">
              <TextInput
                value={card.caption}
                onChange={(value) => updateCardField(card.id, 'caption', value)}
              />
            </Field>
          </div>
        );
      case 'map':
        return (
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Latitude">
              <NumberInput
                value={card.latitude}
                onChange={(value) =>
                  updateCard(
                    card.id,
                    (currentCard) =>
                      ({
                        ...currentCard,
                        latitude: value,
                      }) as SiteMapCard
                  )
                }
              />
            </Field>
            <Field label="Longitude">
              <NumberInput
                value={card.longitude}
                onChange={(value) =>
                  updateCard(
                    card.id,
                    (currentCard) =>
                      ({
                        ...currentCard,
                        longitude: value,
                      }) as SiteMapCard
                  )
                }
              />
            </Field>
            <Field label="Label">
              <TextInput
                value={card.label}
                onChange={(value) => updateCardField(card.id, 'label', value)}
              />
            </Field>
          </div>
        );
      case 'github':
        return (
          <Field label="GitHub username">
            <TextInput
              value={card.username}
              onChange={(value) => updateCardField(card.id, 'username', value)}
            />
          </Field>
        );
      case 'email-collect':
        return (
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Heading">
              <TextInput
                value={card.heading}
                onChange={(value) => updateCardField(card.id, 'heading', value)}
              />
            </Field>
            <Field label="Button text">
              <TextInput
                value={card.buttonText}
                onChange={(value) =>
                  updateCardField(card.id, 'buttonText', value)
                }
              />
            </Field>
            <div className="md:col-span-2">
              <Field label="Description">
                <textarea
                  value={card.description ?? ''}
                  onChange={(event) =>
                    updateCardField(card.id, 'description', event.target.value)
                  }
                  className={TEXTAREA_CLASS_NAME}
                />
              </Field>
            </div>
          </div>
        );
      case 'countdown':
        return (
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Title">
              <TextInput
                value={card.title}
                onChange={(value) => updateCardField(card.id, 'title', value)}
              />
            </Field>
            <Field label="Emoji">
              <TextInput
                value={card.emoji}
                onChange={(value) => updateCardField(card.id, 'emoji', value)}
              />
            </Field>
            <Field label="Target date">
              <TextInput
                value={card.targetDate}
                onChange={(value) =>
                  updateCardField(card.id, 'targetDate', value)
                }
              />
            </Field>
            <Field label="Repeat">
              <select
                value={card.repeat ?? 'none'}
                onChange={(event) =>
                  updateCard(card.id, (currentCard) => ({
                    ...currentCard,
                    repeat: event.target.value as SiteCountdownCard['repeat'],
                  }))
                }
                className={SELECT_CLASS_NAME}
              >
                <option value="none">No repeat</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </Field>
          </div>
        );
      case 'weather':
        return (
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Latitude">
              <NumberInput
                value={card.latitude}
                onChange={(value) =>
                  updateCard(
                    card.id,
                    (currentCard) =>
                      ({
                        ...currentCard,
                        latitude: value,
                      }) as SiteWeatherCard
                  )
                }
              />
            </Field>
            <Field label="Longitude">
              <NumberInput
                value={card.longitude}
                onChange={(value) =>
                  updateCard(
                    card.id,
                    (currentCard) =>
                      ({
                        ...currentCard,
                        longitude: value,
                      }) as SiteWeatherCard
                  )
                }
              />
            </Field>
            <Field label="Location name">
              <TextInput
                value={card.locationName}
                onChange={(value) =>
                  updateCardField(card.id, 'locationName', value)
                }
              />
            </Field>
          </div>
        );
      case 'twitter':
        return (
          <Field label="Tweet ID">
            <TextInput
              value={card.tweetId}
              onChange={(value) => updateCardField(card.id, 'tweetId', value)}
            />
          </Field>
        );
      case 'music':
        return (
          <Field label="Apple Music or Spotify URL">
            <TextInput
              type="url"
              value={card.url}
              onChange={(value) => updateCardField(card.id, 'url', value)}
            />
          </Field>
        );
      case 'podcasts':
      case 'youtube-channels':
      case 'books':
      case 'favorites':
        return (
          <div className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Section title">
                <TextInput
                  value={card.title}
                  onChange={(value) => updateCardField(card.id, 'title', value)}
                />
              </Field>
              <Field label="Description">
                <TextInput
                  value={card.description}
                  onChange={(value) =>
                    updateCardField(card.id, 'description', value)
                  }
                />
              </Field>
            </div>
            <ListItemsEditor
              card={card}
              dragState={dragState}
              onAddItem={() => addListItem(card)}
              onChangeItem={(itemIndex, key, value) =>
                updateListItemField(card, itemIndex, key, value)
              }
              onMoveItem={(fromIndex, toIndex) =>
                moveListItem(card, fromIndex, toIndex)
              }
              onRemoveItem={(itemIndex) => removeListItem(card, itemIndex)}
              onSetDragState={setDragState}
            />
          </div>
        );
      case 'calendar':
        return (
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Booking URL">
              <TextInput
                type="url"
                value={card.url}
                onChange={(value) => updateCardField(card.id, 'url', value)}
              />
            </Field>
            <Field label="Title">
              <TextInput
                value={card.title}
                onChange={(value) => updateCardField(card.id, 'title', value)}
              />
            </Field>
            <div className="md:col-span-2">
              <Field label="Description">
                <TextInput
                  value={card.description}
                  onChange={(value) =>
                    updateCardField(card.id, 'description', value)
                  }
                />
              </Field>
            </div>
          </div>
        );
      case 'views':
        return (
          <div className="rounded-2xl border border-border/60 border-dashed bg-muted/20 px-4 py-4 text-muted-foreground text-sm">
            This card is display-only. Its number comes from your tracked page
            views.
          </div>
        );
      default:
        return null;
    }
  }

  return (
    <div className="space-y-6">
      <Panel
        title="Visual card editor"
        description="Edit card content here instead of touching JSON. Card order and list item order are draggable now; freeform bento placement can be the next pass."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={resetCards}
              disabled={isPending}
              className="hover:-translate-y-0.5 inline-flex h-10 items-center justify-center gap-2 rounded-full border border-border/60 bg-card px-4 text-sm shadow-sm transition hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </button>
            <button
              type="button"
              onClick={saveCards}
              disabled={isPending}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-primary px-4 font-medium text-primary-foreground text-sm shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              {isPending ? 'Saving…' : 'Save cards'}
            </button>
          </div>
        }
      >
        {status && (
          <div
            className={cn(
              'mb-5 rounded-2xl border px-4 py-3 text-sm',
              status.kind === 'success'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                : 'border-destructive/20 bg-destructive/5 text-destructive'
            )}
          >
            {status.message}
          </div>
        )}

        {duplicateIds.size > 0 && (
          <div className="mb-5 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-800 text-sm">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>
              Duplicate card ids will block saving. Fix these ids first:{' '}
              {[...duplicateIds].join(', ')}
            </p>
          </div>
        )}

        <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
          <div className="space-y-5">
            <Panel
              title="Cards"
              description="Add a new card, drag to reorder, or pick one to edit."
            >
              <div className="flex gap-2">
                <select
                  value={newCardType}
                  onChange={(event) =>
                    setNewCardType(event.target.value as SiteCard['type'])
                  }
                  className={SELECT_CLASS_NAME}
                >
                  {CARD_TYPE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={addCard}
                  className="hover:-translate-y-0.5 inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-border/60 bg-background px-3 text-sm transition hover:shadow-sm"
                >
                  <Plus className="h-4 w-4" />
                  Add
                </button>
              </div>

              <div className="mt-4 space-y-2">
                {cards.map((card, index) => {
                  const active = card.id === selectedCard?.id;

                  return (
                    <div
                      key={card.id}
                      onDragOver={(event) => {
                        if (
                          dragState?.kind === 'card' &&
                          dragState.index !== index
                        ) {
                          event.preventDefault();
                        }
                      }}
                      onDrop={(event) => {
                        event.preventDefault();
                        if (
                          dragState?.kind === 'card' &&
                          dragState.index !== index
                        ) {
                          moveCard(dragState.index, index);
                        }
                        setDragState(null);
                      }}
                      className={cn(
                        'rounded-2xl border p-3 transition',
                        active
                          ? 'border-primary/40 bg-primary/5 shadow-sm'
                          : 'border-border/60 bg-background/80 hover:border-border hover:bg-muted/20'
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <button
                          type="button"
                          draggable
                          onDragStart={() =>
                            setDragState({
                              kind: 'card',
                              index,
                            })
                          }
                          onDragEnd={() => setDragState(null)}
                          onClick={(event) => event.stopPropagation()}
                          className="inline-flex h-9 w-9 shrink-0 cursor-grab items-center justify-center rounded-xl border border-border/60 bg-muted/40 text-muted-foreground"
                        >
                          <GripVertical className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedCardId(card.id)}
                          className="min-w-0 flex-1 text-left"
                        >
                          <div className="flex items-center gap-2">
                            <p className="truncate font-medium text-sm">
                              {getSiteCardTitle(card)}
                            </p>
                            <span className="rounded-full border border-border/60 px-2 py-0.5 text-[10px] text-muted-foreground uppercase tracking-wide">
                              {formatCardTypeLabel(card.type)}
                            </span>
                          </div>
                          <p className="mt-1 truncate text-muted-foreground text-xs">
                            {getCardSummary(card)}
                          </p>
                          <p className="mt-1 text-[11px] text-muted-foreground">
                            {card.size.sm} mobile · {card.size.md} desktop
                          </p>
                        </button>
                        <IconButton
                          label="Remove card"
                          onClick={() => removeCard(card.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </IconButton>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Panel>
          </div>

          <div className="space-y-5">
            {selectedCard ? (
              <Panel
                title={formatCardTypeLabel(selectedCard.type)}
                description="Edit the selected card, then save when the preview looks right."
                action={
                  <div className="flex items-center gap-2">
                    <IconButton
                      label="Duplicate card"
                      onClick={duplicateSelectedCard}
                    >
                      <Copy className="h-4 w-4" />
                    </IconButton>
                    <IconButton
                      label="Remove selected card"
                      onClick={() => removeCard(selectedCard.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </IconButton>
                  </div>
                }
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <Field
                    label="Card id"
                    hint="Keep this stable. Analytics track clicks by card id."
                  >
                    <TextInput
                      value={selectedCard.id}
                      onChange={(value) => {
                        const previousId = selectedCard.id;
                        updateCard(previousId, (currentCard) => ({
                          ...currentCard,
                          id: value,
                        }));
                        setSelectedCardId(value);
                      }}
                    />
                    {duplicateIds.has(selectedCard.id) && (
                      <p className="text-destructive text-xs">
                        This id is duplicated.
                      </p>
                    )}
                  </Field>
                  <Field label="Card type">
                    <div className="flex h-10 items-center rounded-xl border border-border/60 bg-muted/30 px-3 text-muted-foreground text-sm">
                      {formatCardTypeLabel(selectedCard.type)}
                    </div>
                  </Field>
                  <Field label="Mobile size">
                    <SizeSelect
                      value={selectedCard.size.sm}
                      onChange={(value) =>
                        updateCardSize(selectedCard.id, 'sm', value)
                      }
                    />
                  </Field>
                  <Field label="Desktop size">
                    <SizeSelect
                      value={selectedCard.size.md}
                      onChange={(value) =>
                        updateCardSize(selectedCard.id, 'md', value)
                      }
                    />
                  </Field>
                </div>

                <div className="mt-5 border-border/60 border-t pt-5">
                  {renderSelectedCardFields(selectedCard)}
                </div>
              </Panel>
            ) : (
              <Panel
                title="Select a card"
                description="Add your first card on the left to start editing."
              >
                <div className="rounded-2xl border border-border/60 border-dashed bg-muted/20 px-4 py-6 text-muted-foreground text-sm">
                  Your homepage cards will appear here once you add one.
                </div>
              </Panel>
            )}
          </div>
        </div>
      </Panel>

      <Panel
        title="Live preview"
        description="This uses the same card components as the public homepage. Preview links are disabled here so you can edit safely."
        action={
          <div className="flex items-center gap-2 rounded-full border border-border/60 bg-background p-1">
            <button
              type="button"
              onClick={() => setPreviewMode('sm')}
              className={cn(
                'inline-flex h-9 items-center gap-2 rounded-full px-3 text-sm transition',
                previewMode === 'sm'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Smartphone className="h-4 w-4" />
              Mobile
            </button>
            <button
              type="button"
              onClick={() => setPreviewMode('md')}
              className={cn(
                'inline-flex h-9 items-center gap-2 rounded-full px-3 text-sm transition',
                previewMode === 'md'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Monitor className="h-4 w-4" />
              Desktop
            </button>
          </div>
        }
      >
        <div
          className={cn(
            'mx-auto rounded-[2rem] border border-border/60 bg-background p-4 shadow-sm',
            previewMode === 'sm' ? 'max-w-[390px]' : 'max-w-5xl'
          )}
        >
          <div className="pointer-events-none">
            <SiteBentoGrid
              cards={cards}
              summary={summary}
              previews={previews}
              musicMetadataMap={musicMetadataMap}
              youtubeChannelMetadataMap={youtubeChannelMetadataMap}
              bookMetadataMap={bookMetadataMap}
              profileName={profileName}
              profileAvatar={profileAvatar}
              forcedBreakpoint={previewMode}
              animate={false}
            />
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-border/60 bg-muted/20 px-4 py-3 text-muted-foreground text-sm">
          New URLs may need a refresh after saving before every preview
          image/title is enriched. If you want an exact preview immediately,
          fill in the title, subtitle, or artwork fields directly in the editor.
        </div>
      </Panel>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/60 bg-card px-5 py-4 shadow-sm">
        <p className="text-muted-foreground text-sm">
          {isDirty
            ? 'You have unsaved card changes.'
            : 'Everything here matches the last saved version.'}
        </p>
        <button
          type="button"
          onClick={saveCards}
          disabled={isPending || !isDirty}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-primary px-4 font-medium text-primary-foreground text-sm shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Save className="h-4 w-4" />
          {isPending ? 'Saving…' : 'Save cards'}
        </button>
      </div>
    </div>
  );
}
