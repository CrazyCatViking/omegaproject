import { NodeCanvasRenderingContext2D } from "canvas";
import { createContainer, createImageElement, createTextElement } from "../../../../utility/granvas-js";
import { AnchorPointX, AnchorPointY, IElementOptions, IElementPosition, IImageElementSource, ITextElementOptions, SourceType } from "../../../../utility/granvas-js/types";
import { getJobIcon } from "../helpers";

export const characterView = async (context: NodeCanvasRenderingContext2D, data: any) => {
  const options: IElementOptions = {
    size: {
      width: 640,
      height: 873,
    },
  };

  const jobIconOptions: IElementOptions = { 
    size: { 
      width: 100,
      height: 100 
    },
    position: {
      x: 610,
      y: 20,
      anchorPoint: {
        x_axis: AnchorPointX.Right,
        y_axis: AnchorPointY.Top,
      },
    },
  };

  const activeJob = data.jobs.find((item: any) => item.jobId === data.activeJob);

  const profileSource: IImageElementSource = { path: data.portrait, type: SourceType.WebSource };
  const jobIconSource: IImageElementSource = { path: getJobIcon(activeJob?.jobName ?? 'reaper'), type: SourceType.LocalSource };

  const container = createContainer(context, options);
  const profileImage = createImageElement(context, options);
  const activeJobIcon = createImageElement(context, jobIconOptions);

  await profileImage.setImageSource(profileSource);
  await activeJobIcon.setImageSource(jobIconSource);

  container.add(profileImage);
  container.add(activeJobIcon);

  return container;
}