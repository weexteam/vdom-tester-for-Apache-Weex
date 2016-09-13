function toast (instance, document, options) {
  const { message, duration } = options || {}
  setTimeout(_ => {
    console.log(`[toast] ${instance.id} ${message}`)
  }, (duration || 0) * 1000)
}

function alert (instance, document, options, funcId) {
  const { message, okTitle } = options || {}
  setTimeout(_ => {
    console.log(`[alert] ${instance.id} ${okTitle} for ${message}`)
    instance.$callback(funcId, null, true)
  }, 1000)
}

function confirm (instance, document, options, funcId) {
  const { message, okTitle, cancelTitle } = options || {}
  setTimeout(_ => {
    console.log(`[confirm] ${instance.id} ${okTitle} ${cancelTitle} for ${message}`)
    instance.$callback(funcId, { result: okTitle }, true)
  }, 1000)
}

function prompt (instance, document, options, funcId) {
  const { message, okTitle, cancelTitle } = options || {}
  setTimeout(_ => {
    console.log(`[prompt] ${instance.id} ${okTitle} ${cancelTitle} for ${message}`)
    instance.$callback(funcId, { result: okTitle, data: 'Hello World!' }, true)
  }, 1000)
}

exports.toast = toast
exports.alert = alert
exports.confirm = confirm
exports.prompt = prompt
