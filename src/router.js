import express from 'express'
import login from './auth/login.js'
import register from './auth/register.js'
import verifyEmail from './auth/verifyEmail.js'
import refreshToken from './auth/refreshToken.js'

const router = new express.Router()

router.post('/register',register)
router.post('/verify-email',verifyEmail)        
router.post('/login',login)
router.post('/refresh-token',refreshToken)
router.post('/reset-password')

export default router
