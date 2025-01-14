import { browser, $ } from '@wdio/globals'
import { getXPathSelector } from 'funcs/getXPathSelector'
import { baseUrl, domainLogin, domainPassword, userLogin, userPassword } from '../env-config'
import { addStep, addSeverity, addAttachment } from '@wdio/allure-reporter'

describe('Тестирование веб-приложения: регистрация, авторизация и выход', () => {
  it('Должно успешно загружаться приложение, выполнять авторизацию с правильными данными и выход', async () => {
    addSeverity('critical')
    await loadPage()
    await verifyMenus()
    await loginWithValidCredentials()
    await logoutUser()
  })
})

describe('Тестирование авторизации при вводе неправильных данных', () => {
  it('Должно отображать сообщение об ошибке при вводе неправильных данных', async () => {
    addSeverity('critical')
    await verifyMenus()
    await loginWithInvalidCredentials()
  })
})

export async function loadPage(): Promise<void> {
  if (!baseUrl || !domainLogin || !domainPassword) {
    throw new Error('Некорректная конфигурация переменных окружения: !baseUrl || !domainLogin || !domainPassword')
  }
  await browser.maximizeWindow()

  addStep('Переход на главную страницу с аутентификацией')

  // const authUrl = baseUrl.replace(
  //   'https://',
  //   `https://${encodeURIComponent(domainLogin || '')}:${encodeURIComponent(domainPassword || '')}@`
  // )
  await browser.url(baseUrl)
}

async function verifyMenus(): Promise<void> {
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

async function loginWithValidCredentials(): Promise<void> {
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

async function loginWithInvalidCredentials(): Promise<void> {
  addStep('Попытка входа с неправильными учетными данными')

  const toggleMenu = $(getXPathSelector('div', '', '', 'Вход', true))
  await toggleMenu.click()

  const usernameField = $('form[class*="boxForm"] input[type="text"]')
  const passwordField = $('form[class*="boxForm"] input[placeholder="(введите пароль)"]')
  const loginButton = $(getXPathSelector('form', 'boxForm', 'button', 'Войти', true))

  await usernameField.setValue('wrongUser')
  await passwordField.setValue('wrongPassword')

  await loginButton.click()

  const errorMessage = $('.styles_messageContainer__H2DpK')
  await errorMessage.waitForDisplayed({
    timeout: 6000,
    timeoutMsg: 'Сообщение об ошибке не появилось'
  })
  const text = await errorMessage.getText()
  if (text !== 'Логин или пароль указаны неверно') {
    throw new Error('Ожидалось сообщение о неверных учетных данных, но было: ' + text)
  }
}

async function logoutUser(): Promise<void> {
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
