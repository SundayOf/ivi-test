import { config as baseConfig } from './wdio.conf.ts'

export const config: WebdriverIO.Config = {
  ...baseConfig,

  // Docker configuration
  hostname: process.env.SELENIUM_HUB_HOST || 'selenium-hub',
  port: 4444,
  path: '/wd/hub',

  // Test files and exclude patterns
  specs: ['./test/specs/**/*.ts'],
  exclude: [],

  // Capabilities configuration
  maxInstances: 5,
  capabilities: [
    {
      browserName: 'chrome',
      'goog:chromeOptions': {
        args: ['--headless', '--disable-gpu', '--no-sandbox', '--disable-dev-shm-usage']
      }
    }
  ],

  // Logging and output configuration
  logLevel: 'info',
  outputDir: './logs',

  // Timeouts
  waitforTimeout: 10000,
  connectionRetryTimeout: 120000,
  connectionRetryCount: 3,

  // Framework and reporters
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

  // Mocha options
  mochaOpts: {
    ui: 'bdd',
    timeout: 60000
  },

  // Services
  services: []

  // Hooks (add only if needed, left commented for now)
  /**
   * Hook example: before each test
   * before: function (capabilities, specs) {
   *   console.log('Starting test...');
   * },
   */
}
