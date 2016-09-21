const chai = require('chai')
const sinon = require('sinon')
const sinonChai = require('sinon-chai')
const { expect } = chai
chai.use(sinonChai)

const {
  Runtime,
  DEFAULT_MODULES,
  DEFAULT_ENV
} = require('../')

describe('Runtime Class', () => {
  const fooFramework = {}
  fooFramework.registerModules = sinon.spy()
  fooFramework.registerComponents = sinon.spy()

  afterEach(() => {
    fooFramework.registerModules.reset()
    fooFramework.registerComponents.reset()
  })

  it('create by constructor', () => {
    const runtime = new Runtime(fooFramework)
    expect(runtime.instanceMap).eql({})
    expect(runtime._nextInstanceId).eql(1)
    expect(runtime.target).equal(fooFramework)
    expect(runtime.target.WXEnvironment).eql(DEFAULT_ENV)
    expect(runtime.loggers).eql([])
    expect(runtime.modules).is.an.object
    const moduleKeys = []
    DEFAULT_MODULES.forEach(m => {
      [].push.apply(moduleKeys, Object.keys(m))
    })
    expect(Object.keys(runtime.modules).sort()).eql(moduleKeys.sort())
  })

  it('gen instance id', () => {
    const runtime = new Runtime(fooFramework)
    expect(runtime._nextInstanceId).eql(1)
    let nextId = runtime._genInstanceId()
    expect(nextId).eql(1)
    expect(runtime._nextInstanceId).eql(2)
    nextId = runtime._genInstanceId()
    expect(nextId).eql(2)
    expect(runtime._nextInstanceId).eql(3)
  })

  it('onlog & offlog', () => {
    const runtime = new Runtime(fooFramework)
    const spy = sinon.spy()
    const errorSpy = sinon.spy()
    runtime.onlog(spy)
    runtime.onlog('error', errorSpy)
    fooFramework.nativeLog('Hello')
    expect(spy.args.length).eql(1)
    expect(spy.args[0]).eql(['log', 'Hello'])
    expect(errorSpy.args.length).eql(0)
    fooFramework.nativeLog('World', '__ERROR')
    expect(spy.args.length).eql(2)
    expect(spy.args[1]).eql(['error', 'World'])
    expect(errorSpy.args.length).eql(1)
    expect(errorSpy.args[0]).eql(['World'])
    runtime.offlog(spy)
    fooFramework.nativeLog('X', '__ERROR')
    expect(spy.args.length).eql(2)
    expect(errorSpy.args.length).eql(2)
    runtime.offlog(errorSpy)
    fooFramework.nativeLog('Y', '__ERROR')
    fooFramework.nativeLog('Z')
    expect(spy.args.length).eql(2)
    expect(errorSpy.args.length).eql(2)
  })

  it('register modules', () => {
    const runtime = new Runtime(fooFramework, {
      modules: []
    })
    expect(runtime.modules).eql({})
    expect(fooFramework.registerModules.args.length).eql(0)

    runtime.registerModules([{ a: ['b'] }])
    expect(Object.keys(runtime.modules)).eql(['a'])
    expect(Object.keys(runtime.modules.a)).eql(['b'])
    expect(runtime.modules.a.b).is.a.function
    expect(fooFramework.registerModules.args.length).eql(1)
    expect(fooFramework.registerModules.args[0]).eql([{ a: ['b'] }])

    const handler = function () {}
    runtime.registerModules([{ c: { d: handler }}])
    expect(runtime.modules.c).is.an.object
    expect(runtime.modules.c.d).equal(handler)
  })

  it('register components', () => {
    const runtime = new Runtime(fooFramework, {
      components: []
    })
    expect(fooFramework.registerComponents.args.length).eql(0)
    const components = [
      'list',
      { 'append': 'tree', 'type': 'header' }
    ]
    runtime.registerComponents(components)
    expect(fooFramework.registerComponents.args.length).eql(2)
    expect(fooFramework.registerComponents.args[0]).eql([['list']])
    expect(fooFramework.registerComponents.args[1]).eql([[{ 'append': 'tree', 'type': 'header' }]])
  })
})
