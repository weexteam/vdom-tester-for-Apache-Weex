const chai = require('chai')
const sinon = require('sinon')
const sinonChai = require('sinon-chai')
const { expect } = chai
chai.use(sinonChai)

const {
  Runtime,
  Instance,
  DEFAULT_MODULES,
  DEFAULT_COMPONENTS,
  DEFAULT_ENV
} = require('../')

let currentInstanceId = 1
const fooFramework = {
  createInstance (id, code) {
    with (this) {
      eval(code)
    }
  },
  refreshInstance () {},
  destroyInstance () {},
  registerModules () {},
  registerComponents () {},
  registerMethods () {},
  callJS () {}
}

describe('Vanilla Test', () => {
  it('could check real DOM structure in render', () => {
    const runtime = new Runtime(fooFramework)
    const instance = new Instance(runtime)
    const code = [
      `callNative(${currentInstanceId}, [{ module: 'dom', method: 'createBody', args: [{ ref: '_root', type: 'div' }]}])`,
      `callNative(${currentInstanceId}, [{ module: 'dom', method: 'addElement', args: ['_root', { ref: 'first', type: 'text', attr: { value: 'Hello' }}, -1]}])`,
      `callNative(${currentInstanceId}, [{ module: 'dom', method: 'createFinish', args: []}])`
    ].join('\n')
    instance.$create(code)
    expect(instance.getRealRoot()).eql({ type: 'div', children: [ { type: 'text', attr: { value: 'Hello' } } ] })
    expect(instance.history.callNative.map(task => {
      return { module: task.module, method: task.method, args: task.args }
    })).eql([
      { module: 'dom', method: 'createBody', args: [{ ref: '_root', type: 'div' }]},
      { module: 'dom', method: 'addElement', args: ['_root', { ref: 'first', type: 'text', attr: { value: 'Hello' }}, -1]},
      { module: 'dom', method: 'createFinish', args: []}
    ])
    expect(instance.history.refresh.map(task => {
      return { type: task.type }
    })).eql([{ type: 'createInstance' }])
  })
})
