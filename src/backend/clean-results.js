import fs from 'fs'
import path from 'path'

const allureResultsDir = path.resolve('../reporters/allure-results')
const allureReportDir = path.resolve('../reporters/allure-report')

fs.rm(allureResultsDir, { recursive: true, force: true }, (err) => {
  if (err) {
    console.error(`Ошибка при очистке папки ${allureResultsDir}:`, err.message)
    process.exit(1)
  } else {
    console.log(`Папка ${allureResultsDir} успешно очищена.`)
  }
})

fs.rm(allureReportDir, { recursive: true, force: true }, (err) => {
  if (err) {
    console.error(`Ошибка при очистке папки ${allureReportDir}:`, err.message)
    process.exit(1)
  } else {
    console.log(`Папка ${allureReportDir} успешно очищена.`)
  }
})
