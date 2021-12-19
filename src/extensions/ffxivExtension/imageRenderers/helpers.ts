export const getJobIcon = (jobName: string) => {
  const noSpaceName = jobName.replace(' ', '');
  return `./src/extensions/ffxivExtension/resources/icons/${noSpaceName}.png`;
};