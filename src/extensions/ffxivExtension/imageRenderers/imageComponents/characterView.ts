import { NodeCanvasRenderingContext2D } from "canvas";
import { createContainer, createImageElement, createTextElement } from "../../../../utility/granvas-js";
import { AnchorPointX, AnchorPointY, IElementOptions, IElementPosition, IImageElementSource, ITextElementOptions, SourceType } from "../../../../utility/granvas-js/types";

export const characterView = async (context: NodeCanvasRenderingContext2D, data: any) => {
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

  const imageSource: IImageElementSource = { path: data.portrait, type: SourceType.WebSource };

  const container = createContainer(context, options);
  const profileImage = createImageElement(context, options);
  const characterName = createTextElement(context);
  const characterTitle = createTextElement(context);

  characterName.position = { ...textPosition, y: 700 };
  characterTitle.position = { ...textPosition, y: 750 };
  characterName.sources = { ...textSources, text: `${data.name}`};
  characterTitle.sources = { ...textSources, text: `${data.title}`, fontSize: 30 };

  await profileImage.setImageSource(imageSource);

  container.add(profileImage);
  container.add(characterName);
  container.add(characterTitle);

  return container;
}