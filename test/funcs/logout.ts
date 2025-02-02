import { $ } from '@wdio/globals'
import { getXPathSelector } from '@/funcs/getXPathSelector'
import { addAttachment, addStep } from '@wdio/allure-reporter'

export async function logoutUser(): Promise<void> {
  addStep('Попытка выхода из аккаунта')

  const logoutButton = $(getXPathSelector('div', 'logoutButton', '', '', true))

  await logoutButton.waitForClickable({
    timeout: 6000,
    timeoutMsg: 'Кнопка выхода недоступна для клика'
  })
  await logoutButton.click()

  const loginMenu = $(getXPathSelector('div', '', '', 'Вход', true))
  await loginMenu.waitForDisplayed({
    timeout: 6000,
    timeoutMsg: 'Кнопка "Вход" не отображается после выхода'
  })

  const screenshot = await browser.takeScreenshot()
  addAttachment('Скриншот после выхода из аккаунта', Buffer.from(screenshot, 'base64'), 'image/png')
}
