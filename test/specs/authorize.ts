import { browser, $ } from '@wdio/globals'
import { getXPathSelector } from 'funcs/getXPathSelector'
import { baseUrl, domainLogin, domainPassword, userLogin, userPassword } from '../env-config'
import { addStep, addFeature, addSeverity, addAttachment } from '@wdio/allure-reporter'

describe('Загрузка веб-приложения и авторизация', () => {
  it('Веб-приложение загружено и прошло авторизацию', async () => {
    addFeature('Загрузка веб-приложения и авторизация')
    addSeverity('critical')
    await loadPage()
    await loginUser()
  })
})

async function loadPage() {
  if (!baseUrl || !domainLogin || !domainPassword) {
    throw new Error('Некорректная конфигурация переменных окружения: !baseUrl || !domainLogin || !domainPassword')
  }
  await browser.maximizeWindow()

  addStep('Переход на главную страницу с аутентификацией')

  const authUrl = baseUrl.replace(
    'https://',
    `https://${encodeURIComponent(domainLogin)}:${encodeURIComponent(domainPassword)}@`
  )
  await browser.url(authUrl)
}

async function loginUser() {
  if (!userLogin || !userPassword) {
    throw new Error('Некорректная конфигурация переменных окружения: userLogin || userPassword')
  }
  addStep('Открытие меню авторизации')

  const toggleMenu = $(getXPathSelector('div', '', '', 'Вход', true))

  await toggleMenu.waitForExist({
    timeout: 10000,
    timeoutMsg: 'Меню авторизации не появилось'
  })
  await toggleMenu.waitForClickable({
    timeout: 10000,
    timeoutMsg: 'Меню авторизации недоступно для клика'
  })
  await toggleMenu.scrollIntoView({
    block: 'center',
    inline: 'nearest'
  })

  await toggleMenu.click()

  addStep('Ожидание загрузки меню авторизации')
  await browser.waitUntil(async () => (await toggleMenu.getAttribute('class')).includes('markOpenMenu'), {
    timeout: 10000,
    timeoutMsg: 'Меню авторизации не открылось'
  })

  const usernameField = $('form[class*="boxForm"] input[type="text"]')
  const passwordField = $('form[class*="boxForm"] input[placeholder="(введите пароль)"]')

  await usernameField.waitForExist({
    timeout: 10000,
    timeoutMsg: 'Поле ввода имени пользователя не найдено'
  })
  await usernameField.waitForDisplayed({
    timeout: 10000,
    timeoutMsg: 'Поле ввода имени пользователя не отображается'
  })

  addStep('Ввод имени пользователя')
  await usernameField.setValue(userLogin)

  await browser.waitUntil(async () => !(await passwordField.getAttribute('disabled')), {
    timeout: 10000,
    timeoutMsg: 'Поле ввода пароля неактивно'
  })

  addStep('Ввод пароля')
  await passwordField.setValue(userPassword)

  const loginButton = $(getXPathSelector('form', 'boxForm', 'button', 'Войти', true))

  await loginButton.waitForExist({
    timeout: 10000,
    timeoutMsg: 'Кнопка входа не найдена'
  })
  await loginButton.waitForDisplayed({
    timeout: 10000,
    timeoutMsg: 'Кнопка входа не отображается'
  })

  if (await loginButton.getAttribute('disabled')) {
    addAttachment('Ошибка', 'Кнопка входа отключена', 'text/plain')
    throw new Error('Кнопка входа отключена')
  }

  addStep('Нажатие кнопки входа')
  await loginButton.click()

  const authorized = $(getXPathSelector('div', 'userName', 'a', userLogin, true))

  addStep('Проверка авторизации пользователя')
  await authorized.waitForDisplayed({
    timeout: 10000,
    timeoutMsg: 'Авторизация не выполнена'
  })

  const logoutButton = $(getXPathSelector('div', 'logoutButton', '', '', true))
  addStep('Нажатие кнопки выхода')
  await logoutButton.waitForClickable({
    timeout: 10000,
    timeoutMsg: 'Кнопка выхода недоступна для клика'
  })
  await logoutButton.click()
}
