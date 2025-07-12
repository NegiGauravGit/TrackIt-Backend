import z from 'zod'

const userSchema = z.object({
  email: z.string().email(),
  password:z.string().min(6).max(10)
})
const userSignUpSchema = userSchema.extend({
  firstName:z.string().min(3),
  lastName:z.string().min(3),
})
export {userSchema,userSignUpSchema}