export async function waitFor(delayInSeconds: number) {
  return await new Promise<void>((resolve) =>
    setTimeout(resolve, delayInSeconds * 1000)
  );
}
