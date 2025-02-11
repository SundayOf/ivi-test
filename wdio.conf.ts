export const config: WebdriverIO.Config = {
  runner: 'local',
  tsConfigPath: './tsconfig.json',

  specs: ['src/e2e/**/*.spec.ts'],
  exclude: [],

  maxInstances: 5,

  capabilities: [
    {
      browserName: 'chrome',
      'goog:chromeOptions': {
        args: [
          // '--headless',
          '--no-sandbox',
          '--start-maximized'
        ]
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
        enabled: true,
        showPreface: false,
        useDotNotation: true,
        showHooks: true,
        cleanStack: true,
        skipFirstLine: false,
        noColors: false,
        symbols: {
          passed: '[✔]',
          failed: '[✖]'
        }
      }
    ],
    [
      'allure',
      {
        outputDir: 'src/reporters/allure-results',
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
