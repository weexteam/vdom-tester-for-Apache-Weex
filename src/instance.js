const { Document, Element } = require('./document')
const { Runtime } = require('./runtime')
const { clonePlainObject } = require('./util')

class Instance {
  constructor (runtime) {
    if (!(runtime instanceof Runtime)) {
      console.error(`[instance] can not create a instance without runtime`)
      return
    }
    this._runtime = runtime
    this._target = this._runtime.target
    this.id = this._runtime._genInstanceId().toString()
    this._runtime.instanceMap[this.id] = this
    this.doc = new Document(this.id)
    this.lastDoc = null
    this.active = true
    this.watchers = []
    this.extension = {}
    this.spyMap = {}
    this.history = {
      callNative: [],
      callJS: [],
      refresh: []
    }
    this._initCall()
  }
  _initCall () {
    const runtime = this._runtime
    this.callNative = (id, tasks) => {
      if (!this.active) {
        return
      }
      if (this.id !== id) {
        return
      }
      tasks.forEach(task => {
        // Execute real or mocked module API.
        const module = runtime.modules[task.module] || {}
        const method = module[task.method]
        if (this.spyMap[task.module] && this.spyMap[task.module][task.method]) {
          const args = clonePlainObject(task.args)
          args.unshift(method)
          args.unshift(this.doc)
          args.unshift(this)
          this.spyMap[task.module][task.method].apply(null, args)
        }
        else if (method) {
          const args = clonePlainObject(task.args)
          args.unshift(this.doc)
          args.unshift(this)
          method.apply(null, args)
        }

        // Record callNative history.
        const taskHistory = clonePlainObject(task)
        taskHistory.timestamp = Date.now()
        this.history.callNative.push(taskHistory)

        // Call the watchers on this task
        this.watchers.forEach(caller => {
          if (!caller.moduleName || task.module === caller.moduleName) {
            if (!caller.methodName || task.method === caller.methodName) {
              const args = clonePlainObject(task.args)
              if (!caller.methodName) {
                args.unshift(task.method)
              }
              if (!caller.moduleName) {
                args.unshift(task.module)
              }
              caller.handler.apply(null, args)
            }
          }
        })
      })
    }
  }

  $create (code, callbacks, config, data) {
    if (!this.active) {
      return
    }
    if (typeof code !== 'string' || !code) {
      console.error(`[instance] can not createInstance without code`)
      return
    }
    try {
      clonePlainObject(config || {})
    }
    catch (e) {
      console.error(`[instance] "config" must be plain object or falsy value when createInstance\n${e}`)
      return
    }
    try {
      clonePlainObject(data || {})
    }
    catch (e) {
      console.error(`[instance] "data" must be plain object or falsy value when createInstance\n${e}`)
      return
    }
    const target = this._target
    this.history.refresh.push({
      type: 'createInstance',
      timestamp: Date.now(),
      config: clonePlainObject(config || {}),
      data: clonePlainObject(data || {})
    })
    config = clonePlainObject(config || {})
    data = clonePlainObject(data || {})
    config.env = clonePlainObject(target.WXEnvironment || {})
    return ((callNative) => {
      return target.createInstance(this.id, code, config, data, { config, callbacks })
    })(this.callNative.bind(this))
  }
  $refresh (data) {
    if (!this.active) {
      return
    }
    try {
      clonePlainObject(data || {})
    }
    catch (e) {
      console.error(`[instance] "data" must be plain object or falsy value when refreshInstance\n${e}`)
      return
    }
    const target = this._target
    this.history.refresh.push({
      type: 'refreshInstance',
      timestamp: Date.now(),
      data: clonePlainObject(data)
    })
    return target.refreshInstance(
      this.id,
      clonePlainObject(data)
    )
  }
  $destroy () {
    if (!this.active) {
      return
    }
    const runtime = this._runtime
    const target = this._target
    this.lastDoc = this.doc
    this.doc = null
    this.history.refresh.push({
      type: 'destroyInstance',
      timestamp: Date.now()
    })
    target.destroyInstance(this.id)
    delete runtime.instanceMap[this.id]
  }
  $fireEvent (ref, type, data, domChanges) {
    if (!this.active) {
      return
    }
    if (typeof ref !== 'string' || !ref) {
      console.error(`[instance] "ref" must be truthy string in fireEvent`)
      return
    }
    if (typeof type !== 'string' || !type) {
      console.error(`[instance] event "type" must be truthy string`)
      return
    }
    try {
      clonePlainObject(data || {})
    }
    catch (e) {
      console.error(`[instance] "data" must be plain object or falsy value when fireEvent\n${e}`)
      return
    }
    try {
      clonePlainObject(domChanges || {})
    }
    catch (e) {
      console.error(`[instance] "domChanges" must be plain object or falsy value when fireEvent\n${e}`)
      return
    }
    const target = this._target
    this.history.callJS.push({
      method: 'fireEvent',
      timestamp: Date.now(),
      args: clonePlainObject([ref, type, data, domChanges])
    })
    target.receiveTasks(this.id, [{
      method: 'fireEvent',
      args: clonePlainObject([ref, type, data, domChanges])
    }])
  }
  $callback (funcId, data, ifLast) {
    if (!this.active) {
      return
    }
    if (typeof funcId !== 'string' || !funcId) {
      console.error(`[instance] "funcId" must be truthy string in fireEvent`)
      return
    }
    try {
      clonePlainObject(data || {})
    }
    catch (e) {
      console.error(`[instance] "data" must be plain object or falsy value when callback\n${e}`)
      return
    }
    const target = this._target
    this.history.callJS.push({
      method: 'callback',
      timestamp: Date.now(),
      args: clonePlainObject([funcId, data, ifLast])
    })
    target.receiveTasks(this.id, [{
      method: 'callback',
      args: clonePlainObject([funcId, data, ifLast])
    }])
  }
  $getRoot () {
    if (!this.active) {
      return
    }
    const target = this._target
    return clonePlainObject(target.getRoot(this.id))
  }

  oncall (moduleName, methodName, handler) {
    if (typeof moduleName === 'function') {
      handler = moduleName
      methodName = ''
      moduleName = ''
    }
    if (typeof methodName === 'function') {
      handler = methodName
      methodName = ''
    }
    if (!this.watchers.filter(caller => caller.handler === handler).length) {
      this.watchers.push({ moduleName, methodName, handler })
    }
  }
  mockModuleAPI (moduleName, methodName, handler) {
    if (!this.spyMap[moduleName]) {
      this.spyMap[moduleName] = {}
    }
    this.spyMap[moduleName][methodName] = handler
  }
  getRealRoot () {
    return this.doc.body ? this.doc.body.toJSON() : {}
  }
  watchDOMChanges (element, handler) {
    if (typeof element === 'function') {
      handler = element
      element = this.doc.body
    }
    if (!(element instanceof Element)) {
      console.error(`[instance] you can only listen an Element but the target you want listen to is not`)
      return
    }
    element.$addListener(this.doc, handler)
  }

  play () {
    this.active = true
  }
  pause () {
    this.active = false
  }
}

exports.Instance = Instance
