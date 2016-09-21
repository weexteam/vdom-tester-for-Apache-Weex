const {
  DEFAULT_MODULES,
  DEFAULT_COMPONENTS,
  DEFAULT_ENV
} = require('./env/default')
const defaultModules = require('./modules/index')
const { clonePlainObject } = require('./util')

const LOG_LEVELS = [
  '__DEBUG',
  '__LOG',
  '__INFO',
  '__WARN',
  '__ERROR'
]

class Runtime {
  constructor (jsFramework, options) {
    options = options || {}

    // Init instance management.
    this.instanceMap = {}
    this._nextInstanceId = 1

    // Init JS Framework
    this.target = jsFramework
    this.target.WXEnvironment = clonePlainObject(options.env || DEFAULT_ENV)

    // Bind global methods for JS framework.
    this.loggers = []
    this.target.nativeLog = (...args) => {
      let level = args[args.length - 1]
      let levelIndex = LOG_LEVELS.indexOf(level)
      if (levelIndex === -1) {
        levelIndex = 1
        level = LOG_LEVELS[1]
      }
      else {
        args.pop()
      }
      this.loggers.forEach(logger => {
        if (!logger.level) {
          logger.handler.apply(null, [level.substr(2).toLowerCase()].concat(args))
        }
        else if (LOG_LEVELS.indexOf(logger.level) === levelIndex) {
          logger.handler.apply(null, args)
        }
      })
    }
    this.callNative = (id, tasks) => {
      if (this.instanceMap[id]) {
        this.instanceMap[id].callNative(id, tasks)
      }
    }

    // Register modules and components.
    this.modules = {}
    this.registerModules(options.modules || DEFAULT_MODULES)
    this.registerComponents(options.components || DEFAULT_COMPONENTS)
  }
  onlog (type, handler) {
    if (typeof type === 'function') {
      handler = type
      type = ''
    }
    let level = '__' + type.toUpperCase()
    if (LOG_LEVELS.indexOf(level) < 0) {
      level = ''
    }
    this.loggers.push({ level, handler })
  }
  offlog (handler) {
    this.loggers.some((logger, index) => {
      if (logger.handler === handler) {
        this.loggers.splice(index, 1)
        return true
      }
    })
  }
  registerModules (modules) {
    const target = this.target
    modules.forEach(module => {
      for (const name in module) {
        let registration = []
        let functions = {}
        const methods = module[name]
        if (Array.isArray(methods)) {
          // Handle default modules
          registration = methods
          methods.forEach(methodName => {
            functions[methodName] = ((defaultModules[name] || {})[methodName] || function () {})
          })
        }
        else {
          // Handle custom modules
          registration = Object.keys(methods)
          functions = methods
        }
        this.modules[name] = functions
        target.registerModules({ [name]: registration })
      }
    })
  }
  registerComponents (components) {
    const target = this.target
    components.forEach(component => target.registerComponents([component]))
  }
  _genInstanceId () {
    return this._nextInstanceId++
  }
}

exports.Runtime = Runtime
