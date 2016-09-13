/**
 * @fileOverview dom module APIs
 */

class Document {
  constructor (id, URL) {
    this._id = id
    this._URL = URL
    this.refs = {}
    this.body = null
  }

  createBody (config) {
    const doc = this
    const body = this.body = new Element(config)
    this.refs._root = this.body
    if (config.children) {
      config.children.forEach(function (child) {
        appendToDoc(doc, child, body.ref, -1)
      })
    }
  }

  addElement (parentRef, config, index) {
    const parent = this.refs[parentRef]
    appendToDoc(this, config, parentRef, index)
    if (parent) {
      parent.$update(this, this, { addElement: config, index })
    }
  }

  moveElement (ref, parentRef, index) {
    const el = this.refs[ref]
    const oldParent = this.refs[el.parentRef]
    const oldIndex = oldParent.children.indexOf(el)

    const parent = this.refs[parentRef]

    if (parent === oldParent && oldIndex <= index) {
      index = index - 1
    }

    oldParent.children.splice(oldIndex, 1)
    parent.children.splice(index, 0, el)
    el.parentRef = parentRef

    if (oldParent) {
      oldParent.$update(this, { moveElement: ref, index })
    }
    if (parent && parent !== oldParent) {
      parent.$update(this, { movedElement: ref, index })
    }
  }

  removeElement (ref) {
    const parentRef = this.refs[ref].parentRef
    const parent = this.refs[parentRef]
    removeEl(this, ref)
    if (parent) {
      parent.$update(this, { removeElement: ref })
    }
  }

  updateAttrs (ref, attr) {
    const el = this.refs[ref]
    for (const i in attr) {
      el.attr = attr[i]
    }
    el.$update(this, { attr })
  }

  updateStyle (ref, style) {
    const el = this.refs[ref]
    for (const i in style) {
      el.style = style[i]
    }
    el.$update(this, { style })
  }

  addEvent (ref, type) {
    const el = this.refs[ref]
    const index = el.event.indexOf(type)
    if (index < 0) {
      el.event.push(type)
    }
    el.$update(this, { addEvent: type })
  }

  removeEvent (ref, type) {
    const el = this.refs[ref]
    const index = el.event.indexOf(type)
    if (index >= 0) {
      el.event.splice(index, 1)
    }
    el.$update(this, { removeEvent: type })
  }

  toJSON () {
    const body = this.refs._root
    if (body) {
      return body.toJSON()
    }
    return {}
  }
}

function appendToDoc (doc, config, parentRef, index) {
  const parent = doc.refs[parentRef]

  const el = new Element(config)
  doc.refs[el.ref] = el
  el.parentRef = parentRef

  if (index < 0) {
    parent.children.push(el)
  }
  else {
    parent.children.splice(index, 0, el)
  }

  if (config.children) {
    config.children.forEach(function (child) {
      appendToDoc(doc, child, el.ref, -1)
    })
  }
}

function removeEl (doc, ref) {
  const el = doc.refs[ref]
  const parent = doc.refs[el.parentRef]
  const index = parent.children.indexOf(el)
  const children = el.children || []
  parent.children.splice(index, 1)
  delete doc.refs[ref]
  children.forEach(function (child) {
    removeEl(doc, child.ref)
  })
}

class Element {
  constructor (config) {
    this.ref = config.ref
    this.parentRef = config.parentRef
    this.type = config.type
    this.attr = config.attr || {}
    this.style = config.style || {}
    this.event = config.event || []
    this.children = []
    this._listeners = []
  }

  toJSON () {
    const result = { type: this.type }
    if (Object.keys(this.attr).length > 0) {
      result.attr = this.attr
    }
    if (Object.keys(this.style).length > 0) {
      result.style = this.style
    }
    if (this.event.length > 0) {
      result.event = this.event
    }
    if (this.children.length > 0) {
      result.children = this.children.map(function (child) {
        return child.toJSON()
      })
    }

    return result
  }

  $update (doc, changes) {
    this._listeners.forEach(handler => handler(this, changes))
    const parentRef = this.parentRef
    const parent = doc.refs[parentRef]
    if (parent) {
      parent.$update(doc, changes)
    }
  }

  $addListener (doc, handler) {
    if (this._listeners.indexOf(handler) >= 0) {
      return
    }
    this.doc = doc
    this._listeners.push(handler)
  }
}

exports.Document = Document
exports.Element = Element
