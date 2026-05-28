const { Router } = require('express');
const openapiDocument = require('../docs/openapi');

const routes = Router();

const buildOpenapiDocument = (req) => {
  const baseUrl = String(req.baseUrl || '');
  const appBasePath = baseUrl.endsWith('/api') ? baseUrl.slice(0, -4) : '';
  const publicBasePath = String(process.env.PUBLIC_API_BASE_PATH || '').trim();
  const normalizedPublicBasePath = publicBasePath
    ? `/${publicBasePath.replace(/^\/+/, '').replace(/\/+$/, '')}`
    : '';
  const serverPath = normalizedPublicBasePath || appBasePath || '/';

  return {
    ...openapiDocument,
    servers: [
      {
        url: serverPath,
        description: normalizedPublicBasePath || appBasePath ? 'Origen desplegado' : 'Origen local',
      },
    ],
  };
};

routes.get('/openapi.json', (req, res) => {
  res.status(200).json(buildOpenapiDocument(req));
});

routes.get('/docs', (req, res) => {
  res.status(200).send(`
    <!doctype html>
    <html lang="es">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>KitchenFlow API Docs</title>
        <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
      </head>
      <body>
        <div id="swagger-ui"></div>
        <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
        <script>
          window.onload = () => {
            window.ui = SwaggerUIBundle({
              url: 'openapi.json',
              dom_id: '#swagger-ui'
            });
          };
        </script>
      </body>
    </html>
  `);
});

module.exports = routes;
