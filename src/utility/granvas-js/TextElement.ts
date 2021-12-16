import { NodeCanvasRenderingContext2D } from 'canvas';

import BaseCanvasElement from "./BaseCanvasElement";
import { IElementOptions, IElementPosition, ITextElementOptions } from "./types";

const defaultSize = {
  width: 0,
  height: 0,
};

export default class ImageElement extends BaseCanvasElement {
  private _textSource?: string;
  private _fontSource?: string;
  private _textColor = 'rgb(255, 255, 255)';

  constructor(context: NodeCanvasRenderingContext2D, { position, containerPosition }: IElementOptions) {
    super(context, { size: defaultSize, position, containerPosition});
  }
  
  public renderElement(): void {
    if (!this._textSource) {
      console.warn('Skipping text, no text source was set'); // Should be traceable
      return;
    }

    if (!this._fontSource) {
      console.warn('Skipping text, no font source was set'); // Set default source?
      return;
    }

    this.context.font = this._fontSource;
    this.context.fillStyle = this._textColor;
    this.updateSize();

    this.context.fillText(this._textSource, ...this.relativeCoordinates);
  }

  public set sources({ text, font, color }: ITextElementOptions) {
    this._textSource = text;
    this._fontSource = font;
    this._textColor = color;
  }

  private updateSize() {
    if (!this._textSource) return;
    const textMetrics = this.context.measureText(this._textSource);
    const width = textMetrics.width;
    const height = textMetrics.fontBoundingBoxDescent - textMetrics.fontBoundingBoxAscent;

    this.size = { width, height };
  }
}