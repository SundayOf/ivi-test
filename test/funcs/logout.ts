import { $ } from '@wdio/globals'
import { addAttachment, addStep } from '@wdio/allure-reporter'

export async function logoutUser(): Promise<void> {
  addStep('Попытка выхода из аккаунта')
  const loginMenu = $('div=Вход')
  const logoutButton = $('div[class*="logoutButton"]')

  if (await loginMenu.isDisplayed()) {
    return
  }

  await logoutButton.waitForClickable({
    timeout: 5000,
    timeoutMsg: 'Кнопка выхода недоступна для клика'
  })
  await logoutButton.click()

  await loginMenu.waitForDisplayed({
    timeout: 5000,
    timeoutMsg: 'Кнопка "Вход" не отображается после выхода'
  })

  const screenshot = await browser.takeScreenshot()
  addAttachment('Скриншот после выхода из аккаунта', Buffer.from(screenshot, 'base64'), 'image/png')
}
