
PureObject = require "PureObject"
assertType = require "assertType"
Validator = require "Validator"
KeyMirror = require "keymirror"
hasKeys = require "hasKeys"
getKind = require "getKind"
getType = require "getType"
isType = require "isType"
Kind = require "Kind"
Type = require "Type"

formatValue = require "./formatValue"

module.exports =
formatObject = (obj, isCollapsed = no) ->

  type = getType obj
  if type isnt PureObject
    formatType.call this, obj, type

  if not hasKeys obj
    @push "green.dim", if type is Array then "[]" else "{}"
    return

  @push "green.dim", if type is Array then "[" else "{"

  maxKeys = if type is Array then @maxArrayKeys else @maxObjectKeys

  if not isCollapsed
    isCollapsed = (maxKeys is 0) or (@depth >= @maxObjectDepth)

  if isCollapsed
    @push "cyan", " ... "
  else
    @push if @compact then " " else @ln
    @depth += 1
    formatKeys.call this, obj, maxKeys
    @depth -= 1
    @push " " if @compact

  @push "green.dim", if type is Array then "]" else "}"

formatType = (obj, type) ->

  assertType type, [ Function.Kind, Kind(Validator) ]

  name = type.getName()

  # Print prototypes correctly.
  if obj is type.prototype
    return if not name
    @push "green.dim.bold", name + ".prototype "

  # Print functions like their 'toString' representations, but without the code.
  else if type is Function
    regex = /^function\s*([^\(]*)\(([^\)]*)\)/
    regex.results = regex.exec obj.toString()
    @push "green.dim", "function " + regex.results[1] + "(" + regex.results[2] + ") "

  # Print types with their names visible.
  else if (type is Type) or (type.prototype instanceof Type)
    objName = obj.getName()
    return if not objName
    @push "green.dim.bold", objName + ".constructor "

  # Print the type name.
  else if name and name.length
    @push "green.dim.bold", name + " "

  return

formatKeys = (obj, maxKeys) ->

  assertType maxKeys, Number

  isRoot = @keyPath is ""

  if isRoot and @showHidden
    keys = KeyMirror Object.getOwnPropertyNames obj
    keys._remove "prototype", "constructor"
  else keys = KeyMirror Object.keys obj

  if isRoot and @showInherited
    inherited = findInherited.call this, obj

  hasInherited = inherited and inherited.count

  if isType obj, Array
    keys._add "length"

  else if isType obj, Error.Kind
    keys._add "code", "message"

  if keys._length is 0
    return if not hasInherited

  isTruncated = no
  totalKeys = keys._length
  maxKeys = Math.max 0, maxKeys
  if keys._length > maxKeys
    isTruncated = yes
    keys._length = maxKeys
    keys._keys = keys._keys.slice 0, maxKeys

  @objects.push obj
  @keyPaths.push @keyPath

  for key, index in keys._keys
    formatKey.call this, obj, key
    if not @compact
      @push @ln
    else if index < (totalKeys - 1)
      @push ", "

  if isTruncated
    @push "cyan", "..."
    @push @ln if not @compact

  if hasInherited
    formatInherited.call this, inherited.values
    @push @ln if not @compact

  return

formatKey = (obj, key) ->

  @push key
  @push "gray.dim", ": "

  if @avoidGetters
    desc = Object.getOwnPropertyDescriptor obj, key
    if desc.get
      @push "gray.dim", if desc.set then "{ get, set }" else "{ get }"
      return
    value = obj[key]

  else
    try value = obj[key]
    catch error
      @push "red", error.message
      return

  return if formatValue.call this, value
  return if formatDuplicate.call this, value

  oldValue = @keyPath
  @keyPath += "." if @keyPath.length
  @keyPath += key

  isCollapsed = @collapse value, key, obj
  formatObject.call this, value, isCollapsed

  @keyPath = oldValue
  return

formatInherited = (values) ->

  @push "green.dim.bold", "inherited "

  oldValue = @showInherited
  @showInherited = no
  formatObject.call this, values
  @showInherited = oldValue
  return

findInherited = (obj) ->

  count = 0
  values = Object.create null

  type = getType obj
  loop
    prototype = type.prototype
    if prototype
      for key in Object.getOwnPropertyNames prototype
        continue if key is "constructor"
        continue if key is "__proto__"
        continue if has values, key
        continue if has obj, key
        values[key] = prototype[key]
        count += 1

    type = getKind type
    break if not type

  return { count, values }

formatDuplicate = (obj) ->
  index = @objects.indexOf obj
  return no if index < 0
  keyPath = @keyPaths[index]
  @push "cyan", if keyPath.length then "this." + keyPath else "this"
  return yes
