export const isFreeDomain = (domain: string) => {
  if (!domain || typeof domain !== 'string') return false;

  const freeDomains = ['lightning.space', 'dev.lightning.space', 'DFX.swiss', 'api.dfx.swiss'];
  return freeDomains.includes(domain.toLowerCase());
};
