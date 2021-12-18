export enum AnchorPointX {
  Left,
  Right,
  Center,
}

export enum AnchorPointY {
  Top,
  Bottom,
  Center,
}

export enum SourceType {
  WebSource,
  LocalSource,
}

export interface IAnchorPoint {
  x_axis: AnchorPointX;
  y_axis: AnchorPointY;
}

export interface IElementSize {
  height: number;
  width: number;
}

export interface IElementPosition {
  x: number;
  y: number;
  anchorPoint: IAnchorPoint;
}

export interface IElementOptions {
  size: IElementSize;
  position?: IElementPosition;
  containerPosition?: { x: number, y: number };
}

export interface IImageElementSource {
  path: string;
  type: SourceType;
}

export interface ITextElementOptions {
  text: string;
  font: string;
  fontSize: number;
  color: string;
}

export interface IGridSettings {
  rows: number;
  columns: number;
  elementSize: IGridElementSize;
  elementBorders: IGridElementBorder;
}

export interface IGridElementSize {
  width: number;
  height: number;
}

export interface IGridElementBorder {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

export interface IGridPosition {
  row: number;
  column: number;
}