import { $ } from '@wdio/globals'
import { logoutUser } from './logout'

export async function isLogged(): Promise<void> {
  const authorized = $('div[class*="userName"]').$('a')
  if ((await authorized.isDisplayed()) && (await authorized.getText()) !== '') {
    await logoutUser()
  } else {
    return
  }
}
