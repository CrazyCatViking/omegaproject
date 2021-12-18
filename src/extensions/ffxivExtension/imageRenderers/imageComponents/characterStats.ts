import { NodeCanvasRenderingContext2D } from "canvas";
import { createContainer, createImageElement } from "../../../../utility/granvas-js";
import { IElementOptions, SourceType } from "../../../../utility/granvas-js/types";
import { jobGrid } from "./jobLevelGrid";
import { minionMountStats } from "./minionMountStats";

export const characterStats = async (context: NodeCanvasRenderingContext2D, data: any) => {
  const options: IElementOptions = {
    size: {
      width: 640,
      height: 873,
    },
  };

  const container = createContainer(context, options);
  const statsBackround = createImageElement(context, options);

  const path = './src/extensions/ffxivExtension/resources/FFInfoBackround.png';
  const type = SourceType.LocalSource;
  await statsBackround.setImageSource({ path, type });

  const jobs = await jobGrid(context, data.jobs);
  const mimo = minionMountStats(context, data);

  container.add(statsBackround);
  container.add(jobs);
  container.add(mimo);
  
  return container;
}