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
import { isLogged } from '@/funcs/isLogged'
import { loadPage } from '@/funcs/loadPage'
import { isLoading } from '@/funcs/isLoading'
import { addAttachment, addStep, endStep, startStep } from '@wdio/allure-reporter'
import { $, expect } from '@wdio/globals'
import { Key } from 'webdriverio'

type TRole = 'buyer' | 'manufactor' | 'vendor'

describe('Тестирование пользователей', () => {
  it('Должно провести на ввод валидных и невалидных значений для пользователя testUserBuyer', async () => {
    await loadPage()
    await loginWithValidCredentials(userBuyerLogin, userBuyerPassword)
    await testAccountPanels('buyer')
  })
  it('Должно провести на ввод валидных и невалидных значений для пользователя testUserManufactor', async () => {
    await isLogged()
    await loadPage()
    await loginWithValidCredentials(userManufactorLogin, userManufactorPassword)
    await testAccountPanels('manufactor')
  })
  it('Должно провести на ввод валидных и невалидных значений для пользователя testUserVendor', async () => {
    await isLogged()
    await loadPage()
    await loginWithValidCredentials(userVendorLogin, userVendorPassword)
    await testAccountPanels('vendor')
  })
})

export async function testAccountPanels(role: TRole): Promise<void> {
  if (!userBuyerPassword || !userManufactorPassword || !userVendorPassword) {
    throw new Error(
      'password is undefiend: !userBuyerPassword || !userManufactorPassword || !userVendorPassword'
    )
  }
  const userPasswords = {
    buyer: userBuyerPassword,
    manufactor: userManufactorPassword,
    vendor: userVendorPassword
  }
  addStep('Переходим во вкладку account/profile')
  await browser.url(baseUrl + 'account/profile')
  addStep('Проверяем наличие панелей учетных данных: Аккаунт, Пользователь, Смена пароля')

  await validateUser()
  await validatePassword(userPasswords[role])
  await validateCounterparty()

  if (role !== 'buyer') {
    await checkRequisits()
    if (role === 'manufactor') await checkManufactorData()
    if (role === 'vendor') await checkVendorData()
  }
}

async function toggleAccountPanel(label: string): Promise<void> {
  const legend = $('div[class*="account"]').$(`legend=${label}`)
  const arrow = legend.$('span[class*="sectionIcon"]')
  const classList = await arrow.getAttribute('class')

  if (classList.includes('close')) {
    await legend.click()
    await expect(arrow).toHaveElementClass(/open/)
  }
}

async function accountTabClick(text: string): Promise<void> {
  addStep(`Переходим во вкладку "${text}"`)
  const tab = $(`//span[contains(@class, "orderNavItem") and text()="${text}"]`)
  await tab.click()
}

async function checkVendorData(): Promise<void> {
  await accountTabClick('Данные поставщика')

  await isLoading()

  addStep('Клик по кнопке "Редактировать"')
  const editBtn = $('//div[contains(@class, "tabContainer")]//button[text()="Редактировать"]')
  await editBtn.waitForDisplayed()
  await editBtn.click()

  addStep('меняем поле Срок выставления счёта(дни)')
  const billTerm = $('//input[@name="billTerm"]')
  await billTerm.waitForEnabled()
  await billTerm.setValue(5)

  addStep('Сохраняем')
  const saveBtn = $('//div[contains(@class, "screenControls")]//button[text()="Сохранить"]')
  await saveBtn.waitForEnabled()
  await saveBtn.click()

  await isLoading()

  addStep('Проверяем изменение данных')
  await checkManufactorInfo('Срок выставления счёта', '5')

  addStep('Возвращаем обратно')
  await editBtn.click()

  await billTerm.waitForEnabled()
  await billTerm.setValue(1)

  await saveBtn.waitForEnabled()
  await saveBtn.click()

  await isLoading()

  addStep('Проверяем изменение данных')
  await checkManufactorInfo('Срок выставления счёта', '1')
}

