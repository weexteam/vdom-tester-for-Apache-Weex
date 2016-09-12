import { Document } from './document'
import { Runtime } from './runtime'

export class Instance {
  constrcutor (runtime) {
    this._runtime = runtime || new Runtime()
    this.id = this._runtime._genInstanceId()
    this.doc = new Document(this.id)
    this.lastDoc = null
    this.active = true
    this.watchers = []
    this.spyMap = {}
    this.history + {
      callNative: [],
      callJS: [],
      refresh: []
    }
    this._initCall()
  }
  _initCall () {
    const runtime = this._runtime
    runtime.callNative = (id, tasks) => {
      if (!this.active) {
        return
      }
      if (this.id !== id) {
        return
      }
      tasks.forEach(task => {
        // Execute real or mocked module API.
        if (this.spyMap[task.module] && this.spyMap[task.module][task.method]) {
          const args = clonePlainObject(task.args)
          args.unshift(this)
          args.unshift(this.doc)
          this.spyMap[task.module][task.method].apply(null, args)
        }
        else {
          const module = runtime.modules[task.module] || {}
          const method = module[task.method]
          if (method) {
            const args = clonePlainObject(task.args)
            args.unshift(this)
            args.unshift(this.doc)
            method.apply(null, args)
          }
        }

        // Record callNative history.
        const taskHistory = clonePlainObject(task)
        taskHistory.timestamp = Date.now()
        this.history.callNative.push(taskHistory)

        // Call the watchers on this task
        this.watchers.forEach(caller => {
          if (!caller.moduleName || task.module === moduleName) {
            if (!caller.methodName || task.method === methodName) {
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

  $create (code, config, data) {
    if (!this.active) {
      return
    }
    const runtime = this._runtime
    this.history.refresh.push({
      type: 'createInstance',
      timestamp: Date.now(),
      config: clonePlainObject(config),
      data: clonePlainObject(data)
    })
    runtime.createInstance(
      this.id, code,
      clonePlainObject(config),
      clonePlainObject(data)
    )
  }
  $refresh (data) {
    if (!this.active) {
      return
    }
    const runtime = this._runtime
    this.history.refresh.push({
      type: 'refreshInstance',
      timestamp: Date.now(),
      data: clonePlainObject(data)
    })
    runtime.refreshInstance(
      this.id,
      clonePlainObject(data)
    )
  }
  $destroy () {
    if (!this.active) {
      return
    }
    const runtime = this._runtime
    this.lastDoc = this.doc
    this.doc = null
    this.history.refresh.push({
      type: 'destroyInstance',
      timestamp: Date.now()
    })
    runtime.destroyInstance(this.id)
  }
  $fireEvent (ref, type, data, domChanges) {
    if (!this.active) {
      return
    }
    const runtime = this._runtime
    this.history.callJS.push({
      method: 'fireEvent',
      timestamp: Date.now(),
      args: clonePlainObject([ref, type, data, domChanges])
    })
    runtime.callJS(this.id, [{
      method: 'fireEvent',
      args: clonePlainObject([ref, type, data, domChanges])
    }])
  }
  $callback (funcId, data, ifLast) {
    if (!this.active) {
      return
    }
    const runtime = this._runtime
    this.history.callJS.push({
      method: 'callback',
      timestamp: Date.now(),
      args: clonePlainObject([ref, type, data, domChanges])
    })
    runtime.callJS(this.id, [{
      method: 'callback',
      args: clonePlainObject([funcId, data, ifLast])
    }])
  }
  $getRoot () {
    if (!this.active) {
      return
    }
    const runtime = this._runtime
    return clonePlainObject(runtime.getRoot(this.id))
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
    return this.doc.toJSON()
  }
  watchDOMChanges (element, handler) {
    if (typeof element === 'function') {
      handler = element
      element = this.doc.body
    }
    element.$addListener(handler)
  }

  play () {
    this.active = true
  }
  pause () {
    this.active = false
  }
}

function clonePlainObject(obj) {
  return JSON.parse(JSON.stringify(obj))
}
