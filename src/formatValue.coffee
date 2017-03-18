
stripAnsi = require "strip-ansi"
isNodeJS = require "isNodeJS"
getType = require "getType"
Null = require "Null"
Void = require "Void"
Nan = require "Nan"

module.exports = (value) ->
  type = getType value
  for { test, format } in formatters
    if test.call this, value, type or {}
      format.call this, value, type
      return yes
  return no

formatters = []

formatters.push
  test: (value) -> not value?
  format: (value) ->
    @push "yellow.dim", "" + value

formatters.push
  test: (_, type) -> type is String
  format: (value) ->

    # Strip out color codes.
    value = stripAnsi value

    # Support a maximum string length.
    isTruncated = @depth and value.length > @maxStringLength
    if isTruncated then value = value.slice 0, @maxStringLength

    # Print the opening quotation.
    @push "green", "\""

    # Respect line breaks.
    for line, i in value.split @ln
      line = "\\n" + line if i > 0
      @push "green", line

    # Truncated strings have an ellipsis appended.
    if isTruncated
      @push "cyan", "..."

    # Print the closing quotation.
    @push "green", "\""

formatters.push
  test: (_, type) -> (type is Boolean) or (type is Number)
  format: (value) ->
    @push "yellow", "" + value

formatters.push
  test: (_, type) -> type is Nan
  format: ->
    @push "red.dim", "NaN"

formatters.push
  test: (_, type) -> type.name is "Date"
  format: (value) ->

    @push "green.dim.bold", "Date "

    # Print the opening brace.
    @push "green.dim", "{ "

    # Convert the Date to a string.
    @push "yellow", value.toString()

    # Print the closing brace.
    @push "green.dim", " }"

formatters.push
  test: (_, type) -> type is RegExp
  format: (value) ->

    @push "green.dim.bold", "RegExp "

    # Print the opening brace.
    @push "green.dim", "{ "

    # Convert the RegExp to a string.
    @push "yellow", "/" + value.source + "/"

    # Print the closing brace.
    @push "green.dim", " }"

formatters.push
  test: (_, type) -> isNodeJS and (type is Buffer)
  format: (value) ->

    @push "green.dim.bold", "Buffer "

    # Print the opening brace.
    @push "green.dim", "{ "

    # Print the 'length' key.
    @push "length"

    # Print the key's semicolon.
    @push "gray.dim", ": "

    # Print the value of 'length'.
    @push "yellow", "" + value.length

    # Print the closing brace.
    @push "green.dim", " }"

formatters.push
  test: (value) -> value is Object.prototype
  format: ->
    @push "green.dim.bold", "Object.prototype "
    @push "green.dim", "{}"

formatters.push
  test: (value) -> value is Array
  format: ->
    @push "green.dim.bold", "Array "
    @push "green.dim", "[]"
