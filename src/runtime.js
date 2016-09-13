import {
  DEFAULT_MODULES
  DEFAULT_COMPONENTS
  DEFAULT_ENV
} from './env/default'
import defaultModules from './modules/index'
import { clonePlainObject } from './util'

export class Runtime {
  constructor (jsFramework, options) {
    // Init instance management.
    this.instanceMap = {}
    this._nextInstanceId = 1

    // Init JS Framework
    this.target = jsFramework
    this.target.WXEnvironment = clonePlainObject(options.env || DEFAULT_ENV)

    // Bind global methods for JS framework.
    this.target.nativeLog = function (...args) {
      console.log(...args)
    }
    this.callNative = (id, tasks) {
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
    // todo
  }
  registerModules (modules) {
    const target = this.target
    modules.forEach(module => {
      const registration = []
      const functions = {}
      for (const name in module) {
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
      }
      target.registerModules(registration)
      this.modules[name] = functions
    })
  }
  registerComponents (components) {
    const target = this.target
    components.forEach(component => target.registerComponents([component]))
  }
  _getInsatnceId () {
    return this._nextInstanceId++
  }
}
