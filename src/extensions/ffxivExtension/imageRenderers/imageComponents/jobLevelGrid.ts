import { NodeCanvasRenderingContext2D } from "canvas";
import { createGrid, createImageElement, createTextElement } from "../../../../utility/granvas-js";
import Grid from "../../../../utility/granvas-js/Grid";
import { AnchorPointX, AnchorPointY, IElementPosition, IGridSettings, ITextElementOptions, SourceType } from "../../../../utility/granvas-js/types"
import { getJobIcon } from "../helpers";

export interface IXIVJob {
  className?: string;
  jobName?: string;
  classId?: number;
  jobId?: number;
  expLevel?: number;
  expLevelMax?: number;
  level?: number;
  specialised: boolean;
  jobUnlocked: boolean;
}

export const jobGrid = async (context: NodeCanvasRenderingContext2D, jobs: IXIVJob[]) => {
  const gridSettings: IGridSettings = {
    rows: 10,
    columns: 4,
    elementBorders: {
      top: 0,
      bottom: 10,
      right: 10,
      left: 10,
    },
    elementSize: {
      width: 100,
      height: 50,
    },
  };

  const grid = createGrid(context, gridSettings);
  const gridPosition: IElementPosition = {
    x: 320,
    y: 200,
    anchorPoint: {
      x_axis: AnchorPointX.Center,
      y_axis: AnchorPointY.Top,
    },
  };
  grid.position = gridPosition;

  const jobGridItems = await getAllJobs(context, jobs);

  let row = 1;
  let column = 1;
  jobGridItems.forEach((item: Grid) => {
    grid.add(item, { row, column });

    if (column === 4) {
      column = 1;
      row += 1;
    } else {
      column += 1;
    }
  });

  return grid;
}

const jobGridItem = async (context: NodeCanvasRenderingContext2D, job: IXIVJob) => {
  const gridSettings: IGridSettings = {
    rows: 1,
    columns: 2,
    elementBorders: {
      right: 0,
      left: 0,
      top: 0, 
      bottom: 0,
    },
    elementSize: {
      width: 50,
      height: 50,
    },
  };

  const grid = createGrid(context, gridSettings);
  const icon = createImageElement(context, {size: { width: 50, height: 50} });
  const level = createTextElement(context, { size: { width: 0, height: 0 } });

  const path = getJobIcon(job.jobName!);
  await icon.setImageSource({ path, type: SourceType.LocalSource });

  const textSources: ITextElementOptions = {
    color: 'rgb(255, 255, 255)',
    text: `${job.level}`!,
    font: 'serif',
    fontSize: 30,
  };

  level.sources = textSources;
  
  grid.add(icon, { row: 1, column: 1 });
  grid.add(level, { row: 1, column: 2 });

  return grid;
};

const getAllJobs = async (context: NodeCanvasRenderingContext2D, jobs: IXIVJob[]) => {
  // Implement sorting of jobs into the correct categories
  const jobGrids: Grid[] = [];

  await Promise.all(jobs.map(async (job: IXIVJob) => {
    const newJobGrid = await jobGridItem(context, job);
    jobGrids.push(newJobGrid);
  }));

  return jobGrids;
};