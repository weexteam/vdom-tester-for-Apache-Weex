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

describe('Instance Class', () => {
  const fooFramework = {
    createInstance (id, code) {
      /* eslint-disable no-eval */
      eval('with (this) {' + code + '}')
      /* eslint-enable no-eval */
    },
    getRoot () {
      return { ref: 'ROOT' }
    }
  }
  sinon.spy(fooFramework, 'createInstance')
  sinon.spy(fooFramework, 'getRoot')
  fooFramework.refreshInstance = sinon.spy()
  fooFramework.destroyInstance = sinon.spy()
  fooFramework.registerModules = sinon.spy()
  fooFramework.registerComponents = sinon.spy()
  fooFramework.registerMethods = sinon.spy()
  fooFramework.receiveTasks = sinon.spy()

  const runtime = new Runtime(fooFramework)
  const env = clonePlainObject(runtime.target.WXEnvironment)
  const sampleCode = '"hello world"'
  const circleData = { x: 1 }
  circleData.y = circleData

  afterEach(() => {
    fooFramework.createInstance.reset()
    fooFramework.refreshInstance.reset()
    fooFramework.destroyInstance.reset()
    fooFramework.registerModules.reset()
    fooFramework.registerComponents.reset()
    fooFramework.registerMethods.reset()
    fooFramework.receiveTasks.reset()
    fooFramework.getRoot.reset()
  })

  it('create by constructor', () => {
    let instance = new Instance()
    expect(instance).is.an.object
    expect(instance.id).is.undefined

    instance = new Instance(runtime)
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
    expect(fooFramework.createInstance.args[0]).eql([id, sampleCode, { env }, {}, { config: { env }, callbacks: undefined }])
    instance.$destroy()
    expect(fooFramework.destroyInstance.args.length).eql(1)
    expect(fooFramework.destroyInstance.args[0]).eql([id])

    const instance2 = new Instance(runtime)
    const id2 = instance2.id
    instance2.$create(sampleCode, { x: 1 }, { y: 2 }, { z: 3 })
    expect(fooFramework.createInstance.args.length).eql(2)
    expect(fooFramework.createInstance.args[1]).eql([id2, sampleCode, { y: 2, env }, { z: 3 }, { config: { y: 2, env }, callbacks: { x: 1 }}])
    instance2.$destroy()
    expect(fooFramework.destroyInstance.args.length).eql(2)
    expect(fooFramework.destroyInstance.args[1]).eql([id2])

    const instance3 = new Instance(runtime)
    instance3.$create('')
    expect(fooFramework.createInstance.args.length).eql(2)
    instance3.$create(sampleCode, null, circleData)
    expect(fooFramework.createInstance.args.length).eql(2)
    instance3.$create(sampleCode, null, null, function () {})
    expect(fooFramework.createInstance.args.length).eql(2)
  })

  it('refresh', () => {
    const instance = new Instance(runtime)
    const id = instance.id
    instance.$create(sampleCode)
    expect(fooFramework.createInstance.args[0]).eql([id, sampleCode, { env }, {}, { config: { env }, callbacks: undefined }])
    instance.$refresh({ x: 1 })
    expect(fooFramework.refreshInstance.args.length).eql(1)
    expect(fooFramework.refreshInstance.args[0]).eql([id, { x: 1 }])
    instance.$refresh(circleData)
    expect(fooFramework.refreshInstance.args.length).eql(1)
    instance.$destroy()
    expect(fooFramework.destroyInstance.args.length).eql(1)
    expect(fooFramework.destroyInstance.args[0]).eql([id])
  })

  it('fireEvent & callback', () => {
    const instance = new Instance(runtime)
    const id = instance.id
    instance.$create(sampleCode)
    instance.$fireEvent('_root', 'appear', { x: 1 })
    expect(fooFramework.receiveTasks.args.length).eql(1)
    expect(fooFramework.receiveTasks.args[0]).eql([id, [
      { method: 'fireEvent', args: ['_root', 'appear', { x: 1 }, null] }
    ]])
    instance.$fireEvent('_root', 'click', { y: 2 }, { attr: { z: 3 }})
    expect(fooFramework.receiveTasks.args.length).eql(2)
    expect(fooFramework.receiveTasks.args[1]).eql([id, [
      { method: 'fireEvent', args: ['_root', 'click', { y: 2 }, { attr: { z: 3 }}] }
    ]])
    instance.$callback('cbId1', { xx: 11 })
    expect(fooFramework.receiveTasks.args.length).eql(3)
    expect(fooFramework.receiveTasks.args[2]).eql([id, [
      { method: 'callback', args: ['cbId1', { xx: 11 }, null] }
    ]])
    instance.$callback('cbId1', { xxx: 111 }, true)
    expect(fooFramework.receiveTasks.args.length).eql(4)
    expect(fooFramework.receiveTasks.args[3]).eql([id, [
      { method: 'callback', args: ['cbId1', { xxx: 111 }, true] }
    ]])
    instance.$callback('cbId2', { xxxx: 1111 }, true)
    expect(fooFramework.receiveTasks.args.length).eql(5)
    expect(fooFramework.receiveTasks.args[4]).eql([id, [
      { method: 'callback', args: ['cbId2', { xxxx: 1111 }, true] }
    ]])
    instance.$destroy()
  })

  it('get whole virtual-DOM JSON', () => {
    const instance = new Instance(runtime)
    instance.$create(sampleCode)
    const result = instance.$getRoot()
    expect(fooFramework.getRoot.args.length).eql(1)
    expect(result).eql({ ref: 'ROOT' })
    instance.$destroy()
  })

  it('listen for callNative', () => {
    const instance = new Instance(runtime)
    const id = instance.id
    const spy = sinon.spy()
    instance.oncall('a', 'b', spy)
    runtime.modules.a = {
      b: sinon.spy()
    }
    instance.$create(`callNative('${id}', [{ module: 'a', method: 'b', args: [1, 2, 3]}])`)
    expect(runtime.modules.a.b.args.length).eql(1)
    expect(runtime.modules.a.b.args[0][0]).equal(instance)
    expect(runtime.modules.a.b.args[0][1]).equal(instance.doc)
    expect(runtime.modules.a.b.args[0].slice(2)).eql([1, 2, 3])
    expect(instance.history.callNative.length).eql(1)
    expect(instance.history.callNative[0].module).eql('a')
    expect(instance.history.callNative[0].method).eql('b')
    expect(instance.history.callNative[0].args).eql([1, 2, 3])
    expect(spy.args.length).eql(1)
    expect(spy.args[0]).eql([1, 2, 3])
    instance.$destroy()
  })

  it('mock module APIs', () => {
    const instance = new Instance(runtime)
    const id = instance.id
    const spy = sinon.spy()
    runtime.modules.a = {
      b: sinon.spy()
    }
    instance.mockModuleAPI('a', 'b', spy)
    instance.$create(`callNative('${id}', [{ module: 'a', method: 'b', args: [1, 2, 3]}])`)
    expect(runtime.modules.a.b.args.length).eql(0)
    expect(spy.args.length).eql(1)
    expect(spy.args[0][0]).equal(instance)
    expect(spy.args[0][1]).equal(instance.doc)
    expect(spy.args[0][2]).equal(runtime.modules.a.b)
    expect(spy.args[0].slice(3)).eql([1, 2, 3])
    instance.$destroy()
  })

  it('get real DOM JSON', () => {
    const instance = new Instance(runtime)
    instance.$create(sampleCode)
    instance.doc.createBody({
      type: 'div',
      children: [
        { ref: '1', type: 'text', attr: { value: 'Hello' }},
        { ref: '2', type: 'img', attr: { src: '...' }}
      ]
    })
    const result = instance.getRealRoot()
    expect(result).eql({
      type: 'div',
      children: [
        { type: 'text', attr: { value: 'Hello' }},
        { type: 'img', attr: { src: '...' }}
      ]
    })
    instance.$destroy()
  })

  it('watch DOM changes', () => {
    const instance = new Instance(runtime)
    instance.$create(sampleCode)
    instance.doc.createBody({
      type: 'div',
      children: [
        { ref: '1', type: 'text', attr: { value: 'Hello' }},
        { ref: '2', type: 'img', attr: { src: '...' }}
      ]
    })
    const spy = sinon.spy()
    instance.watchDOMChanges(spy)
    instance.doc.updateAttrs('1', { value: 'Weex' })
    expect(spy.args.length).eql(1)
    expect(spy.args[0]).eql(['1', { attr: { value: 'Weex' }}])
    const spy2 = sinon.spy()
    instance.watchDOMChanges(instance.doc.body.children[0], spy2)
    instance.doc.updateAttrs('1', { value: 'World' })
    expect(spy.args.length).eql(2)
    expect(spy2.args.length).eql(1)
    expect(spy.args[1]).eql(['1', { attr: { value: 'World' }}])
    expect(spy2.args[0]).eql(['1', { attr: { value: 'World' }}])
    const spy3 = sinon.spy()
    instance.watchDOMChanges({}, spy3)
    instance.doc.updateAttrs('1', { value: 'XXX' })
    expect(spy3.args.length).eql(0)
  })
})
