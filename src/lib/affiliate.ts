export function toAffiliateUrl(permalink: string) {
  if (!permalink) return 'https://www.mercadolibre.cl'
  const tool = import.meta.env.VITE_ML_MATT_TOOL?.trim()
  const word = import.meta.env.VITE_ML_MATT_WORD?.trim()
  const url = new URL(permalink)

  if (tool) url.searchParams.set('matt_tool', tool)
  if (word) url.searchParams.set('matt_word', word)

  return url.toString()
}
