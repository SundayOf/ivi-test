import {
  baseUrl,
  userBuyerLogin,
  userBuyerPassword,
  userManufactorLogin,
  userManufactorPassword,
  userVendorLogin,
  userVendorPassword
} from '@/env-config'
import { loginWithValidCredentials } from '@/funcs/login'
import { loadPage } from '@/funcs/loadPage'
import { addAttachment, addStep, endStep, startStep } from '@wdio/allure-reporter'
import { $, expect } from '@wdio/globals'

describe('Тестирование профиля пользователя', () => {
  it('Должно провести на ввод валидных и невалидных значений для пользователя testUserBuyer', async () => {
    await loadPage()
    // await loginWithValidCredentials(userBuyerLogin, userBuyerPassword)
    // await loginWithValidCredentials(userManufactorLogin, userManufactorPassword)
    await loginWithValidCredentials(userVendorLogin, userVendorPassword)
    await testPanels()
  })
})

export async function testPanels(): Promise<void> {
  addStep('Переходим во вкладку account/profile')
  await browser.url(baseUrl + 'account/profile')
  addStep('Проверяем наличие панелей учетных данных: Аккаунт, Пользователь, Смена пароля')
  const legendPath = (text: string) =>
    `//div[contains(@class, "account")]//legend[contains(@class, "legend") and text()="${text}"]`

  // await validateUser(legendPath('Аккаунт'))
  // await validatePassword(legendPath('Смена пароля'))
  // await validateCounterparty()
  // await checkRequisits(legendPath('Реквизиты'))
  // await checkManufactorData()
  // await editVendorData()
}

async function editVendorData(): Promise<void> {
  addStep('Переходим во вкладку "Данные поставщика"')
  const tab = $('//span[contains(@class, "orderNavItem") and text() = "Данные поставщика"]')
  await tab.click()

  addStep('Клик по кнопке "Редактировать"')
  const editBtn = $('//div[contains(@class, "tabContainer")]//button[text()="Редактировать"]')
  await editBtn.waitForDisplayed({ timeout: 3000 })
  await editBtn.click()

  addStep('меняем поле Срок выставления счёта(дни)')
  const billTerm = $('//input[@name="billTerm"]')
  await billTerm.waitForEnabled({ timeout: 3000 })
  await billTerm.setValue(10)

  addStep('Сохраняем')
  const saveBtn = $('//div[contains(@class, "screenControls")]//button[text()="Сохранить"]')
  await saveBtn.waitForEnabled({ timeout: 3000 })

  addStep('Проверяем изменение данных')
  await checkManufactorInfo('Срок выставления счёта', '10')

  addStep('Возвращаем обратно')
  await editBtn.click()

  await billTerm.waitForEnabled({ timeout: 3000 })
  await billTerm.setValue(1)

  addStep('Проверяем изменение данных')
  await checkManufactorInfo('Срок выставления счёта', '1')
}

async function checkManufactorData(): Promise<void> {
  const tab = $('//span[contains(@class, "orderNavItem") and text() = "Данные производителя"]')
  await tab.click()
  await checkManufactorInfo('Префикс конфигурации производителя', 'base')
  await checkManufactorInfo(
    'Краткое наименование производителя',
    'ОБЩЕСТВО С ОГРАНИЧЕННОЙ ОТВЕТСТВЕННОСТЬЮ "СБЫТОВАЯ КОМПАНИЯ ВЫМПЕЛ"'
  )
  await checkManufactorInfo(
    'Юридическое лицо производителя',
    'ОБЩЕСТВО С ОГРАНИЧЕННОЙ ОТВЕТСТВЕННОСТЬЮ "СБЫТОВАЯ КОМПАНИЯ ВЫМПЕЛ"'
  )
}

