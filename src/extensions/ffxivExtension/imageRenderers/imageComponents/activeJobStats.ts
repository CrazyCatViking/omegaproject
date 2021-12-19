import { NodeCanvasRenderingContext2D } from "canvas";
import { createContainer, createImageElement, createTextElement } from "../../../../utility/granvas-js";
import { AnchorPointX, AnchorPointY, IElementOptions, IElementPosition, IImageElementSource, ITextElementOptions, SourceType } from "../../../../utility/granvas-js/types";
import { getJobIcon } from "../helpers";

export const activeJobStats = async (context: NodeCanvasRenderingContext2D, data: any) => {
  const options: IElementOptions = {
    size: {
      width: 640,
      height: 873,
    },
    position: {
      x: 320,
      y: 0,
      anchorPoint: {
        x_axis: AnchorPointX.Center,
        y_axis: AnchorPointY.Top,
      },
    },
  };

  const position: IElementPosition = {
    x: 0,
    y: 70,
    anchorPoint: {
      x_axis: AnchorPointX.Left,
      y_axis: AnchorPointY.Center,
    },
  };
  
  const container = createContainer(context, options);
  const activeJobName = createTextElement(context, { position: { ...position, x: 130 } });
  const activeJobIcon = createImageElement(context, { 
    size: { width: 70, height: 70 }, position: { ...position, x: 50 } 
  });
  
  const activeJob = data.jobs.find((item: any) => item.jobId === data.activeJob);

  const textSources: ITextElementOptions = {
    color: 'rgb(255, 255, 255)',
    text: `${activeJob.jobName.toUpperCase()}`,
    font: 'serif',
    fontSize: 50,
  };

  const imageSource: IImageElementSource = {
    path: getJobIcon(activeJob.jobName),
    type: SourceType.LocalSource,
  };

  activeJobName.sources = textSources;
  await activeJobIcon.setImageSource(imageSource);

  container.add(activeJobName);
  container.add(activeJobIcon);

  return container;
}