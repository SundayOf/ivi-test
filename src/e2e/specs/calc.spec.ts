import { browser, $, $$ } from '@wdio/globals'
import { addStep, addSeverity, addAttachment } from '@wdio/allure-reporter'
import { getXPathSelector } from 'e2e/helpers/get-xpath-selector'
import mainPage from 'e2e/page-objects/calc.page'

describe('Проверка 3D-движка', () => {
  before(async () => await mainPage.open())

  it('Типы изделий, 3D-модели и эскизы должны быть доступны', async () => {
    addSeverity('critical')

    addStep('Загрузка калькулятора')
    await loadMaster()

    addStep('Проверка типов изделий')
    await checkType()
  })
})

async function loadMaster(): Promise<void> {
  const master = $("//div[contains(@class, 'master')]")
  addStep('Ожидание отображения калькулятора')
  await master.waitForDisplayed({ timeoutMsg: 'master is not displayed' })
}

async function checkType(): Promise<void> {
  const selectTypes = $(
    '//div[contains(@class, "select") and .//label[text()="Тип изделия"]]//input[@type="text"]'
  )
  const scroll = $(
    '//div[contains(@class, "select") and .//label[text()="Тип изделия"]]//div[contains(@class, "menu")]'
  )
  const option = $(getXPathSelector('div', 'option', 'span', 'Прямая часть #', true))
  const calc = $(getXPathSelector('button', 'masterCalcButton', '', '', true))
  const calcSuccess = $(getXPathSelector('div', 'calcTextSuccess', '', '', true))
  const priceSuccess = $(getXPathSelector('div', 'priceTextSuccess', '', '', true))
  const spec =
    "//div[contains(@class, 'rowMaterial') and not(contains(@class, 'rowMaterialCaption'))]" +
    "[.//span[normalize-space(text()) != '']]"
  const characters =
    "//div[contains(@class, 'rowCharacter')]" +
    "//span[contains(@class, 'characterValue') and normalize-space(text()) != '']"
  const canvas = $("//div[contains(@class, 'canvasContainer')]//canvas")
  const draftButton = $("//span[normalize-space(text()) = 'Эскизы']")
  const draft = $("//img[contains(@class, 'draft')]")

  addStep('Ожидание отображения и кликабельности выбора типов изделий')
  await selectTypes.waitForDisplayed({ timeout: 4000, timeoutMsg: 'types is not displayed' })
  await selectTypes.waitForClickable({ timeout: 4000, timeoutMsg: 'types is not clickable' })

  addStep('Выбор опции из списка типов изделий')
  await selectTypes.click()
  await scroll.waitForDisplayed({ timeout: 4000, timeoutMsg: 'list is not displayed' })
  await option.waitForExist({ timeoutMsg: 'option is not exists' })
  await option.scrollIntoView()
  await option.click()

  addStep('Проверка кликабельности кнопки расчета')
  if (await calc.isClickable()) {
    await calc.click()
  } else {
    throw new Error('masterCalcButton is not clickable')
  }

  addStep('Ожидание данных на панели "Результат расчета"')
  await calcSuccess.waitForDisplayed({ timeout: 5000, timeoutMsg: 'calcSuccess is not displayed' })
  addStep('Ожидание данных на панели "Цена"')
  await priceSuccess.waitForDisplayed({
    timeout: 5000,
    timeoutMsg: 'priceSuccess is not displayed'
  })
  addStep('Ожидание данных на панели "Спецификация"')
  await attachFile(spec, 'spec')
  addStep('Ожидание данных на панели "Характеристики"')
  await attachFile(characters, 'characters')

  addStep('Проверка 3D-модели и эскизов')
  await canvas.waitForDisplayed({ timeout: 16000, timeoutMsg: '3d-model is not displayed' })
  const screenshotCanvas = await browser.takeScreenshot()
  addAttachment('Скриншот 3D-модели', Buffer.from(screenshotCanvas, 'base64'), 'image/png')
  await draftButton.click()
  await draft.waitForDisplayed({ timeoutMsg: 'draft is not displayed' })

  const screenshotDraft = await browser.takeScreenshot()
  addAttachment('Скриншот эскиза', Buffer.from(screenshotDraft, 'base64'), 'image/png')
}

async function attachFile(selector: string, elementName: string): Promise<void> {
  const elements = $$(selector)
  if (!(await elements.length)) throw new Error(`element ${elementName} is empty`)

  let text = []
  for (let i = 0; i < (await elements.length); i++) {
    text.push(await elements[i].getText())
  }

  const data = JSON.stringify(text, null, 2)
  addAttachment(elementName, data, 'application/json')
}