async function checkManufactorInfo(titleToFind: string, valueToFind: string): Promise<void> {
  startStep(`Проверка наличия данных: ${titleToFind} - ${valueToFind}`)

  const infoBlocks = await $$('//div[contains(@class, "manufactorInfo")]')

  for (const block of infoBlocks) {
    const title = await block.$('[class*="title"] span')
    const value = await block.$('[class*="text"]')

    await value.waitForDisplayed({ timeout: 1000 })

    const titleText = await title.getText()
    const valueText = await value.getText()

    if (titleText.trim() === titleToFind) {
      await expect(valueText.trim()).toEqual(valueToFind)
      addStep(`Данные найдены: ${titleToFind} - ${valueToFind}`)
      break
    }
  }

  endStep()
}

async function checkRequisits(path: string): Promise<void> {
  addStep('Проверяем наличие панели "Реквизиты"')
  const panel = $(path)
  await panel.waitForDisplayed()
  await panel.click()

  addStep('Клик по кнопке "Редактировать"')
  const editBtn = $('//button[text()="Редактировать..."]')
  await editBtn.click()
  const phone = $('//form[contains(@class, "formContent")]//input[@id="phone"]')
  addStep('Меняем одно из полей (например телефон)')
  await phone.waitForEnabled()
  await phone.setValue('+79384004411')
  addStep('Клик по кнопке "Сохранить"')
  const save = $('//button[contains(@class, "calcButton")]')
  await save.click()

  const phoneValue = $(
    "//div[contains(@class, 'rowRequisit')][div[contains(@class, 'label') and text()='Телефон']]//div[contains(@class, 'value')]"
  )
  addStep('Проверяем изменения: телефон изменился с 89110000000 на +79384004411')
  await phoneValue.waitForDisplayed()
  await expect(phoneValue).toHaveText('+79384004411')

  await editBtn.waitForClickable()
  await editBtn.click()

  addStep('Возвращаем исходные данные.')
  await phone.waitForEnabled()
  await phone.setValue('89110000000')
  await save.click()

  addStep('Проверяем изменения: телефон изменился с +79384004411 на 89110000000')
  await phoneValue.waitForDisplayed()
  await expect(phoneValue).toHaveText('89110000000')
}

async function validateCounterparty(): Promise<void> {
  const addButton = $('#add')
  const select = $('#customerType')
  const state = $('aria/Юридическое лицо')
  const inn = $('#INN')
  const kpp = $('#KPP')
  const okpo = $('#KPP')
  const companyName = $('#companyName')
  const lawAddress = $('#lawAddress')
  const factAddress = $('#factAddress')
  const flag = $('input[type="checkbox"]')
  const phone = $('//form[contains(@class, "formContent")]//input[@id="phone"]')
  const bik = $('#BIK')
  const bankName = $('#bankName')
  const corrBankAccount = $('#corrBankAccount')
  const privateBankAccount = $('#privateBankAccount')
  const save = $('//button[contains(@class, "calcButton")]')
  const invalidClass = /inputInvalid/

  await addButton.waitForClickable()
  await addButton.click()

  await select.waitForClickable()
  await select.click()

  await state.waitForDisplayed()
  await state.click()

  addStep('Ввод невалидного ИНН')
  await inn.waitForEnabled()
  await inn.setValue('7810348721')
  await expect(inn).toHaveElementClass(invalidClass)

  addStep('Ввод валидного ИНН')
  await inn.setValue('7810348720')
  await expect(kpp).not.toBe('')
  await expect(okpo).not.toBe('')
  await expect(companyName).not.toBe('')
  await expect(lawAddress).not.toBe('')
  await expect(factAddress).not.toBe('')
  await expect(flag).toBeDisplayed()
  await flag.click()
  await expect(factAddress).toBeEnabled()

  await phone.waitForEnabled()
  await phone.setValue('89110000000')

  addStep('Ввод невалидного Бик банка')
  await bik.waitForEnabled()
  await bik.setValue('000000000')
  await expect(bik).toHaveElementClass(invalidClass)

  addStep('Ввод валидного Бик банка')
  await bik.setValue('044030653')
  await expect(bankName).not.toBe('')
  await expect(corrBankAccount).not.toBe('')

  addStep('Ввод невалидного расчётного счёта банка')
  await privateBankAccount.waitForEnabled()
  await privateBankAccount.setValue('00000000000000000000')
  await expect(privateBankAccount).toHaveElementClass(invalidClass)

  addStep('Ввод валидного расчётного счёта банка')
  await privateBankAccount.setValue('40702810355130007976')

  await save.waitForEnabled({ timeout: 1000 })
  await save.click()

  const item = $('tbody tr:first-child')

  await $('table').$('aria/7810348720').waitForDisplayed({ timeout: 5000 })
  await item.click()

  const added = await browser.takeScreenshot()
  addAttachment('Контрагент сохранён', Buffer.from(added, 'base64'), 'image/png')

  const edit = $('#edit')
  addStep('Клик по кнопке "Просмотр/редактирование карточки выбранного контрагента"')
  await edit.waitForClickable({ timeout: 3000 })
  await edit.click()

  addStep('Меняем одно из полей (телефон)')
  await phone.waitForEnabled({ timeout: 1000 })
  await phone.setValue('89113245522')

  await save.waitForEnabled({ timeout: 1000 })
  await save.click()

  addStep('Проверяем, обновились ли данные')
  await $('table').$('aria/89113245522').waitForDisplayed({ timeout: 5000 })

  const edited = await browser.takeScreenshot()
  addAttachment('Контрагент отредактирован', Buffer.from(edited, 'base64'), 'image/png')

  addStep('Удаляем контрагента')
  const remove = $('#remove')
  await item.click()
  await expect(item).toHaveElementClass(/choiceAgent/)
  await remove.waitForClickable()
  await remove.click()

  const deleteBtn = $('//button[contains(@class, "removeButton")]')
  await deleteBtn.waitForClickable()
  await deleteBtn.click()

  await $('//div[contains(@class, "waitIconDisabled")]').waitForExist()
  await expect(item).not.toBeExisting()

  const deleted = await browser.takeScreenshot()
  addAttachment('Контрагент удален', Buffer.from(deleted, 'base64'), 'image/png')
}

