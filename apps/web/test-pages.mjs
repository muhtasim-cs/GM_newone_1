const urls = [
  '/',
  '/deals',
  '/payments',
  '/blockchain',
  '/portfolio',
  '/investments',
  '/dashboard',
  '/farmers',
  '/farms',
  '/projects',
  '/about',
  '/explore',
  '/login',
  '/register',
];

async function checkAll() {
  console.log('Testing Next.js routes on http://localhost:3000...\n');
  for (const path of urls) {
    const start = Date.now();
    try {
      const res = await fetch(`http://localhost:3000${path}`, { method: 'GET' });
      const elapsed = Date.now() - start;
      console.log(`[${res.status}] ${path} (${elapsed}ms)`);
    } catch (err) {
      console.log(`[ERR] ${path}: ${err.message}`);
    }
  }
}

checkAll();
