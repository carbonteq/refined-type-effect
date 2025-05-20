import * as assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createRefinedType } from "@/core.js";
import { Effect } from "effect";
import * as z from "zod/v4";

describe("test creation and validation", () => {
  const PositiveNum = createRefinedType("PositiveNum", z.number().positive());

  it("should pass on positive numbers", () => {
    const eff = PositiveNum.create(1);
    assert.doesNotThrow(() => Effect.runSync(eff));

    const result = Effect.runSync(
      Effect.match(eff, {
        onSuccess: (n) => n,
        onFailure: () => null,
      }),
    );

    assert.equal(result, 1);
  });

  it("should fail on negative number", () => {
    const eff = PositiveNum.create(-1);
    assert.throws(() => Effect.runSync(eff));

    const result = Effect.runSync(
      Effect.match(eff, {
        onSuccess: (n) => n,
        onFailure: (err) => err.message,
      }),
    );

    assert.strictEqual(result, "✖ Too small: expected number to be >0");
  });
});
