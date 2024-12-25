import * as dotenv from 'dotenv'
dotenv.config()

export const userLogin = process.env.TEST_USER
export const userPassword = process.env.TEST_USER_PASSWORD
export const baseUrl = process.env.TEST_SITE_URL
export const domainLogin = process.env.DOMAIN_USER
export const domainPassword = process.env.DOMAIN_USER_PASSWORD
