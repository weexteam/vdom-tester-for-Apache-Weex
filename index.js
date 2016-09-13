var env = require('./lib/env/default')
module.DEFAULT_MODULES = env.DEFAULT_MODULES
module.DEFAULT_COMPONENTS = env.DEFAULT_COMPONENTS
module.DEFAULT_ENV = env.DEFAULT_ENV
module.Runtime = require('./lib/runtime').Runtime
module.Instance = require('./lib/instance').Instance
