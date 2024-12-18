import { browser } from '@wdio/globals'

describe('Test loading', () => {
  it('should open the browser and check the title', async () => {
    await browser.url('https://webdriver.io')
    const title = await browser.getTitle()
    console.log(`Title is: ${title}`)
    await expect(title).toBe(
      'WebdriverIO · Next-gen browser and mobile automation test framework for Node.js | WebdriverIO'
    )
  })
})
