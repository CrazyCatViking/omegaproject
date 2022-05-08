import { NodeCanvasRenderingContext2D } from "canvas";
import { createContainer, createImageElement, createTextElement } from "../../../../utility/granvas-js";
import { AnchorPointX, AnchorPointY, IElementOptions, IElementPosition, ITextElementOptions, SourceType } from "../../../../utility/granvas-js/types";
import { jobGrid } from "./jobLevelGrid";
import { minionMountStats } from "./minionMountStats";

export const characterStats = async (context: NodeCanvasRenderingContext2D, data: any) => {
  const options: IElementOptions = {
    size: {
      width: 640,
      height: 873,
    },
  };

  const textPosition: IElementPosition = {
    x: 320,
    y: 0,
    anchorPoint: {
      x_axis: AnchorPointX.Center,
      y_axis: AnchorPointY.Top,
    },
  };

  const textSources: ITextElementOptions = {
    text: '',
    font: 'serif',
    fontSize: 50,
    color: 'rgb(255, 255, 255)',
  };

  const container = createContainer(context, options);
  const statsBackround = createImageElement(context, options);

  const path = './assets/icons/ffxiv/FFInfoBackround.png';
  const type = SourceType.LocalSource;
  await statsBackround.setImageSource({ path, type });

  // const activeJob = await activeJobStats(context, data);
  const jobs = await jobGrid(context, data.jobs);
  const mimo = minionMountStats(context, data);

  const characterName = createTextElement(context);
  const characterTitle = createTextElement(context);

  characterName.position = { ...textPosition, y: 50 };
  characterTitle.position = { ...textPosition, y: 110 };
  characterName.sources = { ...textSources, text: `${data.name}`};
  characterTitle.sources = { ...textSources, text: `${data.title}`, fontSize: 30 };

  container.add(statsBackround);
  // container.add(activeJob),
  container.add(jobs);
  container.add(mimo);
  container.add(characterName);
  container.add(characterTitle);

  
  return container;
}