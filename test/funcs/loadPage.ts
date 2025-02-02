import { browser } from '@wdio/globals'
import { baseUrl, domainLogin, domainPassword } from '../env-config'
import { addStep } from '@wdio/allure-reporter'

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
