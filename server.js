import express from 'express'
import bodyParser from 'body-parser'
import { exec } from 'child_process'
import fs from 'fs'
import path from 'path'

const app = express()
const port = 4000

const allureResultsDir = path.resolve('./reporters/allure-results')
const allureReportDir = path.resolve('./reporters/allure-report')

app.use(bodyParser.json())
app.use(express.static('public'))
app.use('/allure-report', express.static(allureReportDir))

app.post('/run-tests', (req, res) => {
  res.setHeader('Content-Type', 'application/json')
  console.log('Получен запрос на запуск тестов...')

  const wdioCommand = `npx wdio run ./wdio.conf.js`

  const childProcess = exec(wdioCommand, { cwd: process.cwd() })

  childProcess.stdout.on('data', (data) => {
    console.log(data.toString())
  })

  childProcess.stderr.on('data', (data) => {
    console.error(`Ошибка: ${data}`)
  })

  childProcess.on('close', (code) => {
    console.log(`Процесс завершен с кодом ${code}`)

    if (code !== 0) {
      res.status(500).json({ message: 'Произошла ошибка при выполнении тестов', code })
      return
    }

    try {
      if (!fs.existsSync(allureReportDir)) {
        console.log(`Папка ${allureReportDir} не существует. Создаю её...`)
        fs.mkdirSync(allureReportDir, { recursive: true })
      }

      const generateReportCommand = `npx allure generate ${allureResultsDir} --clean -o ${allureReportDir}`

      exec(generateReportCommand, (err, stdout, stderr) => {
        if (err) {
          console.error(`Ошибка генерации отчета: ${stderr}`)
          res.status(500).json({ message: 'Тесты выполнены, но произошла ошибка при генерации отчета', code })
          return
        }

        console.log(stdout)
        console.log(`Отчет успешно сгенерирован в папке ${allureReportDir}`)
        res
          .status(200)
          .json({ message: 'Тесты успешно выполнены и отчет сгенерирован', reportUrl: '/allure-report', code })
      })
    } catch (error) {
      console.error(`Ошибка: ${error.message}`)
      res.status(500).json({ message: 'Произошла ошибка при обработке отчета', error: error.message })
    }
  })
})

app.get('/', (req, res) => {
  res.sendFile(path.resolve('public/index.html'))
})

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`)
})
