const chai = require('chai')
const sinon = require('sinon')
const sinonChai = require('sinon-chai')
const { expect } = chai
chai.use(sinonChai)

const { Document, Element } = require('../lib/document')

const basicRootConfig = {
  type: 'div',
  attr: { x: 'a' },
  style: { y: 'b' }
}

const basicElementConfig = {
  ref: '1',
  type: 'div',
  attr: { x: 'a' },
  children: [
    { ref: '2', type: 'text', attr: { value: 'Hello' }}
  ]
}

function initDoc (doc) {
  doc.createBody(basicRootConfig)
  doc.addElement(doc.body.ref, basicElementConfig, -1)
  doc.addElement(
    doc.body.children[0].ref,
    { ref: '3', type: 'text', attr: { value: 'World' }},
    0)
}

const initDocJSON = {
  type: 'div',
  attr: { x: 'a' },
  style: { y: 'b' },
  children: [
    { type: 'div', attr: { x: 'a' }, children: [
      { type: 'text', attr: { value: 'World' }},
      { type: 'text', attr: { value: 'Hello' }}
    ] }
  ]
}

describe('Document Class', () => {
  let doc

  before(() => {
    sinon.stub(console, 'error')
  })
  after(() => {
    console.error.restore()
  })
  beforeEach(() => {
    doc = new Document('foo', 'https://github.com/')
  })
  afterEach(() => {
    doc = null
  })

  it('create by constructor', () => {
    expect(doc).is.an.object
    expect(doc._id).eql('foo')
    expect(doc._URL).eql('https://github.com/')
  })
  it('create body', () => {
    doc.createBody(basicRootConfig)
    expect(doc.body).is.an.object
    expect(doc.body.type).eql('div')
    expect(doc.body.attr).eql({ x: 'a' })
    expect(doc.body.style).eql({ y: 'b' })
  })
  it('create body with event and children', () => {
    const config = {
      type: 'div',
      event: ['click'],
      attr: { x: 'a' },
      style: { y: 'b' },
      children: [
        { type: 'text', attr: { value: 'Hello' }},
        { type: 'text', attr: { value: 'World' }}
      ]
    }
    doc.createBody(config)
    expect(doc.body).is.an.object
    expect(doc.body.event).eql(['click'])
    expect(doc.body.children).is.an.array
    expect(doc.body.children.length).eql(2)
    expect(doc.body.children[1].type).eql('text')
    expect(doc.body.children[1].attr.value).eql('World')
  })
  it('create body with only valid type', () => {
    const config = { type: 'foo' }
    doc.createBody(config)
    expect(doc.body).is.null
  })
  it('create body must have config', () => {
    doc.createBody()
    expect(doc.body).is.null
  })
  it('addElement (parentRef, config, index)', () => {
    doc.createBody(basicRootConfig)
    doc.addElement(doc.body.ref, basicElementConfig, -1)
    expect(doc.toJSON()).eql({
      type: 'div',
      attr: { x: 'a' },
      style: { y: 'b' },
      children: [
        { type: 'div', attr: { x: 'a' }, children: [{ type: 'text', attr: { value: 'Hello' }}] }
      ]
    })
    doc.addElement(doc.body.children[0].ref, { ref: '3', type: 'image', attr: { src: '...' }}, 0)
    expect(doc.toJSON()).eql({
      type: 'div',
      attr: { x: 'a' },
      style: { y: 'b' },
      children: [
        { type: 'div', attr: { x: 'a' }, children: [
          { type: 'image', attr: { src: '...' }},
          { type: 'text', attr: { value: 'Hello' }}
        ] }
      ]
    })

    // should not add an element successfull without ref
    doc.addElement(doc.body.children[0].ref, { type: 'image', attr: { src: '...' }}, 0)
    expect(doc.toJSON()).eql({
      type: 'div',
      attr: { x: 'a' },
      style: { y: 'b' },
      children: [
        { type: 'div', attr: { x: 'a' }, children: [
          { type: 'image', attr: { src: '...' }},
          { type: 'text', attr: { value: 'Hello' }}
        ] }
      ]
    })

    // should not add an element successfull with wrong parent ref
    doc.addElement('xxx', { ref: '4', type: 'image', attr: { src: '...' }}, 0)
    expect(doc.toJSON()).eql({
      type: 'div',
      attr: { x: 'a' },
      style: { y: 'b' },
      children: [
        { type: 'div', attr: { x: 'a' }, children: [
          { type: 'image', attr: { src: '...' }},
          { type: 'text', attr: { value: 'Hello' }}
        ] }
      ]
    })

    // should not add an element successfull with existed ref
    doc.addElement(doc.body.children[0].ref, { ref: '3', type: 'image', attr: { src: '...' }}, 0)
    expect(doc.toJSON()).eql({
      type: 'div',
      attr: { x: 'a' },
      style: { y: 'b' },
      children: [
        { type: 'div', attr: { x: 'a' }, children: [
          { type: 'image', attr: { src: '...' }},
          { type: 'text', attr: { value: 'Hello' }}
        ] }
      ]
    })
  })
  it('moveElement (ref, parentRef, index)', () => {
    initDoc(doc)
    expect(doc.toJSON()).eql(initDocJSON)

    const parentRef = doc.body.children[0].ref

    // move first to first (no effect)
    doc.moveElement(doc.body.children[0].children[0].ref, parentRef, 0)
    expect(doc.toJSON()).eql({
      type: 'div',
      attr: { x: 'a' },
      style: { y: 'b' },
      children: [
        { type: 'div', attr: { x: 'a' }, children: [
          { type: 'text', attr: { value: 'World' }},
          { type: 'text', attr: { value: 'Hello' }}
        ] }
      ]
    })

    // move first to middle (no effect)
    doc.moveElement(doc.body.children[0].children[0].ref, parentRef, 1)
    expect(doc.toJSON()).eql({
      type: 'div',
      attr: { x: 'a' },
      style: { y: 'b' },
      children: [
        { type: 'div', attr: { x: 'a' }, children: [
          { type: 'text', attr: { value: 'World' }},
          { type: 'text', attr: { value: 'Hello' }}
        ] }
      ]
    })

    // move first to bottom
    doc.moveElement(doc.body.children[0].children[0].ref, parentRef, 2)
    expect(doc.toJSON()).eql({
      type: 'div',
      attr: { x: 'a' },
      style: { y: 'b' },
      children: [
        { type: 'div', attr: { x: 'a' }, children: [
          { type: 'text', attr: { value: 'Hello' }},
          { type: 'text', attr: { value: 'World' }}
        ] }
      ]
    })

    // move bottom to bottom (no effect)
    doc.moveElement(doc.body.children[0].children[1].ref, parentRef, 2)
    expect(doc.toJSON()).eql({
      type: 'div',
      attr: { x: 'a' },
      style: { y: 'b' },
      children: [
        { type: 'div', attr: { x: 'a' }, children: [
          { type: 'text', attr: { value: 'Hello' }},
          { type: 'text', attr: { value: 'World' }}
        ] }
      ]
    })

    // move bottom to middle (no effect)
    doc.moveElement(doc.body.children[0].children[1].ref, parentRef, 1)
    expect(doc.toJSON()).eql({
      type: 'div',
      attr: { x: 'a' },
      style: { y: 'b' },
      children: [
        { type: 'div', attr: { x: 'a' }, children: [
          { type: 'text', attr: { value: 'World' }},
          { type: 'text', attr: { value: 'Hello' }}
        ] }
      ]
    })

    // move bottom to first
    doc.moveElement(doc.body.children[0].children[1].ref, parentRef, 0)
    expect(doc.toJSON()).eql({
      type: 'div',
      attr: { x: 'a' },
      style: { y: 'b' },
      children: [
        { type: 'div', attr: { x: 'a' }, children: [
          { type: 'text', attr: { value: 'Hello' }},
          { type: 'text', attr: { value: 'World' }}
        ] }
      ]
    })

    // move to other parent
    doc.moveElement(doc.body.children[0].children[1].ref, doc.body.ref, 0)
    expect(doc.toJSON()).eql({
      type: 'div',
      attr: { x: 'a' },
      style: { y: 'b' },
      children: [
        { type: 'text', attr: { value: 'World' }},
        { type: 'div', attr: { x: 'a' }, children: [
          { type: 'text', attr: { value: 'Hello' }}
        ] }
      ]
    })
  })
  it('removeElement (ref)', () => {
    initDoc(doc)
    expect(doc.toJSON()).eql(initDocJSON)

    // remove single element
    doc.removeElement(doc.body.children[0].children[0].ref)
    const singleResult = JSON.parse(JSON.stringify(initDocJSON))
    singleResult.children[0].children.splice(0, 1)
    expect(doc.toJSON()).eql(singleResult)

    // remove tree
    doc.removeElement(doc.body.children[0].ref)
    const treeResult = JSON.parse(JSON.stringify(initDocJSON))
    delete treeResult.children
    expect(doc.toJSON()).eql(treeResult)

    // remove non-existed element
    doc.removeElement('xxx')
    expect(doc.toJSON()).eql(treeResult)
  })
  it('updateAttrs (ref, attr)', () => {
    initDoc(doc)
    expect(doc.toJSON()).eql(initDocJSON)

    const ref = doc.body.children[0].ref

    // cover
    doc.updateAttrs(ref, { x: 'c' })
    const result = JSON.parse(JSON.stringify(initDocJSON))
    result.children[0].attr = { x: 'c' }
    expect(doc.toJSON()).eql(result)

    // add
    doc.updateAttrs(ref, { y: 'd' })
    result.children[0].attr = { x: 'c', y: 'd' }
    expect(doc.toJSON()).eql(result)

    // more than one attribute
    doc.updateAttrs(ref, { y: 'f', g: 'g' })
    result.children[0].attr = { x: 'c', y: 'f', g: 'g' }
    expect(doc.toJSON()).eql(result)
  })
  it('updateStyle (ref, style)', () => {
    initDoc(doc)
    expect(doc.toJSON()).eql(initDocJSON)
    const ref = doc.body.children[0].ref
    doc.updateStyle(ref, { color: '#000000' })
    const result = JSON.parse(JSON.stringify(initDocJSON))
    result.children[0].style = { color: '#000000' }
    expect(doc.toJSON()).eql(result)
  })
  it('addEvent (ref, type), removeEvent (ref, type)', () => {
    const result = JSON.parse(JSON.stringify(initDocJSON))
    initDoc(doc)
    expect(doc.toJSON()).eql(result)
    const ref = doc.body.children[0].ref
    doc.addEvent(ref, 'click')
    result.children[0].event = ['click']
    expect(doc.toJSON()).eql(result)
    doc.addEvent(ref, 'click')
    expect(doc.toJSON()).eql(result)
    doc.addEvent(ref, 'x')
    result.children[0].event = ['click', 'x']
    expect(doc.toJSON()).eql(result)
    doc.removeEvent(ref, 'x')
    result.children[0].event = ['click']
    expect(doc.toJSON()).eql(result)
    doc.removeEvent(ref, 'click')
    delete result.children[0].event
    expect(doc.toJSON()).eql(result)
  })
})

