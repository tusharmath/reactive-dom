const testsContext = (<any>require).context('.', true, /.*\.test\.ts$/)
testsContext.keys().forEach(testsContext)
