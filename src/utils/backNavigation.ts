export const BACK_TARGETS = {
  'gm-tools': {
    href: '/gm-tools',
    label: '← Back to GM Tools'
  },
  'player-tools': {
    href: '/player-tools',
    label: '← Back to Player Tools'
  }
} as const;

export type BackTargetKey = keyof typeof BACK_TARGETS;

type SearchParamValue = string | string[] | undefined;

const normalizeContextKey = (value: string | null | undefined): BackTargetKey | undefined => {
  if (!value) {
    return undefined;
  }

  const normalized = value.toLowerCase();
  if (normalized === 'gm-tools' || normalized === 'player-tools') {
    return normalized;
  }

  return undefined;
};

const extractFromValue = (value: SearchParamValue): string | undefined => {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
};

export const resolveBackTargetFromParam = (
  from: string | null | undefined,
  fallbackKey: BackTargetKey
) => {
  const contextKey = normalizeContextKey(from ?? undefined) ?? fallbackKey;
  return BACK_TARGETS[contextKey];
};

export const resolveBackTargetFromSearchParams = (
  searchParams: Record<string, SearchParamValue> | undefined,
  fallbackKey: BackTargetKey
) => {
  const rawValue = searchParams ? extractFromValue(searchParams.from) : undefined;
  return resolveBackTargetFromParam(rawValue ?? null, fallbackKey);
};