async function validateUser(path: string): Promise<void> {
  addStep('Проверяем наличие панели Аккаунт')
  const accountLegend = $(path)
  await accountLegend.waitForDisplayed({
    timeout: 5000,
    timeoutMsg: 'account panel is not displayed'
  })
  await accountLegend.click()

  // addStep('Проверяем наличие панели Пользователь')
  // const userLegend = $(legendPath('Пользователь'))
  // await userLegend.waitForDisplayed({ timeout: 5000, timeoutMsg: 'user panel is not displayed' })
  // await userLegend.click()

  const surname = $('#surname')
  const name = $('#name')
  const secondName = $('#secondName')
  const saveBtn = $('//button[text()="Сохранить"]')

  addStep('тест на ввод невалидных значений')
  await surname.setValue('Testing')
  await name.setValue('Name')
  await secondName.setValue('secondName')
  addStep('проверяем кнопку "Сохранить" - недоступна')
  await expect(saveBtn).toBeDisabled()

  addStep('тест на ввод валидных значений, совпадающих с дефолтными')
  await surname.setValue('Тестовый')
  await name.setValue('Покупатель')
  await secondName.setValue('Первый')
  await expect(saveBtn).toBeDisabled()

  addStep('тест на ввод валидных значений, отличающихся от дефолтных')
  await surname.setValue('Тестовый')
  await name.setValue('Покупатель')
  await secondName.setValue('Второй')
  await expect(saveBtn).toBeEnabled()

  addStep('Сохраняем новые значния')
  await saveBtn.waitForClickable({
    timeout: 15000,
    timeoutMsg: 'savebtn is not clickable'
  })
  await saveBtn.click()

  await surname.waitForEnabled({
    timeout: 15000,
    timeoutMsg: 'surname is not Enabled'
  })
  await name.waitForEnabled({
    timeout: 15000,
    timeoutMsg: 'name is not Enabled'
  })
  await secondName.waitForEnabled({
    timeout: 15000,
    timeoutMsg: 'secondName is not Enabled'
  })

  addStep('Возвращаем и сохраняем исходные значения')
  await surname.setValue('Тестовый')
  await name.setValue('Покупатель')
  await secondName.setValue('Первый')

  await saveBtn.waitForClickable({
    timeout: 15000,
    timeoutMsg: 'savebtn is not clickable'
  })
  await saveBtn.click()
}

