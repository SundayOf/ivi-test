/**
 * Создает XPath-селектор с учетом типа родительского элемента, вложенных элементов и текста
 * @param parentTag - тег родительского элемента
 * @param className - класс для поиска
 * @param childTag - тег вложенного элемента (опционально)
 * @param text - текст, который должен быть в вложенном элементе (опционально)
 * @param partialMatch - использовать ли частичное совпадение для класса
 * @returns строка XPath-селектора
 */
export function getXPathSelector(
  parentTag: string,
  className: string,
  childTag: string = '',
  text: string = '',
  partialMatch: boolean = false
): string {
  const classSelector = partialMatch ? `contains(@class, "${className}")` : `@class="${className}"`

  const baseXPath = `//${parentTag}[${classSelector}]`
  const childXPath = childTag ? `//${childTag}` : ''
  const textXPath = text ? `[normalize-space(text())="${text}"]` : ''

  return `${baseXPath}${childXPath}${textXPath}`
}
