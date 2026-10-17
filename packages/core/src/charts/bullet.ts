import type { ChartRenderer } from "../render";
import { renderBullet } from "../renderers/extra/bullet";

export const bullet: ChartRenderer = {
  name: "bullet",
  types: ["bullet"],
  render: renderBullet,
};
