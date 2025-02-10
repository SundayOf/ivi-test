import express from 'express'
import bodyParser from 'body-parser'
import { spawn } from 'child_process'
import fs from 'fs'
import path from 'path'

const app = express()
const port = 4000

const allureResultsDir = path.resolve('./reporters/allure-results')
const allureReportDir = path.resolve('./reporters/allure-report')

app.use(bodyParser.json())
app.use(express.static('public'))
app.use('/allure-report', express.static(allureReportDir))

app.post('/run-tests', async (req, res) => {
  console.log('Получен запрос на запуск тестов...')

  try {
    const isDocker = process.env.IS_DOCKER === 'true'
    const configFile = isDocker ? './wdio.docker.conf.ts' : './wdio.conf.ts'

    console.log(`Используется конфигурационный файл: ${configFile}`)

    const wdioCommand = spawn('npx', ['wdio', 'run', configFile], { shell: true })

    wdioCommand.stdout.on('data', (data) => {
      console.log(`STDOUT: ${data}`)
    })

    wdioCommand.stderr.on('data', (data) => {
      console.error(`STDERR: ${data}`)
    })

    const timeout = setTimeout(() => {
      console.error('Тесты превысили таймаут, завершаем процесс.')
      wdioCommand.kill('SIGTERM')
      res.status(500).json({ message: 'Тесты завершились по таймауту' })
    }, 300000)

    wdioCommand.on('close', async (code) => {
      clearTimeout(timeout)
      const message =
        code === 0 ? 'Тесты выполнены успешно' : `Ошибка выполнения тестов (код: ${code})`
      console.log(message)
      generateAllureReport(res, message)
    })

    wdioCommand.on('error', (error) => {
      console.error(`Ошибка запуска процесса тестов: ${error.message}`)
      generateAllureReport(res, 'Ошибка запуска тестов')
    })
  } catch (error) {
    console.error(`Необработанная ошибка: ${error.message}`)
    res.status(500).json({
      message: 'Произошла ошибка при обработке запроса.',
      error: error.message
    })
  }
})

const generateAllureReport = (res, testMessage) => {
  console.log('Генерация отчета Allure...')

  if (!fs.existsSync(allureReportDir)) {
    console.log(`Папка ${allureReportDir} не существует. Создаю её...`)
    fs.mkdirSync(allureReportDir, { recursive: true })
  }

  const generateReportCommand = spawn(
    'npx',
    ['allure', 'generate', allureResultsDir, '--clean', '-o', allureReportDir],
    { shell: true }
  )

  generateReportCommand.stdout.on('data', (data) => console.log(`Allure STDOUT: ${data}`))
  generateReportCommand.stderr.on('data', (data) => console.error(`Allure STDERR: ${data}`))

  generateReportCommand.on('close', (reportCode) => {
    if (reportCode === 0) {
      console.log('Отчет Allure успешно сгенерирован.')
      res.status(200).json({
        message: `${testMessage}. Отчет сгенерирован.`,
        reportUrl: '/allure-report'
      })
    } else {
      console.error(`Ошибка генерации отчета. Код выхода: ${reportCode}`)
      res.status(500).json({
        message: `${testMessage}. Ошибка при генерации отчета.`
      })
    }
  })
}

app.get('/', (req, res) => {
  res.sendFile(path.resolve('public/index.html'))
})

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`)
})
