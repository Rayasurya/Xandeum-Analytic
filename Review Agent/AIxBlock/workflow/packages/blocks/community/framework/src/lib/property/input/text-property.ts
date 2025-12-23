import { Type } from "@sinclair/typebox";
import { BasePropertySchema, TPropertyValue } from "./common";
import { PropertyType } from "./property-type";


export const ShortTextProperty = Type.Composite([
    BasePropertySchema,
    TPropertyValue(Type.String(), PropertyType.SHORT_TEXT),
    Type.Object({
        supportUrlPrefix: Type.Optional(Type.Boolean()),
        supportDatasetIdPrefix: Type.Optional(Type.Boolean()),
        supportLocalPrefix: Type.Optional(Type.Boolean()),
    }),
])


export type ShortTextProperty<R extends boolean> = BasePropertySchema &
    TPropertyValue<string, PropertyType.SHORT_TEXT, R>
    & {
        supportUrlPrefix?: boolean;
        supportDatasetIdPrefix?: boolean;
        supportLocalPrefix?: boolean;
   };


export const LongTextProperty = Type.Composite([
    BasePropertySchema,
    TPropertyValue(Type.String(), PropertyType.LONG_TEXT)
])

export type LongTextProperty<R extends boolean> = BasePropertySchema &
    TPropertyValue<string, PropertyType.LONG_TEXT, R>;
