import { Type } from '@sinclair/typebox';
import { MarkdownVariant } from 'workflow-shared';
import { BasePropertySchema, TPropertyValue } from './common';
import { PropertyType } from './property-type';

export const MarkDownProperty = Type.Composite([
  BasePropertySchema,
  TPropertyValue(Type.Void(), PropertyType.MARKDOWN),
]);

export type MarkDownProperty = BasePropertySchema &
  TPropertyValue<
    undefined,
    PropertyType.MARKDOWN,
    false
  > & {
    variant?: MarkdownVariant;
  };
