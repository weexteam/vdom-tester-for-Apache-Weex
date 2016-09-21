const chai = require('chai')
const sinon = require('sinon')
const sinonChai = require('sinon-chai')
const { expect } = chai
chai.use(sinonChai)

const {
  Runtime,
  Instance
} = require('../')

const { clonePlainObject } = require('../lib/util')

describe.only('Instance Class', () => {
  const fooFramework = {
    createInstance (id, code) {
      /* eslint-disable no-eval */
      eval('with (this) {' + code + '}')
      /* eslint-enable no-eval */
    }
  }
  sinon.spy(fooFramework, 'createInstance')
  fooFramework.refreshInstance = sinon.spy()
  fooFramework.destroyInstance = sinon.spy()
  fooFramework.registerModules = sinon.spy()
  fooFramework.registerComponents = sinon.spy()
  fooFramework.registerMethods = sinon.spy()
  fooFramework.callJS = sinon.spy()

  const runtime = new Runtime(fooFramework)
  const env = clonePlainObject(runtime.target.WXEnvironment)
  const sampleCode = '"hello world"'

  afterEach(() => {
    fooFramework.createInstance.reset()
    fooFramework.refreshInstance.reset()
    fooFramework.destroyInstance.reset()
    fooFramework.registerModules.reset()
    fooFramework.registerComponents.reset()
    fooFramework.registerMethods.reset()
    fooFramework.callJS.reset()
  })

  it('create by constructor', () => {
    const instance = new Instance(runtime)
    expect(instance).is.an.object
    expect(instance.id).is.a.string
    expect(instance._target).equal(fooFramework)
    expect(instance._runtime).equal(runtime)
    expect(instance.extension).eql({})
    expect(instance.active).eql(true)
  })

  it('create & destroy', () => {
    const instance = new Instance(runtime)
    const id = instance.id
    instance.$create(sampleCode)
    expect(fooFramework.createInstance.args.length).eql(1)
    expect(fooFramework.createInstance.args[0]).eql([id, sampleCode, { env }, {}])
    instance.$destroy()
    expect(fooFramework.destroyInstance.args.length).eql(1)
    expect(fooFramework.destroyInstance.args[0]).eql([id])

    const instance2 = new Instance(runtime)
    const id2 = instance2.id
    instance2.$create(sampleCode, { x: 1 }, { y: 2 })
    expect(fooFramework.createInstance.args.length).eql(2)
    expect(fooFramework.createInstance.args[1]).eql([id2, sampleCode, { x: 1, env }, { y: 2 }])
    instance2.$destroy()
    expect(fooFramework.destroyInstance.args.length).eql(2)
    expect(fooFramework.destroyInstance.args[1]).eql([id2])
  })

  it('refresh', () => {
    const instance = new Instance(runtime)
    const id = instance.id
    instance.$create(sampleCode)
    expect(fooFramework.createInstance.args[0]).eql([id, sampleCode, { env }, {}])
    instance.$refresh({ x: 1 })
    expect(fooFramework.refreshInstance.args.length).eql(1)
    expect(fooFramework.refreshInstance.args[0]).eql([id, { x: 1 }])
    instance.$destroy()
    expect(fooFramework.destroyInstance.args.length).eql(1)
    expect(fooFramework.destroyInstance.args[0]).eql([id])
  })

  it('fireEvent & callback', () => {
    // todo
  })

  it('get whole virtual-DOM JSON', () => {
    // todo
  })

  it('listen for callNative', () => {
    // todo
  })

  it('mock module APIs', () => {
    // todo
  })

  it('get real DOM JSON', () => {
    // todo
  })

  it('watch DOM changes', () => {
    // todo
  })

  it('do not response to inactive instance', () => {
    // todo
  })
})
