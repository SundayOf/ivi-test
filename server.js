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

// POST /run-tests: запускает тесты
app.post('/run-tests', async (req, res) => {
  console.log('Получен запрос на запуск тестов...')

  try {
    // Определяем конфигурационный файл в зависимости от окружения
    const isDocker = process.env.IS_DOCKER === 'true'
    const configFile = isDocker ? './wdio.docker.conf.ts' : './wdio.conf.ts'

    console.log(`Используется конфигурационный файл: ${configFile}`)

    // Запуск команды тестов
    const wdioCommand = spawn('npx', ['wdio', 'run', configFile], { shell: true })

    // Логи процесса
    wdioCommand.stdout.on('data', (data) => {
      console.log(`STDOUT: ${data}`)
    })

    wdioCommand.stderr.on('data', (data) => {
      console.error(`STDERR: ${data}`)
    })

    // Таймаут на выполнение тестов
    const timeout = setTimeout(() => {
      console.error('Тесты превысили таймаут, завершаем процесс.')
      wdioCommand.kill('SIGTERM') // Завершаем процесс
      res.status(500).json({ message: 'Тесты завершились по таймауту' })
    }, 300000) // 5 минут

    // Обработка завершения тестов
    wdioCommand.on('close', async (code) => {
      clearTimeout(timeout)

      if (code === 0) {
        console.log('Тесты успешно завершены, начинаем генерацию отчета.')

        // Проверка и создание директории отчета
        if (!fs.existsSync(allureReportDir)) {
          console.log(`Папка ${allureReportDir} не существует. Создаю её...`)
          fs.mkdirSync(allureReportDir, { recursive: true })
        }

        // Генерация Allure отчета
        const generateReportCommand = spawn(
          'npx',
          ['allure', 'generate', allureResultsDir, '--clean', '-o', allureReportDir],
          { shell: true }
        )

        generateReportCommand.stdout.on('data', (data) => {
          console.log(`Allure STDOUT: ${data}`)
        })

        generateReportCommand.stderr.on('data', (data) => {
          console.error(`Allure STDERR: ${data}`)
        })

        generateReportCommand.on('close', (reportCode) => {
          if (reportCode === 0) {
            console.log('Отчет успешно сгенерирован.')
            res.status(200).json({
              message: 'Тесты выполнены успешно и отчет сгенерирован.',
              reportUrl: '/allure-report'
            })
          } else {
            console.error(`Ошибка генерации отчета. Код выхода: ${reportCode}`)
            res.status(500).json({
              message: 'Тесты выполнены, но возникла ошибка при генерации отчета.'
            })
          }
        })
      } else {
        console.error(`Тесты завершились с ошибкой. Код выхода: ${code}`)
        res.status(500).json({
          message: 'Ошибка выполнения тестов.'
        })
      }
    })

    wdioCommand.on('error', (error) => {
      console.error(`Ошибка запуска процесса тестов: ${error.message}`)
      res.status(500).json({
        message: 'Ошибка запуска тестов.',
        error: error.message
      })
    })
  } catch (error) {
    console.error(`Необработанная ошибка: ${error.message}`)
    res.status(500).json({
      message: 'Произошла ошибка при обработке запроса.',
      error: error.message
    })
  }
})

// GET /: возвращает HTML-страницу
app.get('/', (req, res) => {
  res.sendFile(path.resolve('public/index.html'))
})

// Запуск сервера
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`)
})
