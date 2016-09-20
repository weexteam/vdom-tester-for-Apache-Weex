const chai = require('chai')
const sinon = require('sinon')
const sinonChai = require('sinon-chai')
const { expect } = chai
chai.use(sinonChai)

const { Document, Element } = require('../lib/document')

describe('Document Class', () => {
  let doc
  const basicConfig = {
    type: 'div',
    attr: { x: 'a' },
    style: { y: 'b' }
  }

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
    doc.createBody(basicConfig)
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
    doc.createBody(basicConfig)
    doc.addElement(
      doc.body.ref,
      { ref: '1', type: 'div', attr: { x: 'a' }, children: [{ ref: '2', type: 'text', attr: { value: 'Hello' }}]},
      -1)
    expect(doc.toJSON()).eql({
      type: 'div',
      attr: { x: 'a' },
      style: { y: 'b' },
      children: [
        { type: 'div', attr: { x: 'a' }, children: [{ type: 'text', attr: { value: 'Hello' }}]}
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
        ]}
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
        ]}
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
        ]}
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
        ]}
      ]
    })
  })
  it('moveElement (ref, parentRef, index)', () => {
    // todo
  })
  it('removeElement (ref)', () => {
    // todo
  })
  it('updateAttrs (ref, attr)', () => {
    // todo
  })
  it('updateStyle (ref, style)', () => {
    // todo
  })
  it('addEvent (ref, type)', () => {
    // todo
  })
  it('removeEvent (ref, type)', () => {
    // todo
  })
  it('toJSON ()', () => {
    // todo
  })
})
