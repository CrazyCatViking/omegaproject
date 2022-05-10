import { CanvasRenderingContext2D } from "canvas";
import { createGrid } from "../../../../utility/granvas-js";
import { IElementOptions, IGridSettings } from "../../../../utility/granvas-js/types";

export const characterFrame = (context: CanvasRenderingContext2D) => {
  const gridSettings: IGridSettings = {
    rows: 1,
    columns: 2,
    elementSize: {
      width: 640,
      height: 873,
    },
    elementBorders: {
      top: 0,
      bottom: 0,
      right: 0,
      left: 0,
    },
  };

  const grid = createGrid(context, gridSettings);

  return grid;
}