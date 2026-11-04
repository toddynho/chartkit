import assert from "node:assert/strict";
import test from "node:test";
import { menuPosition } from "./menu-place.ts";

const menu = { width: 210, height: 165 };
const view = { width: 1280, height: 800 };

test("aligns the menu to the button's right edge, just below it", () => {
  const placed = menuPosition({ top: 60, right: 1260, bottom: 96, left: 1160 }, menu, view);
  assert.equal(placed.left, 1050);
  assert.equal(placed.top, 102);
});

test("flips above the button when the menu would leave the viewport", () => {
  const placed = menuPosition({ top: 700, right: 1260, bottom: 736, left: 1160 }, menu, view);
  assert.equal(placed.top, 700 - 165 - 6);
  assert.ok(placed.top + menu.height <= view.height);
});

test("shifts left so a narrow viewport still shows the whole menu", () => {
  const placed = menuPosition({ top: 80, right: 386, bottom: 112, left: 286 }, menu, { width: 390, height: 844 });
  assert.equal(placed.left, 390 - 210 - 8);
  assert.ok(placed.left >= 8);
  assert.ok(placed.left + menu.width <= 390 - 8);
});
