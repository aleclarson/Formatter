
{ throwFailure } = require "failure"

assertType = require "assertType"
fromArgs = require "fromArgs"
Validator = require "Validator"
Tracer = require "tracer"
isType = require "isType"
steal = require "steal"
Type = require "Type"

formatObject = require "./formatObject"
formatValue = require "./formatValue"
Formatting = require "./Formatting"

type = Type "Formatter", (value, options = {}) ->
  @_tracer = Tracer "Formatter::call()"
  try @_format value, options
  catch error then throwFailure error, stack: @_tracer()

type.optionTypes =
  colors: Object.Maybe

type.defineValues

  _colors: fromArgs "colors"

  _tracer: null

type.defineMethods

  _format: (value, options) ->

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

module.exports = type.build()
