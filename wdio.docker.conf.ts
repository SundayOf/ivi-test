import { config as baseConfig } from './wdio.conf.ts'

export const config = {
  ...baseConfig,
  hostname: process.env.SELENIUM_HUB_HOST || 'selenium-hub',
  port: 4444,
  path: '/wd/hub',

  session: {
    browserName: 'chrome',
    'goog:chromeOptions': {
      args: ['--headless', '--disable-gpu', '--no-sandbox', '--disable-dev-shm-usage']
    }
  },

  maxInstances: 5,
  logLevel: 'info'
}
