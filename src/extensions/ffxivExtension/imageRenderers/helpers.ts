export const getJobIcon = (jobName: string) => {
  const noSpaceName = jobName.replace(' ', '');
  return `./assets/icons/ffxiv/icons/${noSpaceName}.png`;
};