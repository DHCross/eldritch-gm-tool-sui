export type PageSearchParams = Record<string, string | string[] | undefined>;

export type PagePropsWithSearchParams = {
  searchParams?: Promise<PageSearchParams>;
};

export const resolvePageSearchParams = async (
  searchParams?: PagePropsWithSearchParams['searchParams']
) => (searchParams ? await searchParams : undefined);
