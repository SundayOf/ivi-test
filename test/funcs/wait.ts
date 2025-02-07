export function wait(time: number): Promise<unknown> {
  return new Promise((resolve) => {
    setTimeout(resolve, time)
  })
}
