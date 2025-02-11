import { browser } from '@wdio/globals'
import { $ } from '@wdio/globals'
import { baseUrl } from 'config/env'

export default class BasePage {
  open(path: string = baseUrl) {
    if (!baseUrl) throw new Error('baseUrl.env is undefiend')
    return browser.url(path)
  }

  async waitForElement(selector: string, timeout: number = 5000) {
    const element = $(selector)
    await element.waitForDisplayed({ timeout })
  }
}
