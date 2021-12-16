import { NodeCanvasRenderingContext2D } from "canvas";
import BaseCanvasElement from "./BaseCanvasElement";
import { IElementOptions } from "./types";

export default abstract class CanvasContainer extends BaseCanvasElement {
  elements: BaseCanvasElement[];

  constructor(context: NodeCanvasRenderingContext2D, options: IElementOptions) {
    super(context, options);
    this.elements = [];
  }
}