# weex-vdom-tester

Virtual-DOM test driver for Weex.

## Usage

### Weex JS runtime APIs

```javascript
import {
  Runtime,
  DEFAULT_MODULES,
  DEFAULT_COMPONENTS
} from 'weex-vdom-tester'

// Create a Weex JavaScript runtime for a certain Weex JS framework.
const runtime = new Runtime(jsFramework, {
  // modules: DEFAULT_MODULES,
  // components: DEFAULT_COMPONENTS
})

// Listen `nativeLog` calls.
runtime.onlog((type, args) => { ... })
runtime.onlog(type, (args) => { ... })
runtime.offlog((args) => { ... })

// Register more modules and components.
runtime.registerModules({
  x: {
    foo: (instance, document, ...args) => {},
    bar: (instance, document, ...args) => {}
  }
})
runtime.registerComponents([
  x: { type: 'x', append: true }
])
```

### Weex instance APIs

```javascript
import { Instance } from 'weex-vdom-tester'

// Create a Weex instance in a certain runtime.
// The `runtime` parameter is optional.
const instance = new Instance(runtime)

// Send commands to Weex JS runtime about this instance.
instance.$create(code, config, data)
instance.$refresh(data)
instance.$destroy()
instance.$fireEvent(element, type, detail)
instance.$callback(callbackId, detail, isLast)
instance.$getRoot()

// Listen `callNative` from Weex JS runtime.
// The module API would always run even you don't listen it.
instance.oncall(moduleName, (methodName, args) => { ... })
instance.oncall(moduleName, methodName, (args) => { ... })
instance.oncall((moduleName, methodName, args) => { ... })

// Mock default behavior of module APIs
instance.mockModuleAPI(
  moduleName, methodName,
  (instance, document, originFunc, ...args) => { ... })

// Get JSON object from the real instance document.
instance.getRealRoot()

// Watch changes of a certain element or its children.
// The default element is the root.
instance.watchDOMChanges((target, changes) => { ... })
instance.watchDOMChanges(element, (target, changes) => { ... })

// The history of `callNative` and `callJS`
instance.history.callNative[{ timestamp, module, method, args }]
instance.history.callJS[{ timestamp, method, args }]
instance.history.refresh[{ timestamp, data }]

// Control the connection status to Weex JS runtime.
instance.play()
instance.pause()
```
