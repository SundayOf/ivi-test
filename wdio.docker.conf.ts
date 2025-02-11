import { config as baseConfig } from './wdio.conf.ts'

export const config: WebdriverIO.Config = {
  ...baseConfig,

  hostname: process.env.SELENIUM_HUB_HOST || 'selenium-hub',
  port: 4444,
  path: '/wd/hub',
  reporters: [['spec', { enabled: false }]],
  logLevel: 'silent',
  maxInstances: 2,
  capabilities: [
    {
      browserName: 'chrome',
      'goog:chromeOptions': {
        args: [
          '--headless',
          '--disable-gpu',
          '--no-sandbox',
          '--disable-dev-shm-usage',
          '--disable-software-rasterizer',
          '--start-maximized'
        ]
      }
    }
  ]
}
