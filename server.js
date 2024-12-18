import express from 'express'
import bodyParser from 'body-parser'
import { exec as execCallback } from 'child_process'
import fs from 'fs'
import path from 'path'
import { promisify } from 'util'

const app = express()
const port = 4000

const allureResultsDir = path.resolve('./reporters/allure-results')
const allureReportDir = path.resolve('./reporters/allure-report')

const exec = promisify(execCallback)

app.use(bodyParser.json())
app.use(express.static('public'))
app.use('/allure-report', express.static(allureReportDir))

app.post('/run-tests', async (req, res) => {
  res.setHeader('Content-Type', 'application/json')
  console.log('Получен запрос на запуск тестов...')

  try {
    const wdioCommand = `npx wdio run ./wdio.conf.js`
    const { stdout, stderr } = await exec(wdioCommand)

    console.log(stdout)
    if (stderr) {
      console.error(stderr)
    }

    if (!fs.existsSync(allureReportDir)) {
      console.log(`Папка ${allureReportDir} не существует. Создаю её...`)
      fs.mkdirSync(allureReportDir, { recursive: true })
    }

    const generateReportCommand = `npx allure generate ${allureResultsDir} --clean -o ${allureReportDir}`
    const reportResult = await exec(generateReportCommand)

    console.log(reportResult.stdout)
    res.status(200).json({ message: 'Тесты успешно выполнены и отчет сгенерирован', reportUrl: '/allure-report' })
  } catch (error) {
    console.error(`Ошибка: ${error.message}`)
    res
      .status(500)
      .json({ message: 'Произошла ошибка при выполнении тестов или генерации отчета', error: error.message })
  }
})

app.get('/', (req, res) => {
  res.sendFile(path.resolve('public/index.html'))
})

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`)
})
