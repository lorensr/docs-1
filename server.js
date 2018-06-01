const next = require('next')
const qs = require('querystring')
const url = require('url')
const LRUCache = require('lru-cache')

const ssrCache = new LRUCache({
  max: 500
})

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

function removeEndSlash(fn) {
  return (req, res) => {
    const parsedUrl = url.parse(req.url, true)
    const isNext = parsedUrl.path.includes('/_next/')
    if (isNext) return fn(req, res, parsedUrl)

    if (parsedUrl.path !== '/' && parsedUrl.path.slice(-1) === '/') {
      const q = qs.stringify(parsedUrl.query)
      res.writeHead(301, {
        Location: parsedUrl.path.slice(0, -1) + (q ? '?' + q : '')
      })
      res.end()
      return
    }

    return fn(req, res, parsedUrl)
  }
}

function setAssetPrefixByHost(fn) {
  return (req, res) => {
    if (req.headers.host === 'docs.zeit.sh') {
      // Set the cloudinary custom origin which points to https://docs.zeit.sh
      app.setAssetPrefix('https://assets.zeit.co/raw/upload/docs-assets')
    } else if (/localhost/.test(req.headers.host)) {
      // Set the assetPrefix for localhost
      // It needs to be the http version
      app.setAssetPrefix(`http://${req.headers.host}`)
    } else {
      // Set the assetPrefix for now
      // It needs to be the https version, since now is always HTTPS
      app.setAssetPrefix(`https://${req.headers.host}`)
    }

    return fn(req, res)
  }
}

async function main(req, res, parsedUrl) {
  if (req.url === '/') {
    res.writeHead(301, {
      Location: '/docs'
    })
    res.end()
    return
  }

  const cacheKey = `prefix:${app.renderOpts.assetPrefix} path:${req.url}`
  const isNext = parsedUrl.path.includes('/_next/')

  if (dev || (req.headers.cookie || '').includes('token=') || isNext) {
    return handle(req, res, parsedUrl)
  }

  if (ssrCache.has(cacheKey)) {
    return ssrCache.get(cacheKey)
  }

  try {
    const html = await app.renderToHTML(
      req,
      res,
      parsedUrl.pathname,
      parsedUrl.query
    )
    ssrCache.set(cacheKey, html, Infinity)
    console.log(`CACHE MISS: ${parsedUrl.pathname}`) // eslint-disable-line no-console

    return html
  } catch (err) {
    await app.renderError(err, req, res, parsedUrl.pathname, parsedUrl.query)
  }
}

async function setup(handler) {
  await app.prepare()
  return setAssetPrefixByHost(removeEndSlash(handler))
}

module.exports = setup(main)
