import { createCanvas, NodeCanvasRenderingContext2D } from 'canvas';
import BaseCanvasElement from './BaseCanvasElement';
import Canvas from './Canvas';
import Container from './Container';
import Grid from './Grid';
import ImageElement from './ImageElement';
import TextElement from './TextElement';

import { IElementOptions, IElementSize, IGridSettings, ITextElementOptions } from "./types";

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

  const createGrid = (gridSettings: IGridSettings) => {
    return new Grid(context, gridSettings);
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
    context,
  };
};

export const createContainer = (context: NodeCanvasRenderingContext2D, options: IElementOptions) => {
  return new Container(context, options);
};

export const createGrid = (context: NodeCanvasRenderingContext2D, gridSettings: IGridSettings) => {
  return new Grid(context, gridSettings);
};

export const createImageElement = (context: NodeCanvasRenderingContext2D, options: IElementOptions) => {
  return new ImageElement(context, options);
};

export const createTextElement = (context: NodeCanvasRenderingContext2D, options?: IElementOptions) => {
  return new TextElement(context, options);
};