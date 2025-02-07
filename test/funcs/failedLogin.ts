import { $ } from '@wdio/globals'
import { addStep } from '@wdio/allure-reporter'
import { checkRegistration } from './login'

export async function loginWithInvalidCredentials(): Promise<void> {
  await checkRegistration()
  addStep('Попытка входа с неправильными учетными данными')

  const toggleMenu = $('div=Вход')
  await toggleMenu.click()

  const usernameField = $('form[class*="boxForm"] input[type="text"]')
  const passwordField = $('form[class*="boxForm"] input[placeholder="(введите пароль)"]')
  const loginButton = $('form[class*="boxForm"]').$('button=Войти')

  await usernameField.setValue('wrongUser')
  await passwordField.setValue('wrongPassword')

  await loginButton.click()

  const errorMessage = $(
    "//div[contains(@class, 'messageContainer')]//span[normalize-space(text()) = 'Логин или пароль указаны неверно']"
  )
  await errorMessage.waitForDisplayed({
    timeout: 6000,
    timeoutMsg: 'Сообщение об ошибке не появилось'
  })
  const text = await errorMessage.getText()
  if (text !== 'Логин или пароль указаны неверно') {
    throw new Error('Ожидалось сообщение о неверных учетных данных, но было: ' + text)
  }
}
