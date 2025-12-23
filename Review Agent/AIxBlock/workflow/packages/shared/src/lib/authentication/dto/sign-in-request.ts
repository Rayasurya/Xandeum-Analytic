import { Static, Type } from '@sinclair/typebox'
import { PasswordType } from '../../user/user'

export const SignInRequest = Type.Object({
    email: Type.String(),
    password: PasswordType,
})

export type SignInRequest = Static<typeof SignInRequest>
