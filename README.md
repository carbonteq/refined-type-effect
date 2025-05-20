# Carbonteq - Refined Types Utils (with Effect)

[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](https://www.typescriptlang.org/)
[![Linted with Biome](https://img.shields.io/badge/Linted_with-Biome-60a5fa?style=flat&logo=biome)](https://biomejs.dev)
[![npm version](https://img.shields.io/npm/v/@carbonteq/refined-type-effect.svg)](https://www.npmjs.com/package/@carbonteq/refined-type-effect)
[![license](https://img.shields.io/npm/l/@carbonteq/refined-type-effect.svg)](https://github.com/carbonteq/refined-type-effect/blob/main/LICENSE)


> 🛡️ Type-safe, runtime-validated, and nominally-typed primitives for TypeScript, leveraging the power of Zod and Effect.

## Overview

This library builds on the foundation established by [@carbonteq/refined-type](https://github.com/carbonteq/refined-type), enhancing it with Effect's robust error handling capabilities. It offers a comprehensive solution for creating refined and branded types that maintain both compile-time and runtime type safety in TypeScript applications.

## Usage Examples

### Basic Type Validation

```typescript
import { createRefinedType } from '@carbonteq/refined-type-effect';
import * as z from "zod/v4";
import { Effect } from 'effect';

// Define a refined type for email addresses
const Email = createRefinedType('Email', z.string().email());
type Email = typeof Email.$infer;

// Validate an email address
const validationProgram = Email.create('user@example.com').pipe(
Effect.match(validationProgram, {
  onSuccess: (email) => email,
  onFailure: (error) => (error.message),
})
);

// Run the validation
Effect.runPromise(validationProgram).then(console.log);

// Type-safe function that only accepts validated emails
function sendNotification(email: Email) {
  return Effect.succeed(`Notification sent to ${email}`);
}

// This won't compile - type safety at work
// sendNotification("not.validated@example.com"); // Error!


// Proper validation flow
const notificationProgram = Email.create('customer@example.com').pipe(
  Effect.flatMap(sendNotification)
);
```

### Custom Error Types

```typescript
import { createRefinedType, RefinedValidationError } from '@carbonteq/refined-type-effect';
import * as z from "zod/v4";
import { Effect } from "effect";


// Define custom error types
class InvalidAgeError extends RefinedValidationError {
  constructor(err: z.core.$ZodError) {
    super(err);
    this.name = "InvalidAgeError";
    this.message = "Age must be between 18 and 120 years";
  }
}

// Create a refined type with a custom error handler
const Age = createRefinedType(
  "Age",
  z.number().int().min(18).max(120),
  (data, err) => new InvalidAgeError(err),
);
type Age = typeof Age.$infer;

// Using the refined type with custom error handling
function validateUserAge(input: unknown) {
  return Age.create(input).pipe(
    Effect.match({
      onSuccess: (age) => `Age validation passed: ${age}`,
      onFailure: (error) => {
        return error.message;
      },
    }),
  );
}


// Usage examples
Effect.runPromise(validateUserAge(25)).then(console.log);
// Output: "Age validation passed: 25"

Effect.runPromise(validateUserAge(10)).then(console.log);
// Output: "Age must be between 18 and 120 years"


```

## Installation
* effect  and zod are dependencies thus need to be installed
```bash
# NPM
npm install @carbonteq/refined-type-effect effect zod

# Yarn
yarn add @carbonteq/refined-type-effect effect zod

# PNPM
pnpm add @carbonteq/refined-type-effect effect zod
```

## Requirements


- Node.js >= 18
- TypeScript >= 4.9
- Zod >= 3.25.0
- Effect >= 2.0.0

## License

MIT
