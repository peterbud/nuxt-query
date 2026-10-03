let serverRequestCount = 0

export default defineCachedEventHandler((event) => {
  const demoId = getRouterParam(event, 'id') ?? 'unknown'

  serverRequestCount += 1

  return {
    demoId,
    generatedAt: new Date().toISOString(),
    serverRequestCount,
    records: [
      { id: `${demoId}-a`, label: `Record A for demo ${demoId}` },
      { id: `${demoId}-b`, label: `Record B for demo ${demoId}` },
      { id: `${demoId}-c`, label: `Record C for demo ${demoId}` },
    ],
  }
})
