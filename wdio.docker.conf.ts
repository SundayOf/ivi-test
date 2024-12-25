import { config as baseConfig } from './wdio.conf.ts'

export const config = {
  ...baseConfig,

  hostname: process.env.SELENIUM_HUB_HOST || 'selenium-hub',
  port: 4444,
  path: '/wd/hub',

  specs: ['./test/specs/**/*.ts'],
  exclude: [],

  maxInstances: 5,
  capabilities: [
    {
      browserName: 'chrome',
      'goog:chromeOptions': {
        args: ['--disable-gpu', '--no-sandbox', '--disable-dev-shm-usage']
      }
    }
  ],

  logLevel: 'info',
  outputDir: './logs',

  waitforTimeout: 10000,
  connectionRetryTimeout: 120000,
  connectionRetryCount: 3,

  framework: 'mocha',
  reporters: [
    [
      'spec',
      {
        color: true,
        showPreface: false,
        symbols: {
          passed: '[✔]',
          failed: '[✖]'
        }
      }
    ],
    [
      'allure',
      {
        outputDir: './reporters/allure-results',
        disableWebdriverScreenshots: true,
        disableWebdriverStepsReporting: false
      }
    ]
  ],

  mochaOpts: {
    ui: 'bdd',
    timeout: 60000
  },

  services: []
}
