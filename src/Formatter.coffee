
assertType = require "assertType"
isType = require "isType"
steal = require "steal"
Type = require "Type"

formatObject = require "./formatObject"
formatValue = require "./formatValue"
Formatting = require "./Formatting"

type = Type "Formatter", (value, options = {}) ->

  if isType options, String
    options = { label: options }
  else assertType options, Object

  raw = steal options, "raw", no
  label = steal options, "label"

  if @_colors and not options.hasOwnProperty "colors"
    options.colors = @_colors

  parts = Formatting options

  if label
    parts.push label

  if not formatValue.call parts, value
    formatObject.call parts, value

  parts = parts.flush()
  return parts if raw
  return parts.join ""

type.defineOptions
  colors: Object

type.defineValues (options) ->

  _colors: options.colors

module.exports = type.build()
