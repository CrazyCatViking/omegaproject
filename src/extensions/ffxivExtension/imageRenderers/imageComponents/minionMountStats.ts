import { NodeCanvasRenderingContext2D } from "canvas";
import { createGrid, createTextElement } from "../../../../utility/granvas-js";
import { AnchorPointX, AnchorPointY, IElementPosition, IGridSettings, ITextElementOptions } from "../../../../utility/granvas-js/types";

interface IMimoData {
  header: string;
  owned?: number;
  total?: number;
}

export const minionMountStats = (context: NodeCanvasRenderingContext2D, data: any) => {
  const gridSettings: IGridSettings = {
    rows: 1,
    columns: 2,
    elementBorders: {
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
    },
    elementSize: {
      width: 250,
      height: 100,
    },
  };

  console.log(data.minions, data.mounts);
  
  const gridPosition: IElementPosition = {
    x: 320,
    y: 50,
    anchorPoint: {
      x_axis: AnchorPointX.Center,
      y_axis: AnchorPointY.Top,
    },
  };

  const grid = createGrid(context, gridSettings);
  grid.position = gridPosition;

  const minionData = {
    header: 'Minions',
    owned: data.minions.ownedMinions ?? 0,
    total: data.minions.totalMinions ?? 0,
  };

  const mountData = {
    header: 'Mounts',
    owned: data.mounts.ownedMounts ?? 0,
    total: data.mounts.totalMounts ?? 0,
  };

  const minionElement = minionMountGrid(context, minionData);
  const mountElement = minionMountGrid(context, mountData);

  grid.add(minionElement, { row: 1, column: 2 });
  grid.add(mountElement, { row: 1, column: 1 });

  return grid;
};

const minionMountGrid = (context: NodeCanvasRenderingContext2D, mimoData: IMimoData) => {
  const elementSize = {
    width: 200,
    height: 50,
  };
  
  const gridSettings: IGridSettings = {
    rows: 2,
    columns: 1,
    elementBorders: {
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
    },
    elementSize,
  };

  const grid = createGrid(context, gridSettings);
  const headerText = createTextElement(context, { size: elementSize });
  const percentText = createTextElement(context, { size: elementSize });

  const textSource: ITextElementOptions = {
    font: 'serif',
    fontSize: 40,
    color: 'rgb(255, 255, 255)',
    text: '',
  };

  const minionPercent = Math.round((mimoData.owned! / mimoData.total!) * 100);

  headerText.sources = { ...textSource, text: mimoData.header };
  percentText.sources = { ...textSource, text: `${minionPercent}%`};

  grid.add(headerText, { row: 1, column: 1 });
  grid.add(percentText, { row: 2, column: 1 });

  return grid;
};