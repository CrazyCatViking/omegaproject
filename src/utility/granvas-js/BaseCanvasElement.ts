import { NodeCanvasRenderingContext2D } from 'canvas';
import { 
  AnchorPointX, 
  AnchorPointY, 
  IElementOptions, 
  IElementPosition, 
  IElementSize,
 } from './types';

const defaultPosition: IElementPosition = {
  x: 0,
  y: 0,
  anchorPoint: {
    x_axis: AnchorPointX.Left,
    y_axis: AnchorPointY.Top,
  },
};

const defaultSize: IElementSize = {
  width: 0,
  height: 0,
};

export default abstract class BaseCanvasElement {
  context: NodeCanvasRenderingContext2D;
  size: IElementSize;
  position: IElementPosition;
  containerPosition: { x: number, y: number };
  
  constructor(context: NodeCanvasRenderingContext2D, {size, position, containerPosition }: IElementOptions) {
    this.context = context;
    this.size = size ?? defaultSize;
    this.position = position ?? defaultPosition;
    this.containerPosition = containerPosition ?? { x: 0, y: 0 };
  }

  protected get relativeCoordinates(): [number, number] {
    const { x_axis, y_axis } = this.position.anchorPoint;
    const { x, y } = this.position;
    const containerX = this.containerPosition.x;
    const containerY = this.containerPosition.y;

    let _x = containerX;
    let _y = containerY;

    switch (x_axis) {
      case AnchorPointX.Left:
        _x += x;
        break;
      case AnchorPointX.Center:
        _x += x - this.size.width / 2;
        break;
      case AnchorPointX.Right: 
        _x += x - this.size.width;
        break; 
    }

    switch (y_axis) {
      case AnchorPointY.Top:
        _y += y;
        break;
      case AnchorPointY.Center:
        _y += y - this.size.height / 2;
        break;
      case AnchorPointY.Bottom: 
        _y += y - this.size.height;
        break; 
    }

    return [_x, _y];
  }

  public abstract renderElement(): void;
}