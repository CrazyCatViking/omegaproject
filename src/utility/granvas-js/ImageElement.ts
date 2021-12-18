import fetch from 'node-fetch';
import { loadImage, Image } from 'canvas';

import BaseCanvasElement from "./BaseCanvasElement";
import { IImageElementSource, SourceType } from "./types";

export default class ImageElement extends BaseCanvasElement {
  private _imageSource?: Image;

  public renderElement(): void {
    if (!this._imageSource) {
      console.warn('Skipping image, no source was specified'); // Should be traceable, throw?
      return;
    }

    const { width, height } = this.size;
    this.context.drawImage(this._imageSource, ...this.relativeCoordinates, width, height);
  }

  public async setImageSource({ path, type }: IImageElementSource)  {
    if (type === SourceType.LocalSource) this._imageSource = await this.openImage(path);
    if (type === SourceType.WebSource) this._imageSource = await this.fetchImage(path);
  }

  private async fetchImage(url: string) {
    const res = await fetch(url);
    const buffer = await res.arrayBuffer();
    
    const image = new Image();
    image.src = Buffer.from(buffer);
    return image;
  }

  private async openImage(path: string) {
    return await loadImage(path);
  }
}