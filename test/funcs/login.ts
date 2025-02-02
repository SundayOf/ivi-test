import { $ } from '@wdio/globals'
import { getXPathSelector } from '@/funcs/getXPathSelector'
import { addStep } from '@wdio/allure-reporter'

export async function findAuthForm(): Promise<void> {
  addStep('Проверка наличия меню "Регистрация" и "Вход"')

  const registrationMenu = $(getXPathSelector('div', '', '', 'Регистрация', true))
  const loginMenu = $(getXPathSelector('div', '', '', 'Вход', true))

  await registrationMenu.waitForDisplayed({
    timeout: 6000,
    timeoutMsg: 'Меню "Регистрация" не отображается'
  })

  await loginMenu.waitForDisplayed({
    timeout: 6000,
    timeoutMsg: 'Меню "Вход" не отображается'
  })
}

export async function loginWithValidCredentials(
  userLogin: string | undefined,
  userPassword: string | undefined
): Promise<void> {
  await findAuthForm()

  if (!userLogin || !userPassword) {
    throw new Error('Некорректная конфигурация переменных окружения: userLogin || userPassword')
  }
  addStep('Попытка входа с правильными учетными данными')

  const toggleMenu = $(getXPathSelector('div', '', '', 'Вход', true))
  await toggleMenu.click()

  const usernameField = $('form[class*="boxForm"] input[type="text"]')
  const passwordField = $('form[class*="boxForm"] input[placeholder="(введите пароль)"]')
  const loginButton = $(getXPathSelector('form', 'boxForm', 'button', 'Войти', true))

  await usernameField.setValue(userLogin)
  await passwordField.setValue(userPassword)

  await loginButton.click()

  const authorized = $(getXPathSelector('div', 'userName', 'a', userLogin, true))
  await authorized.waitForDisplayed({
    timeout: 6000,
    timeoutMsg: 'Авторизация не выполнена'
  })
}
