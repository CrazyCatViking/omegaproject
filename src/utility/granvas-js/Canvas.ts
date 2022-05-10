import { CanvasRenderingContext2D } from 'canvas';

import BaseCanvasElement from "./BaseCanvasElement";
import CanvasContainer from "./CanvasContainer";
import { IElementSize } from './types';

export default class Canvas extends CanvasContainer {
  constructor(context: CanvasRenderingContext2D, size: IElementSize) {
    super(context, {size, containerPosition: { x: 0, y: 0 } });
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