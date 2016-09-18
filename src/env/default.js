/* eslint-disable */

const DEFAULT_MODULES = [{
  "dom": [
    "addEvent",
    "removeElement",
    "updateFinish",
    "scrollToElement",
    "updateAttrs",
    "addElement",
    "createFinish",
    "createBody",
    "updateStyle",
    "removeEvent",
    "refreshFinish",
    "moveElement"
  ]
},
{
  "navigator": [
    "push",
    "setNavBarLeftItem",
    "clearNavBarMoreItem",
    "close",
    "clearNavBarRightItem",
    "setNavBarTitle",
    "setNavBarBackgroundColor",
    "setNavBarMoreItem",
    "clearNavBarLeftItem",
    "clearNavBarTitle",
    "pop",
    "setNavBarRightItem"
  ]
},
{
  "stream": [
    "sendHttp",
    "fetch"
  ]
},
{
  "animation": [
    "transition"
  ]
},
{
  "modal": [
    "alert",
    "toast",
    "prompt",
    "confirm"
  ]
},
{
  "webview": [
    "addEvent",
    "removeElement",
    "updateFinish",
    "scrollToElement",
    "updateAttrs",
    "goBack",
    "addElement",
    "goForward",
    "createFinish",
    "createBody",
    "updateStyle",
    "removeEvent",
    "reload",
    "refreshFinish",
    "notifyWebview",
    "moveElement"
  ]
},
{
  "instanceWrap": [
    "refresh",
    "error"
  ]
},
{
  "timer": [
    "clearInterval",
    "setTimeout",
    "clearTimeout",
    "setInterval"
  ]
},
{
  "storage": [
    "getItem",
    "setItem",
    "length",
    "removeItem",
    "getAllKeys"
  ]
},
{
  "clipboard": [
    "setString",
    "getString"
  ]
},
{
  "event": [
    "openURL"
  ]
}]

const DEFAULT_COMPONENTS = [
  "container",
  "div",
  "text",
  "image",
  "scroller",
  "list",
  { "append": "tree", "type": "header" },
  { "append": "tree", "type": "cell" },
  { "append": "tree", "type": "embed" },
  { "append": "tree", "type": "a" },
  { "append": "tree", "type": "switch" },
  { "type": "input" }, // append: tree
  { "append": "tree", "type": "video" },
  { "append": "tree", "type": "indicator" },
  { "append": "tree", "type": "slider" },
  { "append": "tree", "type": "web" },
  { "append": "tree", "type": "loading" },
  { "append": "tree", "type": "loading-indicator" },
  { "append": "tree", "type": "refresh" },
  { "append": "tree", "type": "textarea" }
]

const DEFAULT_ENV = {
  "scale": 2,
  "appVersion": "1.8.3",
  "deviceModel": "x86_64",
  "appName": "WeexDemo",
  "platform": "iOS",
  "osVersion": "9.3",
  "weexVersion": "0.7.0",
  "deviceHeight": 1334,
  "logLevel": "log",
  "deviceWidth": 750
}

exports.DEFAULT_MODULES = DEFAULT_MODULES
exports.DEFAULT_COMPONENTS = DEFAULT_COMPONENTS
exports.DEFAULT_ENV = DEFAULT_ENV
