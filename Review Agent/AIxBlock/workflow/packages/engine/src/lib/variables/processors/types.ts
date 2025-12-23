
/* eslint-disable @typescript-eslint/no-explicit-any */
import { PieceProperty } from 'workflow-blocks-framework'

export type ProcessorFn<INPUT = any, OUTPUT = any> = (
    property: PieceProperty,
    value: INPUT,
) => OUTPUT
