const chai = require('chai')
const { expect } = chai

const {
  Runtime,
  Instance
} = require('../')

let sendTasksHandler = function () {}
const { config } = require('weex-js-framework/src/runtime')
config.sendTasks = config.Document.handler = function () {
  sendTasksHandler.apply(null, arguments)
}

describe('Raw Test', () => {
  const currentInstanceId = 1
  const fooFramework = {
    init: function (config) {
      this.config = config
    },
    createInstance (id, code) {
      /* eslint-disable no-eval */
      eval('with (this) {' + code + '}')
      /* eslint-enable no-eval */
    },
    refreshInstance () {},
    destroyInstance () {},
    registerModules () {},
    registerComponents () {},
    registerMethods () {},
    callJS () {}
  }
  fooFramework.init(config)

  it('could check real DOM structure in render', () => {
    const runtime = new Runtime(fooFramework)
    const instance = new Instance(runtime)
    const code = [
      `callNative('${currentInstanceId}', [{ module: 'dom', method: 'createBody', args: [{ ref: '_root', type: 'div' }]}])`,
      `callNative('${currentInstanceId}', [{ module: 'dom', method: 'addElement', args: ['_root', { ref: 'first', type: 'text', attr: { value: 'Hello' }}, -1]}])`,
      `callNative('${currentInstanceId}', [{ module: 'dom', method: 'createFinish', args: []}])`
    ].join('\n')
    instance.$create(code)
    expect(instance.getRealRoot()).eql({ type: 'div', children: [{ type: 'text', attr: { value: 'Hello' }}] })
    expect(instance.history.callNative.map(task => {
      return { module: task.module, method: task.method, args: task.args }
    })).eql([
      { module: 'dom', method: 'createBody', args: [{ ref: '_root', type: 'div' }] },
      { module: 'dom', method: 'addElement', args: ['_root', { ref: 'first', type: 'text', attr: { value: 'Hello' }}, -1] },
      { module: 'dom', method: 'createFinish', args: [] }
    ])
    expect(instance.history.refresh.map(task => {
      return { type: task.type }
    })).eql([{ type: 'createInstance' }])
  })
})

describe('Vanilla Test', () => {
  const vanillaFramework = require('weex-js-framework/src/frameworks/vanilla')
  vanillaFramework.init(config)

  it('could check real DOM structure in render', () => {
    const runtime = new Runtime(vanillaFramework)
    const instance = new Instance(runtime)
    sendTasksHandler = function () {
      runtime.target.callNative.apply(runtime.target, arguments)
    }
    const code = [
      `
      var body = document.createElement('div', {
        classStyle: { alignItems: 'center', marginTop: 120 }
      })

      var image = document.createElement('image', {
        attr: { src: 'http://alibaba.github.io/weex/img/weex_logo_blue@3x.png' },
        classStyle: { width: 360, height: 82 }
      })

      var text = document.createElement('text', {
        attr: { value: 'Hello World' },
        classStyle: { fontSize: 48 }
      })

      body.appendChild(image)
      body.appendChild(text)
      document.documentElement.appendChild(body)

      body.addEvent('click', function () {
        text.setAttr('value', 'Hello Weex')
      })

      sendTasks(id, [{ module: 'dom', method: 'createFinish', args: []}])
      `
    ].join('\n')
    instance.$create(code)
    expect(instance.getRealRoot()).eql({
      type: 'div',
      style: { alignItems: 'center', marginTop: 120 },
      event: ['click'],
      children: [
        { type: 'image', attr: { src: 'http://alibaba.github.io/weex/img/weex_logo_blue@3x.png' }, style: { width: 360, height: 82 }},
        { type: 'text', attr: { value: 'Hello World' }, style: { fontSize: 48 }}
      ]
    })
    expect(instance.history.refresh.map(task => {
      return { type: task.type }
    })).eql([{ type: 'createInstance' }])
  })
})
