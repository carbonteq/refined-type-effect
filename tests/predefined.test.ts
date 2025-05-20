import * as assert from "node:assert/strict";
import { describe, it } from "node:test";
import { Email, UUID, DateTime } from "@/predefined.js";
import * as z from "zod/v4";
import { Effect } from "effect";

describe("email", () => {
  it("should pass on valid email", () => {
    const eff = Email.create("test@dev.com");
    assert.doesNotThrow(() => Effect.runSync(eff));

    const result = Effect.runSync(
      Effect.match(eff, {
        onSuccess: (email) => email,
        onFailure: () => null,
      }),
    );

    assert.equal(result, "test@dev.com");
  });

  it("should fail on invalid email", () => {
    const eff = Email.create("testdev");
    assert.throws(() => Effect.runSync(eff));

    const result = Effect.runSync(
      Effect.match(eff, {
        onSuccess: (n) => n,
        onFailure: (err) => err.message,
      }),
    );

    assert.strictEqual(result, "✖ Invalid email address");
  });
});

describe("uuid", () => {
  it("should pass on valid uuid", () => {
    const uuid = crypto.randomUUID();
    const eff = UUID.create(uuid);
    assert.doesNotThrow(() => Effect.runSync(eff));

    const result = Effect.runSync(
      Effect.match(eff, {
        onSuccess: (uuid) => uuid,
        onFailure: () => null,
      }),
    );

    assert.equal(result, uuid);
  });

  it("should fail on invalid uuid", () => {
    const eff = UUID.create("abc123");
    assert.throws(() => Effect.runSync(eff));

    const result = Effect.runSync(
      Effect.match(eff, {
        onSuccess: (data) => data,
        onFailure: (err) => err.message,
      }),
    );

    assert.strictEqual(result, "✖ Invalid UUID");
  });

  it("should create valid UUID via init", () => {
    const eff = UUID.init();
    const result = z.uuid().safeParse(eff);

    assert.ok(result.success);

    assert.strictEqual(result.data, eff);
  });

  // it("should lead to valid branded type - require vitest expectType", () => {
  //     const eff = UUID.init();
  //     const result = z.uuid().safeParse(eff);
  //
  //     assert.ok(result.success);
  //
  //     assert.strictEqual(result.data, eff);
  //   });
});

describe("datetime", () => {
  it("should pass with valid date", () => {
    const dt = new Date();
    const eff = DateTime.create(dt);
    assert.doesNotThrow(() => Effect.runSync(eff));

    const result = Effect.runSync(
      Effect.match(eff, {
        onSuccess: (uuid) => uuid,
        onFailure: () => null,
      }),
    );

    assert.equal(result?.getTime(), dt.getTime());
  });

  it("should pass with valid timestamp", () => {
    const dt = Date.now();
    const eff = DateTime.create(dt);
    assert.doesNotThrow(() => Effect.runSync(eff));

    const result = Effect.runSync(
      Effect.match(eff, {
        onSuccess: (uuid) => uuid,
        onFailure: () => null,
      }),
    );

    assert.strictEqual(result?.getTime(), dt);
  });

  it("should pass with valid string timestamp", () => {
    const dt = new Date().toUTCString();
    const eff = DateTime.create(dt);
    assert.doesNotThrow(() => Effect.runSync(eff));

    const result = Effect.runSync(
      Effect.match(eff, {
        onSuccess: (uuid) => uuid,
        onFailure: () => null,
      }),
    );

    assert.strictEqual(result?.getTime(), new Date(dt).getTime());
  });

  it("should fail with invalid date", () => {
    const eff = DateTime.create("abc123");
    assert.throws(() => Effect.runSync(eff));

    const result = Effect.runSync(
      Effect.match(eff, {
        onSuccess: (data) => data,
        onFailure: (err) => err.message,
      }),
    );

    assert.strictEqual(result, "✖ Invalid input: expected date, received Date");
  });

  it("should create valid Date via now", () => {
    const eff = DateTime.now();
    const result = z.date().safeParse(eff);

    assert.ok(result.success);

    assert.strictEqual(result.data, eff);
  });
});
