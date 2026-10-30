import test from "node:test";
import assert from "node:assert/strict";

import { buildViewModel } from "./dashboard.js";

const member = {
  pointsThisMonth: 1_500,
  monthlyCap: 100_000,
  streakMonths: 6,
};

test("shows awarded points as a successful payment", () => {
  const view = buildViewModel(
    { pointsAwarded: 1_500, outcome: "AWARDED" },
    member,
  );

  assert.equal(view.title, "1,500 points credited");
  // Verify description and progress percentage for the AWARDED state
  assert.equal(
    view.description,
    "Your rent payment was processed successfully.",
  );
  assert.equal(view.tone, "success");
  assert.equal(view.progressPercent, 1.5);
});

test("shows a duplicate event as skipped rather than credited", () => {
  const view = buildViewModel(
    { pointsAwarded: 0, outcome: "DUPLICATE" },
    member,
  );

  assert.equal(view.title, "Duplicate event skipped");
  // Verify that the DUPLICATE state displays the skip explanation and preserves progress
  assert.equal(
    view.description,
    "This payment webhook was already processed, so no additional points were added.",
  );
  assert.equal(view.tone, "neutral");
  assert.equal(view.progressPercent, 1.5);
});

test("shows when the member has reached the monthly cap", () => {
  const view = buildViewModel(
    { pointsAwarded: 0, outcome: "CAPPED" },
    { ...member, pointsThisMonth: 100_000 },
  );

  assert.equal(view.title, "Monthly cap reached");
  // Verify that the CAPPED state displays the 100,000-point limit explanation
  assert.equal(
    view.description,
    "You've reached the 100,000-point monthly limit, so no additional points were awarded.",
  );
  assert.equal(view.tone, "warning");
  assert.equal(view.progressPercent, 100);
});
