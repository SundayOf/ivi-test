import BasePage from './base.page'
import { $, expect } from '@wdio/globals'
import { addAttachment, addStep } from '@wdio/allure-reporter'
import { waitForLoading } from 'e2e/helpers/wait-for-loading'

class LoginPage extends BasePage {
  get loginDiv() {
    return $('div=Вход')
  }
  get loginForm() {
    return $('form[class*="boxForm"]')
  }
  get usernameField() {
    return this.loginForm.$('input[placeholder="(логин/e-mail)"]')
  }
  get passwordField() {
    return this.loginForm.$('input[placeholder="(введите пароль)"]')
  }
  get loginButton() {
    return this.loginForm.$('button=Войти')
  }
  get logoutButton() {
    return $('div[class*="logoutButton"]')
  }
  get errorMessage() {
    return $('#popup-root').$('div[class*="messageContainer"]').$('span')
  }
  get authorizedUser() {
    return $('div[class*="userName"]').$('a')
  }

  async login(
    userLogin: string | undefined,
    userPassword: string | undefined,
    expectError: boolean = false
  ): Promise<void> {
    if (!userLogin || !userPassword) {
      throw new Error('userLogin or userPassword is undefined')
    }

    await waitForLoading()
    addStep('Попытка входа с учетными данными')

    await this.loginDiv.waitForDisplayed({ timeout: 5000 })
    await this.loginDiv.click()

    await this.usernameField.setValue(userLogin)
    await this.passwordField.setValue(userPassword)
    await this.loginButton.click()

    if (expectError) {
      await this.errorMessage.waitForDisplayed({
        timeout: 6000,
        timeoutMsg: 'Сообщение об ошибке не появилось'
      })
      const text = await this.errorMessage.getText()
      if (text !== 'Логин или пароль указаны неверно') {
        throw new Error('Ожидалось сообщение о неверных учетных данных, но было: ' + text)
      }
    } else {
      await expect(this.authorizedUser).toHaveText(userLogin)
    }
  }

  async logout(): Promise<void> {
    addStep('Проверка: авторизован или нет')
    const isLogged = await this.isLogged()
    if (!isLogged) {
      return
    }

    await this.logoutButton.waitForClickable({
      timeout: 5000,
      timeoutMsg: 'Кнопка выхода недоступна для клика'
    })
    addStep('Клик на кнопку выхода')
    await this.logoutButton.click()

    await browser.takeScreenshot()

    await this.loginDiv.waitForExist({
      timeout: 5000,
      timeoutMsg: 'Кнопка "Вход" не отображается после выхода'
    })

    const screenshot = await browser.takeScreenshot()
    addAttachment(
      'Скриншот после выхода из аккаунта',
      Buffer.from(screenshot, 'base64'),
      'image/png'
    )
  }

  async checkRegistration(): Promise<void> {
    addStep('Проверка наличия меню "Регистрация"')
    await this.waitForElement('div=Регистрация', 1000)
  }

  async isLogged(): Promise<boolean> {
    if ((await this.authorizedUser.isDisplayed()) && (await this.authorizedUser.getText()) !== '') {
      return true
    }
    return false
  }
}

export default new LoginPage()
