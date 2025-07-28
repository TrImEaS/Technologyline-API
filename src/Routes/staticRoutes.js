const express = require('express')
const path = require('path')

function setupStaticRoutes (app, STATIC_BASE) {
  // ecommerce
  const ecommercePaths = [
    '/',
    '/search',
    '/products',
    '/cart',
    '/others',
    '/shipments',
    '/others/about_us',
    '/others/garantia',
    '/others/centros_de_ayuda',
    '/others/revendedores',
    '/login',
    '/myaccount',
    '/myaccount/profile',
    '/myaccount/orders'
  ]

  ecommercePaths.forEach(function (route) {
    app.use(route, express.static(STATIC_BASE, { maxAge: '1y' }))
  })

  // admin/page
  const adminPagePath = path.join(STATIC_BASE, 'admin/page')
  app.use('/admin/page', express.static(adminPagePath, { maxAge: '1y' }))
  app.get('/admin/page/*', function (req, res) {
    res.sendFile(path.join(adminPagePath, 'index.html'))
  })

  // admin/remitos
  const remitosPath = path.join(STATIC_BASE, 'admin/remitos')
  app.use('/admin/remitos', express.static(remitosPath, { maxAge: '1y' }))
  app.get('/admin/remitos/*', function (req, res) {
    res.sendFile(path.join(remitosPath, 'index.html'))
  })

  // QRGen-App
  const qrgenPath = path.join(STATIC_BASE, 'admin/QRGen-App/app')
  app.use('/admin/QRGen-App/app', express.static(qrgenPath, { maxAge: '1y' }))
  app.get('/admin/QRGen-App/app/*', function (req, res) {
    res.sendFile(path.join(qrgenPath, 'index.html'))
  })

  // 404 error
  app.get('*', function (req, res) {
    res.status(404).sendFile(path.join(STATIC_BASE, 'error.html'))
  })
}

module.exports = setupStaticRoutes
