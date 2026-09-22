const routes = [
  '/',
  '/control-room',
  '/operations',
  '/safety',
  '/family',
  '/witness',
  '/transport',
  '/help-desk',
  '/volunteer',
  '/citizen'
];

async function verifyAll() {
  console.log('Testing HTTP endpoints on http://localhost:3000...');
  let ok = true;
  for (const r of routes) {
    try {
      const res = await fetch(`http://localhost:3000${r}`);
      const text = await res.text();
      console.log(`  [HTTP ${res.status}] ${r} (${text.length} bytes)`);
      if (res.status !== 200) ok = false;
    } catch (e) {
      console.error(`  [FAILED] ${r}:`, e.message);
      ok = false;
    }
  }
  if (!ok) {
    console.error('One or more routes failed!');
    process.exit(1);
  } else {
    console.log('ALL ROUTES RETURNED HTTP 200 OK!');
  }
}

verifyAll();
