import { ViewOptions } from ".";
import equal from "../transformations/equal";

function getAlreadyPresentViews(
  views: any,
  options: ViewOptions
): ((...args: (string | number | boolean)[]) => any) | null {
  options.joins?.sort((a, b) => b.key.localeCompare(a.key));
  options.groupings?.sort((a, b) => b.key.localeCompare(a.key));
  for (const view of views) {
    if (
      view.collection === options.collection &&
      equal(view.keys, options.keys) &&
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
