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
  private _fontSize?: number;
  private _textColor = 'rgb(255, 255, 255)';

  constructor(context: NodeCanvasRenderingContext2D, options?: IElementOptions) {
    super(context, { size: defaultSize, ...options });
  }
  
  public renderElement(): void {
    if (!this._textSource) {
      console.warn('Skipping text, no text source was set'); // Should be traceable
      return;
    }

    if (!this._fontSource || !this._fontSize) {
      console.warn('Skipping text, no font source was set'); // Set default source?
      return;
    }

    this.context.font = `${this._fontSize}px ${this._fontSource}`;
    this.context.fillStyle = this._textColor;
    this.context.textBaseline = 'top'
    this.updateSize();

    this.context.fillText(this._textSource, ...this.relativeCoordinates);
  }

  public set sources({ text, font, fontSize, color }: ITextElementOptions) {
    this._textSource = text;
    this._fontSource = font;
    this._fontSize = fontSize;
    this._textColor = color;
  }

  private updateSize() {
    if (!this._textSource || !this._fontSource || !this._fontSize) return;
    const textMetrics = this.context.measureText(this._textSource);
    const width = textMetrics.width;

    this.size = { width, height: this._fontSize };
  }
}