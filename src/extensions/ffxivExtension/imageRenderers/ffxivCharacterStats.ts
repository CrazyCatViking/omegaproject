import { registerFont } from "canvas";
import { useGranvas } from "../../../utility/granvas-js"
import { characterStats } from "./imageComponents/characterStats";
import { characterView } from "./imageComponents/characterView";
import { characterFrame } from "./imageComponents/frame";

registerFont('assets/fonts/PTSerif-Regular.ttf', { family: 'serif' });

export const renderCharacterStats = async (data: any) => {
  const { renderImage, addElement, context } = useGranvas({ width: 1280, height: 873 });

  const characterGrid = characterFrame(context);
  const chrViewContainer = await characterView(context, data);
  const chrStatsContainer = await characterStats(context, data);
  
  addElement(characterGrid);
  characterGrid.add(chrViewContainer, { row: 1, column: 2 });
  characterGrid.add(chrStatsContainer, { row: 1, column: 1 });

  return renderImage();
}