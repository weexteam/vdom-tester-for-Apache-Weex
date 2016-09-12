export const DEFAULT_MODULES = {
  // todo
}
export const DEFAULT_COMPONENTS = {
  // todo
}
export const DEFAULT_ENV = {
  // todo
}

export class Runtime {
  constructor (options) {
    this.modules = options.modules || DEFAULT_MODULES
    this.components = options.components || DEFAULT_COMPONENTS
    this.env = options.env || DEFAULT_ENV
    this._nextInstanceId = 1
    // todo:
    // WXEnvironment, nativeLog, callNative
  }
  onlog (type, handler) {
    // todo
  }
  registerModules (modules) {
    // todo
  }
  registerComponents (components) {
    // todo
  }
  _getInsatnceId () {
    return this._nextInstanceId++
  }
}
