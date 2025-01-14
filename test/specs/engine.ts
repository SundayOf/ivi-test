import { browser, $, $$ } from '@wdio/globals'
import { getXPathSelector } from 'funcs/getXPathSelector'
import { addStep, addSeverity, addAttachment } from '@wdio/allure-reporter'
import { loadPage } from './authorize'

describe('Проверка 3D-движка', () => {
  it('Типы изделий, 3D-модели и эскизы должны быть доступны', async () => {
    addSeverity('critical')

    addStep('Загрузка страницы')
    await loadPage()

    addStep('Загрузка калькулятора')
    await loadMaster()

    addStep('Проверка типов изделий')
    await checkType()
  })
})

async function loadMaster(): Promise<void> {
  const master = $('.styles_master__uFRR\\-')
  addStep('Ожидание отображения калькулятора')
  await master.waitForDisplayed({ timeoutMsg: 'master is not displayed' })
}

async function checkType(): Promise<void> {
  const select = $('.css-1f78n54-control')
  const scroll = $('.css-qr46ko')
  const option = $(getXPathSelector('div', 'option', 'span', 'Прямая часть #', true))
  const calc = $(getXPathSelector('button', 'masterCalcButton', '', '', true))
  const calcSuccess = $(getXPathSelector('div', 'calcTextSuccess', '', '', true))
  const priceSuccess = $(getXPathSelector('div', 'priceTextSuccess', '', '', true))
  const spec =
    "//div[contains(@class, 'styles_rowMaterial__oN1XI') and not(contains(@class, 'styles_rowMaterialCaption__AvbyN'))]" +
    "[.//span[normalize-space(text()) != '']]"
  const characters =
    "//div[contains(@class, 'styles_rowCharacter__JPTjX')]" +
    "//span[contains(@class, 'styles_characterValue__l92jf') and normalize-space(text()) != '']"
  const canvas = $('.styles_canvasContainer__a0jKF')
  const draftButton = $("//span[normalize-space(text()) = 'Эскизы']")
  const draft = $('.styles_draft__Ps3Im')

  addStep('Ожидание отображения и кликабельности выбора типов изделий')
  await select.waitForDisplayed({ timeout: 4000, timeoutMsg: 'types is not displayed' })
  await select.waitForClickable({ timeout: 4000, timeoutMsg: 'types is not clickable' })

  addStep('Выбор опции из списка типов изделий')
  await select.click()
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
  await priceSuccess.waitForDisplayed({ timeout: 5000, timeoutMsg: 'priceSuccess is not displayed' })
  addStep('Ожидание данных на панели "Спецификация"')
  // await spec.waitForDisplayed({ timeout: 5000, timeoutMsg: 'spec is not displayed' })
  await attachFile(spec, 'spec')
  addStep('Ожидание данных на панели "Характеристики"')
  await attachFile(characters, 'characters')

  addStep('Проверка 3D-модели и эскизов')
  await canvas.waitForDisplayed({ timeout: 16000, timeoutMsg: '3d-model is not displayed' })
  await draftButton.click()
  await draft.waitForDisplayed({ timeoutMsg: 'draft is not displayed' })

  const screenshot = await browser.takeScreenshot()
  addAttachment('Скриншот 3D-модели и эскизов', Buffer.from(screenshot, 'base64'), 'image/png')
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
