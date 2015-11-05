var util = require('util')
var fs = require('fs')
var AbstractLevelDown = require('abstract-leveldown').AbstractLevelDOWN
var open = require('leveldown-open')

function FsDown (location) {
  if (!(this instanceof FsDown)) {
    return new FsDown(location)
  }

  AbstractLevelDown.call(this, location)
  this._location = location
  this._keys = []
}

util.inherits(FsDown, AbstractLevelDown)

FsDown.prototype = {
  _open: function (options, callback) {
    open(this._location, options, function (err) {
      if (err) {
        return process.nextTick(function () { callback(err) })
      }
      var existingDB = fs.createReadStream(this._location + '/db.json')

      existingDB.on('error', function (err) {
        return process.nextTick(function () { callback(err) })
      })

      existingDB.on('data', function (chunk) {
        var data;
        try {
          data = JSON.parse(chunk.toString())
        } catch (err) {
          done()
        }

        this._keys.concat(Object.keys(data))
      })

      existingDB.on('close', function (err) {
        process.nextTick(function () { callback(null, this) }.bind(this))
      })
    }.bind(this))
  },

  _put: function (key, value, options, callback) {
    fs.readFile(this._location + '/db.json', function (err, content) {
      if (err) {
        return process.nextTick(function () { callback(err) })
      }
      var data = JSON.parse(content.toString())
      data[key] = value

      fs.writeFile(this._location + '/db.json', function (err) {
        if (err) {
          return process.nextTick(function () { callback(err) })
        }

        process.nextTick(callback)
      })
    })
  },

  _get: function (key, options, callback) {
    fs.readFile(this._location + '/db.json', function (err, content) {
      if (err) {
        return process.nextTick(function () { callback(err) })
      }

      var value = JSON.parse(content.toString())[key]
      if (value === undefined) {
        return process.nextTick(function () { callback(new Error('NotFound')) })
      }

      process.nextTick(function () {
        callback(null, value)
      })
    })
  },

  _del: function (key, options, callback) {
    fs.readFile(this._location + '/db.json', function (err, content) {
      if (err) {
        return process.nextTick(function () { callback(err) })
      }

      delete JSON.parse(content.toString())[key]
      process.nextTick(callback)
    })
  }
}

module.exports = FsDown
