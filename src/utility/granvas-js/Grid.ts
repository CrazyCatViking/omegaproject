import { NodeCanvasRenderingContext2D } from 'canvas';
import BaseCanvasElement from './BaseCanvasElement';
import CanvasContainer from './CanvasContainer';
import { AnchorPointX, AnchorPointY, IElementOptions, IElementPosition, IGridPosition, IGridSettings } from './types';

export default class Grid extends CanvasContainer {
  gridSettings: IGridSettings;

  constructor(context: NodeCanvasRenderingContext2D, options: IElementOptions, gridSettings: IGridSettings) {
    super(context, options);

    this.gridSettings = gridSettings;
  }

  public renderElement(): void {
    this.elements.forEach((element: BaseCanvasElement) => {
      element.renderElement();
    });
  }

  public add(element: BaseCanvasElement, gridPosition: IGridPosition): void {
    if (element.size.height > this.gridSettings.elementSize.height) {
      console.warn('Element is too high for the container, and will overflow');
    }

    if (element.size.width > this.gridSettings.elementSize.width) {
      console.warn('Element is too wide for the container, and will overflow');
    }

    const position = this.getGridCoordinates(gridPosition);
    element.position = position;
    element.containerPosition = this.position;

    this.elements.push(element);
  }

  private getGridCoordinates({ row, column }: IGridPosition): IElementPosition {
    const { elementSize, elementBorders, rows, columns } = this.gridSettings;
    const { width, height } = elementSize;
    const { left, right, top, bottom } = elementBorders;

    if (row > rows) throw('Row index exceeded available rows');
    if (column > columns) throw('Column index exceeded available columns');

    const totalWidth = (width + left + right);
    const totalHeight = (height + top + bottom);

    const x = (totalWidth * (row - 1)) + (width / 2) + left;
    const y = (totalHeight * (column - 1)) + (height / 2) + top;

    return {
      x,
      y,
      anchorPoint: {
        x_axis: AnchorPointX.Center,
        y_axis: AnchorPointY.Center,
      },
    };
  }
}