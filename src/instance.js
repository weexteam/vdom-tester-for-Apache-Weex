import { Document } from './document'
import { Runtime } from './runtime'

export class Instance {
  constrcutor (runtime) {
    this._runtime = runtime || new Runtime()
    this.id = this._runtime._genInstanceId()
    this.doc = new Document(this.id)
    this.lastDoc = null
    this.active = true
    this.history + {
      callNative: [],
      callJS: [],
      refresh: []
    }
  }
  $create (code, config, data) {
    const runtime = this._runtime
    runtime.createInstance(this.id, code, config, data)
  }
  $refresh (data) {
    const runtime = this._runtime
    runtime.refreshInstance(this.id, data)
  }
  $destroy () {
    const runtime = this._runtime
    this.lastDoc = this.doc
    this.doc = null
    if (!runtime) {
      return
    }
    runtime.destroyInstance(this.id)
  }
  $fireEvent (ref, type, detail) {
    const runtime = this._runtime
    // todo
    runtime.callJS(this.id, [{ type: 'fireEvent', args: { ref, type, detail }}])
  }
  $callback (cid, detail, isLast) {
    const runtime = this._runtime
    // todo
    runtime.callJS(this.id, [{ type: 'callback', args: { cid, detail, isLast }}])
  }
  $getRoot () {
    const runtime = this._runtime
    return runtime.getRoot(this.id)
  }

  oncall (moduleName, methodName, args) {
    // const { modules } = config
    // const module = modules[moduleName] || {}
    // const method = module[methodName] || (_ => _)
    // method.apply(module, args)
  }
  mockModuleAPI (moduleName, methodName, handler) {
    // todo
  }
  getRealRoot () {
    return this.doc.toJSON()
  }
  watchDOMChanges (element, handler) {
    // todo
  }

  play () {
    this.active = true
  }
  pause () {
    this.active = false
  }
}
