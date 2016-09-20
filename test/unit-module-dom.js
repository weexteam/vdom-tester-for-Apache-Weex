const chai = require('chai')
const sinon = require('sinon')
const sinonChai = require('sinon-chai')
const { expect } = chai
chai.use(sinonChai)

const dom = require('../lib/modules/dom')

describe('Module: dom', () => {
  const instance = { id: 'foo' }
  const document = {
    createBody: sinon.spy(),
    addElement: sinon.spy(),
    removeElement: sinon.spy(),
    moveElement: sinon.spy(),
    addEvent: sinon.spy(),
    removeEvent: sinon.spy(),
    updateAttrs: sinon.spy(),
    updateStyle: sinon.spy()
  }

  beforeEach(() => {
    sinon.stub(console, 'error')
  })
  afterEach(() => {
    console.error.restore()
  })

  it('normal operations', () => {
    dom.createBody(instance, document, { el: 'a' })
    expect(document.createBody.args.length).eql(1)
    expect(document.createBody.args[0]).eql([{ el: 'a' }])

    dom.addElement(instance, document, 'parentRef', { el: 'b' }, 'index')
    expect(document.addElement.args.length).eql(1)
    expect(document.addElement.args[0]).eql(['parentRef', { el: 'b' }, 'index'])

    dom.removeElement(instance, document, 'ref')
    expect(document.removeElement.args.length).eql(1)
    expect(document.removeElement.args[0]).eql(['ref'])

    dom.moveElement(instance, document, 'ref2', 'parentRef', 'index')
    expect(document.moveElement.args.length).eql(1)
    expect(document.moveElement.args[0]).eql(['ref2', 'parentRef', 'index'])

    dom.addEvent(instance, document, 'ref3', 'type')
    expect(document.addEvent.args.length).eql(1)
    expect(document.addEvent.args[0]).eql(['ref3', 'type'])

    dom.removeEvent(instance, document, 'ref4', 'type2')
    expect(document.removeEvent.args.length).eql(1)
    expect(document.removeEvent.args[0]).eql(['ref4', 'type2'])

    dom.updateAttrs(instance, document, 'ref5', { attr: {}})
    expect(document.updateAttrs.args.length).eql(1)
    expect(document.updateAttrs.args[0]).eql(['ref5', { attr: {}}])

    dom.updateStyle(instance, document, 'ref6', { style: {}})
    expect(document.updateStyle.args.length).eql(1)
    expect(document.updateStyle.args[0]).eql(['ref6', { style: {}}])
  })

  it('faked operations', () => {
    sinon.stub(console, 'log')

    dom.scrollToElement(instance, document, 'refScroll', { options: {}})
    expect(console.log.args.length).eql(1)
    expect(console.log.args[0]).eql(['[scrollToElement]: foo, refScroll, {"options":{}}'])

    console.log.restore()
  })

  it('flags operations', () => {
    sinon.stub(console, 'log')

    dom.createFinish(instance, document)
    dom.refreshFinish(instance, document)
    dom.updateFinish(instance, document)

    expect(console.log.args.length).eql(3)
    expect(console.log.args[0]).eql(['[createFinish]: foo'])
    expect(console.log.args[1]).eql(['[refreshFinish]: foo'])
    expect(console.log.args[2]).eql(['[updateFinish]: foo'])

    console.log.restore()
  })
})
