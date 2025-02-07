import { $, browser } from '@wdio/globals'

export async function isLoading(timeout = 15000): Promise<void> {
  await browser.waitUntil(
    async () => {
      const loadingIcon = $('div[class*="styles_waitIconEnabled"]')
      return !(await loadingIcon.isDisplayed())
    },
    {
      timeout,
      timeoutMsg: 'Загрузка не завершилась в установленное время'
    }
  )

  const errorNotification = $('.rnc__notification-container--top-right')
  if (await errorNotification.isDisplayed()) {
    const errorMessage = await $('.rnc__notification-title').getText()
    throw new Error(`Ошибка после загрузки: ${errorMessage}`)
  }

  console.log('Загрузка успешно завершена без ошибок')
}
