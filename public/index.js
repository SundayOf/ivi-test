const runTestsButton = document.getElementById('runTests')
const viewReportButton = document.getElementById('viewReport')
const spinner = document.getElementById('spinner')
const output = document.getElementById('output')

runTestsButton.addEventListener('click', async () => {
  output.textContent = 'Запуск тестов...'
  viewReportButton.style.display = 'none'
  runTestsButton.disabled = true
  spinner.style.display = 'block'

  try {
    const response = await fetch('/run-tests', { method: 'POST' })
    const data = await response.json()
    output.textContent = JSON.stringify(data, null, 2)
    if (data.reportUrl) {
      viewReportButton.style.display = 'inline'
      viewReportButton.onclick = () => window.open(data.reportUrl, '_blank')
    }
  } catch (err) {
    output.textContent = 'Ошибка: ' + err.message
  } finally {
    spinner.style.display = 'none'
    runTestsButton.disabled = false
  }
})
