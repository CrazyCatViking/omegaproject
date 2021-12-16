import { NodeCanvasRenderingContext2D } from 'canvas';

import BaseCanvasElement from "./BaseCanvasElement";
import CanvasContainer from "./CanvasContainer";
import { IElementSize } from './types';

export default class Canvas extends CanvasContainer {
  constructor(context: NodeCanvasRenderingContext2D, size: IElementSize) {
    super(context, {size, containerPosition: { x: 0, y: 0 } });
  }

  public renderElement() {
    this.elements.forEach((element: BaseCanvasElement) => {
      element.renderElement();
    });
  }

  public add(element: BaseCanvasElement): void {
    element.containerPosition = this.position;
    this.elements.push(element);
  }
}