describe('Element Class', () => {
  before(() => {
    sinon.stub(console, 'error')
  })
  after(() => {
    console.error.restore()
  })

  it('create by constructor', () => {
    const el = new Element({ ref: 'x', parentRef: 'y', type: 'text' })
    expect(el.ref).is.an.string
    expect(el.parentRef).is.an.string
    expect(el.type).is.an.string
    expect(el.attr).is.an.object
    expect(el.style).is.an.object
    expect(el.event).is.an.array
    expect(el.children).is.an.array
    expect(el._listeners).is.an.array
  })
  it('$addListener (doc, handler), $update(doc, changes)', () => {
    const doc = new Document('foo', 'https://github.com/')
    initDoc(doc)
    expect(doc.toJSON()).eql(initDocJSON)
    const el = doc.body.children[0]
    const spy = sinon.spy()
    const childSpy = sinon.spy()
    const parentSpy = sinon.spy()

    el.$addListener(doc, spy)
    doc.body.$addListener(doc, parentSpy)
    el.children[0].$addListener(doc, childSpy)

    expect(el._listeners.length).eql(1)
    expect(doc.body._listeners.length).eql(1)
    expect(el.children[0]._listeners.length).eql(1)
    expect(el._listeners[0]).equal(spy)

    expect(spy.args.length).eql(0)
    expect(parentSpy.args.length).eql(0)
    expect(childSpy.args.length).eql(0)

    // updateAttrs/updateStyle/addEvent/removeEvent
    doc.updateAttrs(el.ref, { x: 'c' })
    expect(spy.args.length).eql(1)
    expect(spy.args[0]).eql(['1', { attr: { x: 'c' }}])
    expect(parentSpy.args[0]).eql(['1', { attr: { x: 'c' }}])
    doc.updateAttrs(el.ref, { x: 'c' })
    expect(spy.args.length).eql(2)
    expect(spy.args[1]).eql(['1', { attr: { x: 'c' }}])
    doc.updateStyle(el.ref, { x: 'c' })
    expect(spy.args.length).eql(3)
    expect(spy.args[2]).eql(['1', { style: { x: 'c' }}])
    doc.addEvent(el.ref, 'click')
    expect(spy.args.length).eql(4)
    expect(spy.args[3]).eql(['1', { addEvent: 'click' }])
    doc.removeEvent(el.ref, 'click')
    expect(spy.args.length).eql(5)
    expect(spy.args[4]).eql(['1', { removeEvent: 'click' }])
    expect(parentSpy.args.length).eql(5)
    expect(childSpy.args.length).eql(0)

    // addElement/moveElement/removeElement
    doc.addElement(doc.body.children[0].ref, { ref: '11', type: 'text' }, -1)
    expect(spy.args.length).eql(6)
    expect(parentSpy.args.length).eql(6)
    expect(spy.args[5]).eql(['1', { addElement: { ref: '11', type: 'text' }, index: -1 }])
    expect(parentSpy.args[5]).eql(['1', { addElement: { ref: '11', type: 'text' }, index: -1 }])
    doc.addElement(doc.body.children[0].ref, { ref: '12', type: 'div', children: [{ ref: '13', type: 'text' }] }, -1)
    expect(spy.args.length).eql(7)
    expect(parentSpy.args.length).eql(7)
    expect(spy.args[6]).eql([
      '1',
      {
        addElement: {
          ref: '12', type: 'div',
          children: [{ ref: '13', type: 'text' }]
        },
        index: -1
      }
    ])
    const parentRef = doc.body.children[0].ref
    const removedRef = doc.body.children[0].children[3].ref
    const movedRef = doc.body.children[0].children[2].ref
    doc.removeElement(removedRef)
    expect(spy.args.length).eql(8)
    expect(spy.args[7]).eql([parentRef, { removeElement: removedRef }])
    expect(childSpy.args.length).eql(0)
    expect(parentSpy.args.length).eql(8)
    doc.moveElement(parentRef, movedRef, 0)
    expect(spy.args.length).eql(8)
    expect(childSpy.args.length).eql(0)
    expect(parentSpy.args.length).eql(8)
    doc.moveElement(movedRef, parentRef, 0)
    expect(spy.args.length).eql(9)
    expect(spy.args.length).eql(9)
  })
})
