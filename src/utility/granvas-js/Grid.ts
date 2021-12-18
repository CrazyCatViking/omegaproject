import { NodeCanvasRenderingContext2D } from 'canvas';
import BaseCanvasElement from './BaseCanvasElement';
import CanvasContainer from './CanvasContainer';
import { AnchorPointX, AnchorPointY, IElementOptions, IElementPosition, IGridPosition, IGridSettings } from './types';

export default class Grid extends CanvasContainer {
  gridSettings: IGridSettings;

  constructor(context: NodeCanvasRenderingContext2D, gridSettings: IGridSettings) {
    super(context, { size: { width: 0, height: 0 } });
 
    this.gridSettings = gridSettings;
    this.setGridSize();
  }

  public renderElement(): void {
    this.elements.forEach((element: BaseCanvasElement) => {
      const [x, y] = this.relativeCoordinates;
      element.containerPosition = {x, y};

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

    this.elements.push(element);
  }

  private setGridSize() {
    const { elementSize, elementBorders, rows, columns } = this.gridSettings;
    const { width: _width, height: _height } = elementSize;
    const { left, right, top, bottom } = elementBorders;

    const width = (_width + left + right) * columns;
    const height = (_height + top + bottom) * rows;

    this.size = { width, height };
  }

  private getGridCoordinates({ row, column }: IGridPosition): IElementPosition {
    const { elementSize, elementBorders, rows, columns } = this.gridSettings;
    const { width, height } = elementSize;
    const { left, right, top, bottom } = elementBorders;

    if (row > rows) throw('Row index exceeded available rows');
    if (column > columns) throw('Column index exceeded available columns');

    const totalWidth = (width + left + right);
    const totalHeight = (height + top + bottom);

    const x = (totalWidth * (column - 1)) + (width / 2) + left;
    const y = (totalHeight * (row - 1)) + (height / 2) + top;

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