async function validatePassword(path: string): Promise<void> {
  if (!userBuyerPassword) throw new Error('userBuyerPassword undefiend')
  addStep('Проверяем наличие панели Смена пароля')
  const oldPassword = $('#oldPassword')
  const newPassword = $('#newPassword')
  const repeatNewPassord = $('#repeatNewPassord')
  const savePasswordBtn = $('//button[text()="Сменить пароль..."]')
  const regexp = new RegExp('inputInvalid')
  const errorMessage = $('.rnc__notification-title')
  const changePasswd = $(path)
  const message = $('aria/Пароль успешно изменен')
  const closeIcon = $('//span[contains(@class, "closeIcon")]')

  await changePasswd.waitForDisplayed({
    timeout: 15000,
    timeoutMsg: 'change password panel is not displayed'
  })
  await changePasswd.click()

  addStep('Проверяем на невалидность: < 8 символов')

  await oldPassword.waitForEnabled({ timeout: 5000 })
  await newPassword.waitForEnabled({ timeout: 5000 })
  await repeatNewPassord.waitForEnabled({ timeout: 5000 })

  await oldPassword.setValue('old')
  await newPassword.setValue('new')
  await repeatNewPassord.setValue('rep')
  await expect(oldPassword).toHaveElementClass(regexp)
  await expect(newPassword).toHaveElementClass(regexp)
  await expect(repeatNewPassord).toHaveElementClass(regexp)

  addStep('Ввод одинаковых Текущий и Новый пароли. Результат - невалидность поля "Новый"')

  await oldPassword.setValue(userBuyerPassword)
  await newPassword.setValue(userBuyerPassword)
  await expect(newPassword).toHaveElementClass(regexp)

  addStep('Ввод разных паролей в поля Новый и Подтвердить. Результат - невалидность поля "Новый"')
  await newPassword.setValue('NewPassword')
  await repeatNewPassord.setValue('NewPassword-1')
  await expect(repeatNewPassord).toHaveElementClass(regexp)

  addStep(
    'Ввод неверный Текущий пароль, валидные "Новый" и "Подтвердить". Результат - приходит сообщение об ошибке'
  )

  await oldPassword.setValue('wrongPassword')
  await newPassword.setValue('NewPassword-1')
  await repeatNewPassord.setValue('NewPassword-1')

  await savePasswordBtn.waitForClickable()
  await savePasswordBtn.click()

  await oldPassword.waitForEnabled({ timeout: 5000 })
  await newPassword.waitForEnabled({ timeout: 5000 })
  await repeatNewPassord.waitForEnabled({ timeout: 5000 })

  await errorMessage.waitForDisplayed({ timeout: 5000 })
  await expect(errorMessage).toHaveText('Старый пароль указан некорректно')

  addStep('Верный Текущий пароль, валидные "Новый" и "Подтвердить". Результат - пароль изменился.')
  await oldPassword.setValue(userBuyerPassword)
  await newPassword.setValue('NewPassword-1')
  await repeatNewPassord.setValue('NewPassword-1')

  await savePasswordBtn.waitForClickable()
  await savePasswordBtn.click()
  await expect(message).toHaveText('Пароль успешно изменен')
  await closeIcon.click()

  await oldPassword.waitForEnabled({ timeout: 5000 })
  await newPassword.waitForEnabled({ timeout: 5000 })
  await repeatNewPassord.waitForEnabled({ timeout: 5000 })

  addStep('Возвращаем пароль обратно')
  await oldPassword.setValue('NewPassword-1')
  await newPassword.setValue(userBuyerPassword)
  await repeatNewPassord.setValue(userBuyerPassword)

  await savePasswordBtn.waitForClickable()
  await savePasswordBtn.click()
  await expect(message).toHaveText('Пароль успешно изменен')
  await closeIcon.click()
}
