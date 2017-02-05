
emptyFunction = require "emptyFunction"
repeatString = require "repeat-string"
assertType = require "assertType"
StrictMap = require "StrictMap"
isNodeJS = require "isNodeJS"
replace = require "replace"
isType = require "isType"
steal = require "steal"
Type = require "Type"
sync = require "sync"

NEWLINE = if isNodeJS then require("os").EOL else "\n"

type = Type "Formatting"

type.inherits StrictMap

type.createInstance do ->

  propTypes =
    maxStringLength: Number
    maxObjectDepth: Number
    maxObjectKeys: Number
    maxArrayKeys: Number
    showInherited: Boolean
    showHidden: Boolean

  propDefaults =
    maxStringLength: 60
    maxObjectDepth: 2
    maxObjectKeys: 30
    maxArrayKeys: 10
    showInherited: no
    showHidden: no

  return ->
    StrictMap propTypes
    .update propDefaults

type.defineArgs
  colors: Boolean.or Object
  compact: Boolean
  collapse: Function
  unlimited: Boolean
  avoidGetters: Boolean

type.defineValues

  ln: NEWLINE

  depth: 0

  keyPath: ""

  compact: (options) ->
    steal options, "compact", no

  collapse: (options) ->
    steal options, "collapse", emptyFunction.thatReturnsFalse

  avoidGetters: (options) ->
    steal options, "avoidGetters", no

  _parts: -> []

  _isIndented: no

type.defineFrozenValues

  keyPaths: -> []

  objects: -> []

  _colors: (options) ->
    steal options, "colors"

type.initInstance (options) ->

  if steal options, "unlimited"
    options.maxStringLength = Infinity
    options.maxObjectDepth = Infinity
    options.maxObjectKeys = Infinity
    options.maxArrayKeys = Infinity

  @freeze()
  @update options
  return

type.defineMethods

  # Append a styled message.
  push: (style, message) ->

    if arguments.length is 1
      message = style
      style = null

    else if @_colors and isType style, String
      styles = style.split "."
      applyStyle = sync.reduce styles, @_colors, (style, key) -> style[key]
      message = applyStyle message

    if not @compact

      if message is NEWLINE
        @_isIndented = no

      else if @depth and not @_isIndented
        @_isIndented = yes
        message = repeatString("  ", @depth) + message

    @_parts.push message
    return

  # Take the buffer contents, leave an empty buffer.
  flush: ->
    replace this, "_parts", []

module.exports = type.build()
