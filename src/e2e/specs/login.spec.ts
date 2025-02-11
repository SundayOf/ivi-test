import { addSeverity } from '@wdio/allure-reporter'
import { userLogin, userPassword } from 'config/env'
import LoginPage from 'e2e/page-objects/login.page'

describe('Тестирование веб-приложения: регистрация, авторизация и выход', () => {
  beforeEach(async () => {
    await LoginPage.open()
  })

  it('Должно успешно загружаться приложение, выполнять авторизацию с правильными данными и выход', async () => {
    addSeverity('critical')
    await LoginPage.checkRegistration()
    await LoginPage.login(userLogin, userPassword)
    await LoginPage.logout()
  })

  it('Должно отображать сообщение об ошибке при вводе неправильных данных', async () => {
    addSeverity('critical')
    await LoginPage.login('wrongUser', 'wrongPassword', true)
  })
})
