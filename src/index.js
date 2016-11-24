var fs = require('fs')
var http = require('http')
var resolve = require('path').resolve
var cp = require('cp-file').sync
var serveStatic = require('serve-static')

var GREEN_OPEN = '\u001B[32m'
var GREEN_CLOSE = '\u001B[39m'

var cwd = function (path) {
  return resolve(process.cwd(), path)
}
var pwd = function (path) {
  return resolve(__dirname, path)
}
var exist = function (path) {
  if (fs.existsSync(path)) {
    return path
  }
  return undefined
}
var replace = function (file, tpl, replace) {
  fs.writeFileSync(file, fs.readFileSync(file).toString().replace(tpl, replace), 'utf-8')
}

exports.init = function (path, option) {
  path = path || '.'
  var msg = `\nCreate succeed! Please run\n
> ${GREEN_OPEN}docsify serve ${path}${GREEN_CLOSE}\n`

  path = cwd(path)
  var target = function (file) {
    return resolve(path, file)
  }
  var readme = exist(cwd('README.md')) || pwd('template/README.md')
  var main = pwd('template/404.html')

  if (option.local) {
    main = pwd('template/404-local.html')

    var vendor = exist(cwd('node_modules/docsify')) || pwd('../node_modules/docsify')

    cp(resolve(vendor, 'lib/docsify.pack.min.js'), target('vendor/docsify.js'))
    cp(resolve(vendor, `themes/${option.theme}.css`), target(`vendor/themes/${option.theme}.css`))
  }

  cp(readme, target('README.md'))
  cp(main, target('404.html'))

  replace(target('404.html'), 'vue.css', `${option.theme}.css`)
  console.log(msg)
}

exports.serve = function (path, option) {
  path = path || '.'
  var main = resolve(path, '404.html')

  if (!exist(main)) {
    console.log(`\nNot found 404.html, please run ${GREEN_OPEN}init${GREEN_CLOSE} before.\n`)
    process.exit(0)
  }
  http.createServer(function (req, res) {
    serveStatic(path)(req, res, function () {
      res.writeHead(404, { 'Content-Type': 'text/html' })
      res.end(fs.readFileSync(main))
    })
  }).listen(option.port)

  console.log(`\nListening at ${GREEN_OPEN}http://localhost:${option.port}${GREEN_CLOSE}\n`)
}
