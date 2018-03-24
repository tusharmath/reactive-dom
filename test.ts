const testsContext = (<any>require).context('./test', true, /test\.js$/)
testsContext.keys().forEach(testsContext)
