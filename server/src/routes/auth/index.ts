import express from 'express'
import { signinHandler, signupHandler, logoutHandler, refreshTokenHandler, googleAuthHandler } from '../../controllers/auth'
import { validate } from '../../middlewares/validate'
import { signupSchema, signinSchema, logoutSchema, refreshTokenSchema, googleAuthSchema } from '../../validators/auth.validator'

const authRouter = express.Router()

// Authentication Routes
authRouter.post('/signup', validate(signupSchema), signupHandler)
authRouter.post('/signin', validate(signinSchema), signinHandler)
authRouter.post('/google', validate(googleAuthSchema), googleAuthHandler) 
authRouter.post('/logout', validate(logoutSchema), logoutHandler)
authRouter.post('/refresh', validate(refreshTokenSchema), refreshTokenHandler)

export default authRouter
