import { ViewOptions } from ".";
import equal from "../transformations/equal";

function getAlreadyPresentViews(
  views,
  options: ViewOptions
): ((...args: (string | number | boolean)[]) => any) | null {
  options.joins?.sort((a, b) => b.property.localeCompare(a.property));
  options.groupings?.sort((a, b) => b.property.localeCompare(a.property));
  for (const view of views) {
    if (
      view.collection === options.collection &&
      equal(view.properties, options.properties) &&
      equal(view.joins, options.joins) &&
      equal(view.groupings, options.groupings) &&
      equal(view.transformation, options.transformation)
    ) {
      return view.view;
    }
  }
  return null;
}

export { getAlreadyPresentViews };
