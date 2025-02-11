import * as dotenv from 'dotenv'
dotenv.config()

export const userLogin = process.env.TEST_USER
export const userPassword = process.env.TEST_USER_PASSWORD

export const userBuyerLogin = process.env.TEST_USER_BUYER
export const userBuyerPassword = process.env.TEST_USER_BUYER_PASSWORD

export const userManufactorLogin = process.env.TEST_USER_MANUFACTOR
export const userManufactorPassword = process.env.TEST_USER_MANUFACTOR_PASSWORD

export const userVendorLogin = process.env.TEST_USER_VENDOR
export const userVendorPassword = process.env.TEST_USER_VENDOR_PASSWORD

export const baseUrl = process.env.TEST_SITE_URL || ''
export const domainLogin = process.env.DOMAIN_USER
export const domainPassword = process.env.DOMAIN_USER_PASSWORD
