const http = require('http');

const ROUTES = [
  '/',
  '/cadastro',
  '/dashboard',
  '/foto',
  '/imagem',
  '/descricao',
  '/branding',
  '/materiais',
  '/pagina',
  '/avaliacoes',
  '/instagram',
  '/promocoes',
  '/anuncios',
  '/planos',
  '/tutorial',
  '/conta',
  '/empresa',
  '/admin/assinaturas',
];

async function checkRoute(route) {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:8080${route}`, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          route,
          status: res.statusCode,
          hasContent: data.length > 500,
          title: data.match(/<title>(.*?)<\/title>/)?.[1] || 'Sem título',
        });
      });
    });

    req.on('error', (err) => {
      resolve({
        route,
        status: 'ERROR',
        error: err.message,
      });
    });

    req.setTimeout(5000, () => {
      req.abort();
      resolve({
        route,
        status: 'TIMEOUT',
      });
    });
  });
}

async function run() {
  console.log('--- INICIANDO AUDITORIA DE ROTAS E FORMULÁRIOS ---');
  const results = [];
  for (const route of ROUTES) {
    const res = await checkRoute(route);
    results.push(res);
    console.log(`[${res.status}] ${res.route} - ${res.title || res.error || ''}`);
  }

  const allPassed = results.every((r) => r.status === 200);
  console.log('--- RESULTADO ---');
  console.log(`Total de rotas verificadas: ${results.length}`);
  console.log(`Rotas com status 200 OK: ${results.filter((r) => r.status === 200).length}`);
  console.log(`Rotas com falha: ${results.filter((r) => r.status !== 200).length}`);
}

run();
