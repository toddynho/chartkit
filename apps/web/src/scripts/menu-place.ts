export type MenuAnchor = { top: number; right: number; bottom: number; left: number };
export type MenuSize = { width: number; height: number };
export type MenuViewport = { width: number; height: number };

/** Place a menu under its button, flipping above and shifting inward so it stays on screen. */
export function menuPosition(
  anchor: MenuAnchor,
  menu: MenuSize,
  viewport: MenuViewport,
  gap = 6,
  margin = 8,
): { top: number; left: number } {
  let top = anchor.bottom + gap;
  let left = anchor.right - menu.width;
  const below = top + menu.height <= viewport.height - margin;
  if (!below) {
    const above = anchor.top - menu.height - gap;
    top = above >= margin ? above : Math.max(margin, viewport.height - menu.height - margin);
  }
  if (left + menu.width > viewport.width - margin) left = viewport.width - menu.width - margin;
  if (left < margin) left = margin;
  return { top: Math.round(top), left: Math.round(left) };
}
