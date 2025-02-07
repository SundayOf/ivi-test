import { addSeverity } from '@wdio/allure-reporter'
import { userLogin, userPassword } from '@/env-config'
import { checkIsRegistrationDisplayed, loginWithValidCredentials } from '@/funcs/login'
import { loadPage } from '@/funcs/loadPage'
import { logoutUser } from '@/funcs/logout'
import { loginWithInvalidCredentials } from '@/funcs/failedLogin'

// describe('Тестирование веб-приложения: регистрация, авторизация и выход', () => {
//   it('Должно успешно загружаться приложение, выполнять авторизацию с правильными данными и выход', async () => {
//     addSeverity('critical')
//     await loadPage()
//     await findAuthForm()
//     await loginWithValidCredentials(userLogin, userPassword)
//     await logoutUser()
//   })
// })

// describe('Тестирование авторизации при вводе неправильных данных', () => {
//   it('Должно отображать сообщение об ошибке при вводе неправильных данных', async () => {
//     addSeverity('critical')
//     await loadPage()
//     await findAuthForm()
//     await loginWithInvalidCredentials()
//   })
// })
