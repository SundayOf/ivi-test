import { $ } from '@wdio/globals'
import { addStep } from '@wdio/allure-reporter'

export async function checkRegistration(): Promise<void> {
  addStep('Проверка наличия меню "Регистрация"')
  const registrationMenu = $('div=Регистрация')
  await registrationMenu.waitForDisplayed({
    timeout: 1000,
    timeoutMsg: 'Меню "Регистрация" не отображается'
  })
}

export async function loginWithValidCredentials(
  userLogin: string | undefined,
  userPassword: string | undefined
): Promise<void> {
  if (!userLogin || !userPassword) {
    throw new Error('userLogin or userPassword is undefiend')
  }
  addStep('Попытка входа с правильными учетными данными')

  const login = $('div=Вход')
  await login.waitForDisplayed({ timeout: 5000 })
  await login.click()

  const usernameField = $('form[class*="boxForm"] input[type="text"]')
  const passwordField = $('form[class*="boxForm"] input[placeholder="(введите пароль)"]')
  const loginButton = $('form[class*="boxForm"]').$('button=Войти')

  await usernameField.setValue(userLogin)
  await passwordField.setValue(userPassword)

  await loginButton.click()

  const authorized = $('div[class*="userName"]').$('a')
  await expect(authorized).toHaveText(userLogin)
}
