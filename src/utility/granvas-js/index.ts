import { createCanvas } from 'canvas';
import BaseCanvasElement from './BaseCanvasElement';
import Canvas from './Canvas';
import Grid from './Grid';
import ImageElement from './ImageElement';
import TextElement from './TextElement';

import { IElementOptions, IElementSize, IGridSettings } from "./types";

export const useGranvas = (size: IElementSize) => {
  const canvas = createCanvas(size.width, size.height);
  const context = canvas.getContext('2d');

  const granvas = new Canvas(context, size);

  const renderImage = () => {
    granvas.renderElement();
    return canvas.toBuffer();
  };

  const addElement = (element: BaseCanvasElement) => {
    granvas.add(element);
  };

  const createGrid = (options: IElementOptions, gridSettings: IGridSettings) => {
    return new Grid(context, options, gridSettings);
  };

  const createImageElement = (options: IElementOptions) => {
    return new ImageElement(context, options);
  };

  const createTextElement = (options: IElementOptions) => {
    return new TextElement(context, options);
  };

  return {
    renderImage,
    addElement,
    createGrid,
    createImageElement,
    createTextElement,
  };
}