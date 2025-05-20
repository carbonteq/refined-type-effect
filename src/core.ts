import { Effect } from "effect";
import * as z from "zod/v4";

const extend = <T, U extends Record<string, unknown>>(
  original: T,
  extensions: U,
  // @ts-expect-error
): T & U => Object.assign(original, extensions);

type Extensions<
  Schema extends z.ZodType,
  Tag extends string | symbol,
  Err extends Error,
  SchemaInput = Schema["_input"],
  SchemaOutput = Schema["_output"],
  BrandedOutput = SchemaOutput & z.core.$brand<Tag>,
> = {
  create: (data: unknown) => Effect.Effect<BrandedOutput, Err>;
  $infer: BrandedOutput;
  $inferPrimitive: SchemaOutput;
  primitive(branded: BrandedOutput): SchemaOutput;
};

type ZodBrandedWithFactory<
  Schema extends z.ZodType,
  Tag extends string | symbol,
  Err extends Error,
  SchemaInput = Schema["_input"],
  SchemaOutput = Schema["_output"],
> = z.core.$ZodBranded<Schema, Tag> &
  Extensions<Schema, Tag, Err, SchemaInput, SchemaOutput>;

export class RefinedValidationError extends Error {
  readonly zodError: z.core.$ZodError;

  constructor(err: z.core.$ZodError) {
    const msg = z.core.prettifyError(err);

    super(msg);
    this.name = "RefinedValidationError";
    this.zodError = err;
  }

  static is(e: unknown): e is RefinedValidationError {
    return e instanceof RefinedValidationError;
  }
}

const defaultFromZodErr = (_data: unknown, err: z.core.$ZodError) =>
  new RefinedValidationError(err);

export function createRefinedType<
  Tag extends string | symbol,
  Schema extends z.ZodType,
  SchemaInput = Schema["_input"],
  SchemaOutput = Schema["_output"],
>(
  _tag: Tag,
  schema: Schema,
): ZodBrandedWithFactory<
  Schema,
  Tag,
  RefinedValidationError,
  SchemaInput,
  SchemaOutput
>;
export function createRefinedType<
  Tag extends string | symbol,
  Schema extends z.ZodType,
  Err extends Error,
  SchemaInput = Schema["_input"],
  SchemaOutput = Schema["_output"],
>(
  _tag: Tag,
  schema: Schema,
  errTransformer: (data: SchemaInput, err: z.core.$ZodError) => Err,
): ZodBrandedWithFactory<Schema, Tag, Err, SchemaInput, SchemaOutput>;
export function createRefinedType<
  Tag extends string | symbol,
  Schema extends z.ZodType,
  E extends Error,
  SchemaInput = Schema["_input"],
  SchemaOutput = Schema["_output"],
>(
  tag: Tag,
  schema: Schema,
  errConst?: (data: unknown, err: z.core.$ZodError) => E,
): ZodBrandedWithFactory<Schema, Tag, E> {
  const errTransformer = errConst ?? defaultFromZodErr;

  type ExpectedBrand = SchemaOutput & z.core.$brand<Tag>;
  const branded = schema.brand<Tag>();

  const factory = (data: unknown): Effect.Effect<ExpectedBrand, E> => {
    const res = branded.safeParse(data);

    if (res.success) return Effect.succeed(res.data as ExpectedBrand);
    const err = errTransformer(data, res.error) as E;
    return Effect.fail(err);
  };

  const extensions: Extensions<Schema, Tag, E, SchemaInput, SchemaOutput> = {
    create: factory,
    //@ts-expect-error
    $infer: tag,
    //@ts-expect-error
    $inferPrimitive: tag,

    primitive(branded) {
      return branded;
    },
  };
  const finalBranded = extend(branded, extensions);

  //@ts-expect-error
  return finalBranded;
}

export type Unbrand<T> = T extends z.ZodType<unknown, infer U> ? U : T;
