import { NodeCanvasRenderingContext2D } from 'canvas';

import BaseCanvasElement from "./BaseCanvasElement";
import CanvasContainer from "./CanvasContainer";
import { IElementOptions } from './types';

export default class Canvas extends CanvasContainer {
  constructor(context: NodeCanvasRenderingContext2D, options: IElementOptions) {
    super(context, options);
  }

  public renderElement() {
    this.elements.forEach((element: BaseCanvasElement) => {
      const [x, y] = this.relativeCoordinates;
      element.containerPosition = {x, y};

      element.renderElement();
    });
  }

  public add(element: BaseCanvasElement): void {
    this.elements.push(element);
  }
}