async function checkManufactorData(): Promise<void> {
  await accountTabClick('Данные производителя')
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

    await value.waitForDisplayed({ timeout: 5000 })

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

async function checkRequisits(): Promise<void> {
  addStep('Проверяем наличие панели "Реквизиты"')
  toggleAccountPanel('Реквизиты')

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

  await isLoading()

  const phoneValue = $(
    "//div[contains(@class, 'rowRequisit')][div[contains(@class, 'label') and text()='Телефон']]//div[contains(@class, 'value')]"
  )
  addStep('Проверяем изменения: телефон изменился с 89110000000 на +79384004411')
  await phoneValue.waitForDisplayed()
  await expect(phoneValue).toHaveText('+79384004411')

  await editBtn.waitForClickable()
  await editBtn.click()

  await isLoading()

  addStep('Возвращаем исходные данные.')
  await phone.waitForEnabled()
  await phone.setValue('89110000000')
  await save.click()

  await isLoading()

  addStep('Проверяем изменения: телефон изменился с +79384004411 на 89110000000')
  await phoneValue.waitForDisplayed()
  await expect(phoneValue).toHaveText('89110000000')
}

async function validateCounterparty(): Promise<void> {
  const root = $('#popup-root')
  const addButton = $('#add')
  const select = $('div[class*="control"]:has(input#customerType)')
  const state = select.$('aria/Юридическое лицо')
  const inn = $('#INN')
  const kpp = $('#KPP')
  const okpo = $('#KPP')
  const companyName = $('#companyName')
  const lawAddress = $('#lawAddress')
  const factAddress = $('#factAddress')
  const flag = root.$('div').$('input[type="checkbox"]')
  const phone = $('form[class*="formContent"]').$('input#phone')
  const bik = $('#BIK')
  const bankName = $('#bankName')
  const corrBankAccount = $('#corrBankAccount')
  const privateBankAccount = $('#privateBankAccount')
  const save = $('button[class*="calcButton"]')
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
  await flag.waitForEnabled({ timeout: 3000 })
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

  await save.waitForEnabled()
  await save.click()

  await isLoading()

  const item = $('tbody tr:first-child')

  await $('table').$('aria/7810348720').waitForDisplayed()
  await item.click()

  const added = await browser.takeScreenshot()
  addAttachment('Контрагент сохранён', Buffer.from(added, 'base64'), 'image/png')

  const edit = $('#edit')
  addStep('Клик по кнопке "Просмотр/редактирование карточки выбранного контрагента"')
  await edit.waitForClickable()
  await edit.click()

  addStep('Меняем одно из полей (телефон)')
  await phone.waitForEnabled()
  await phone.setValue('89113245522')

  await save.waitForEnabled()
  await save.click()

  await isLoading()

  addStep('Проверяем, обновились ли данные')
  await $('table').$('aria/89113245522').waitForDisplayed()

  const edited = await browser.takeScreenshot()
  addAttachment('Контрагент отредактирован', Buffer.from(edited, 'base64'), 'image/png')

  addStep('Удаляем контрагента')
  const remove = $('#remove')
  await item.click()
  await expect(item).toHaveElementClass(/choiceAgent/)
  await remove.waitForClickable()
  await remove.click()

  const deleteBtn = $('button[class*="removeButton"]')
  await deleteBtn.waitForClickable()
  await deleteBtn.click()

  await isLoading()

  const deleted = await browser.takeScreenshot()
  addAttachment('Контрагент удален', Buffer.from(deleted, 'base64'), 'image/png')
}

async function validateUser(): Promise<void> {
  addStep('Проверяем наличие панели Аккаунт')
  await toggleAccountPanel('Аккаунт')

  const surname = $('#surname')
  const name = $('#name')
  const secondName = $('#secondName')
  const saveBtn = $$("button[class*='accountButton']")[2]
  const popup = $('div[class*="popupContainer"]')
  const root = $('#popup-root')
  const saveAgreement = popup.$('//button[contains(@class, "calcButton") and text()="Принять"]')

  const defaultSurname = await surname.getValue()
  const defaultName = await name.getValue()
  const defaultSecondName = await secondName.getValue()

  addStep('тест на ввод невалидных значений')
  await surname.setValue('Surname')
  await name.setValue('Name')
  await secondName.setValue('SecondName')
  addStep('проверяем кнопку "Сохранить" - недоступна')
  await expect(saveBtn).toBeDisabled()

  addStep('тест на ввод валидных значений, совпадающих с дефолтными')
  await surname.setValue(defaultSurname)
  await name.setValue(defaultName)
  await secondName.setValue(defaultSecondName)
  await expect(saveBtn).toBeDisabled()

  addStep('тест на ввод валидных значений, отличающихся от дефолтных')
  await surname.setValue(defaultName)
  await name.setValue(defaultSecondName)
  await secondName.setValue(defaultSurname)
  await expect(saveBtn).toBeEnabled()

  addStep('Сохраняем новые значния, принимая Пользовательское соглашение')
  await saveBtn.click()
  await expect(root).toHaveChildren()
  await browser.keys([Key.Tab])
  await saveAgreement.waitForEnabled()
  await saveAgreement.click()

  await isLoading()

  await surname.waitForEnabled({ timeout: 5000 })
  await name.waitForEnabled({ timeout: 5000 })
  await secondName.waitForEnabled({ timeout: 5000 })

  await surname.clearValue()
  await name.clearValue()
  await secondName.clearValue()

  addStep('Возвращаем и сохраняем исходные значения')
  await surname.setValue(defaultSurname)
  await name.setValue(defaultName)
  await secondName.setValue(defaultSecondName)
  await saveBtn.waitForEnabled({ timeout: 6000 })
  await saveBtn.click()

  await isLoading()

  await expect(root).toHaveChildren()
  await browser.keys([Key.Tab])
  await saveAgreement.waitForEnabled()
  await saveAgreement.click()

  await isLoading()

  await Promise.all([
    await expect(surname).toHaveValue(defaultSurname),
    await expect(name).toHaveValue(defaultName),
    await expect(secondName).toHaveValue(defaultSecondName)
  ])

  await browser.takeScreenshot()
}

async function validatePassword(userPassword: string): Promise<void> {
  if (!userPassword) throw new Error('userBuyerPassword undefiend')
  await toggleAccountPanel('Смена пароля')

  addStep('Проверяем наличие панели Смена пароля')
  const oldPassword = $('#oldPassword')
  const newPassword = $('#newPassword')
  const repeatNewPassord = $('#repeatNewPassord')
  const savePasswordBtn = $('//button[text()="Сменить пароль..."]')
  const regexp = new RegExp('inputInvalid')
  const errorMessage = $('.rnc__notification-title')
  const message = $('aria/Пароль успешно изменен')
  const closeIcon = $('//span[contains(@class, "closeIcon")]')

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

  await oldPassword.setValue(userPassword)
  await newPassword.setValue(userPassword)
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
  await oldPassword.setValue(userPassword)
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
  await newPassword.setValue(userPassword)
  await repeatNewPassord.setValue(userPassword)

  await savePasswordBtn.waitForClickable()
  await savePasswordBtn.click()
  await expect(message).toHaveText('Пароль успешно изменен')
  await closeIcon.click()
}
