const {compileFile} = require('pug')
const {createServer} = require('http')
const db = require('schema-db')
const {parse} = require('querystring')
const {resolve} = require('path')
const {readFile} = require('fs')

function template(name, variables) {
  if (!template.cache) {
    template.cache = {}
  }
  if (!template.cache[name]) {
    template.cache[name] = compileFile(resolve(__dirname + `/template/${name}.pug`), {
      basedir: resolve(__dirname + '/template'),
      pretty: true
    })
  }
  return template.cache[name](variables)
}

class Elka {
  constructor(options = {}) {
    Object.assign(this, options)
    if (!this.http) {
      const server = createServer(function (req, res) {
        if ('/favicon.ico' === req.url) {
          res.writeHead(302, {
            location: 'https://help.ubuntu.com/favicon.ico'
          })
          return res.end()
        }
        db.lord(req, res, function () {
          const file = /\/elka\.(js|css)/.exec(req.url)
          let mime = 'text/html'
          if (file) {
            if ('fs' === file[1]) {
              mime = 'application/javascript'
            }
            if ('css' === file[1]) {
              mime = 'text/css'
            }
          }
          res.setHeader('content-type', mime + '; charset=utf-8')
          const path = /\/elka\/([\w_]+)/.exec(req.url)
          if (file) {
            readFile(__dirname + '/public' + req.url, function (err, content) {
              res.end(content)
            })
          }
          else if ('/elka' === req.url) {
            res.end(template('index', {
              entities: Object.keys(db.entities)
            }))
          }
          else if (path && path[1] in db.entities) {
            const entity = db.entities[path[1]]
            const params = parse(req.url.split('?').slice(1).join('?'))
            entity
              .read(params)
              .then(function (rows) {
                res.end(template('table', {
                  name: entity.name,
                  params,
                  rows
                }))
              })
              .catch(db.responseError(res))
          }
          else {
            res.statusCode = 400
            res.end(template('error', {title: path ? `Entity ${path[1]} not exists` : 'Bad Request'}))
          }
        })
      })
      this.http = server
    }
  }
}

if (module.parent) {
  module.exports = db
  db.Elka = Elka
}
else {
  db.loadSchema().then(function () {
    const {port, report} = require('./config')
    const server = new Elka()
    server.http.listen(port, function () {
      if (report) {
        console.log()
      }
      console.log(`Elka is listen at http://localhost:${port}/elka`)
    })
  })
}
