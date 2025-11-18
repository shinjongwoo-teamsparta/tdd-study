import { expect, test } from "vitest";
import { expt } from "./expt";

test('expt', () => {
  expect(expt(2, 3)).toBe(8);
});