const chai = require('chai')
const sinon = require('sinon')
const sinonChai = require('sinon-chai')
const { expect } = chai
chai.use(sinonChai)

const timer = require('../lib/modules/timer')

describe('Module: timer', () => {
  const instance = { id: 'foo', extension: {}}
  const document = {}

  afterEach(() => {
    delete instance.$callback
  })

  it('setTimeout', done => {
    const begin = Date.now()
    instance.$callback = (funcId, data, ifKeepAlive) => {
      expect(funcId).eql('fooCallback')
      expect(data).is.null
      expect(ifKeepAlive).eql(false)
      expect(Date.now() - begin).within(400, 600)
      done()
    }
    timer.setTimeout(instance, document, 'fooCallback', 500)
  })

  it('clearTimeout', done => {
    const spy = sinon.spy()
    instance.$callback = spy
    timer.setTimeout(instance, document, 'fooCallback2', 300)
    timer.clearTimeout(instance, document, 'fooCallback2')
    setTimeout(() => {
      expect(spy.args.length).eql(0)
      done()
    }, 600)
  })

  it('setInterval & clearInterval', done => {
    const begin = Date.now()
    let counter = 0
    instance.$callback = (funcId, data, ifKeepAlive) => {
      counter++
      expect(funcId).eql('fooCallback4')
      expect(data).is.null
      expect(ifKeepAlive).eql(true)
      expect(Date.now() - begin).within(300 * counter - 100, 300 * counter + 100)
    }
    timer.setInterval(instance, document, 'fooCallback4', 300)
    setTimeout(() => {
      timer.clearInterval(instance, document, 'fooCallback4')
    }, 700)
    setTimeout(() => {
      expect(counter).eql(2)
      done()
    }, 1000)
  })
})
