import { lstat, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { hostname, platform } from 'node:os';
import { join, resolve } from 'node:path';

const PREFIX = '[diagnostic-irenee]';
const SKIP = new Set([
  'node_modules', 'vendor', '.git', '.next', '.cache', '.npm', '.bun',
  '.ssh', '.aws', '.config', '.local', '.venv', 'venv', '__pycache__',
]);
const MARKERS = new Set(['package.json', 'composer.json', 'index.php', 'index.html']);
const quote = (value) => JSON.stringify(value);
const isSiteName = (value) => /irenee|institut|apolog/i.test(
  value.normalize('NFD').replace(/[\u0300-\u036f]/g, ''),
);

export async function inspectServerFolders({
  roots = ['/var/www', '/srv', '/opt', '/home', '/root', '/app', '/workspace', '/usr/src/app', process.cwd()],
  maxDepth = 5,
  maxDirectories = 2500,
  maxResults = 120,
  timeoutMs = 6000,
  log = console.log,
} = {}) {
  const emit = (message) => log(`${PREFIX} ${message}`);
  const started = Date.now();
  const seen = new Set();
  let visited = 0;
  let candidates = 0;
  let stopped = false;
  const queue = [...new Set(roots.map((root) => resolve(root)))].map((path) => ({ path, depth: 0 }));

  emit('DEBUT — recherche en lecture seule, aucun contenu de fichier affiché.');
  emit(`Hôte du build : ${quote(hostname())}; système : ${platform()}; dossier courant : ${quote(process.cwd())}`);
  if (existsSync('/.dockerenv') || existsSync('/run/.containerenv')) {
    emit('Conteneur détecté : les dossiers du VPS non montés ici ne sont pas visibles.');
  }

  // Breadth-first traversal checks every root before exploring deeper folders.
  for (let cursor = 0; cursor < queue.length; cursor += 1) {
    if (visited >= maxDirectories || candidates >= maxResults || Date.now() - started >= timeoutMs) {
      stopped = true;
      break;
    }
    const { path, depth } = queue[cursor];
    if (seen.has(path)) continue;
    seen.add(path);
    try {
      const stat = await lstat(path);
      if (stat.isSymbolicLink()) {
        if (depth === 0) emit(`Racine symbolique non parcourue : ${quote(path)}`);
        continue;
      }
      if (!stat.isDirectory()) continue;
      const entries = await readdir(path, { withFileTypes: true });
      visited += 1;
      const folders = entries.filter((entry) => entry.isDirectory() && !SKIP.has(entry.name) && !entry.name.startsWith('.'));
      const links = entries.filter((entry) => entry.isSymbolicLink() && !entry.name.startsWith('.'));
      const markers = entries.filter((entry) => entry.isFile() && MARKERS.has(entry.name)).map((entry) => entry.name);
      if (depth === 0) {
        emit(`Racine accessible : ${quote(path)}`);
        emit(`Sous-dossiers (maximum 25) : ${folders.slice(0, 25).map((entry) => quote(join(path, entry.name))).join(', ') || '(aucun)'}`);
      }
      if (isSiteName(path) || markers.length > 0) {
        candidates += 1;
        emit(`CANDIDAT : ${quote(path)} — ${isSiteName(path) ? 'nom lié à Irénée / institut / apologétique' : 'dossier de site ou application'}${markers.length ? `; fichiers repères : ${markers.join(', ')}` : ''}`);
      }
      if (depth === 0 || isSiteName(path)) {
        for (const entry of links.slice(0, 10)) {
          emit(`Lien symbolique non parcouru : ${quote(join(path, entry.name))}`);
        }
      }
      if (depth < maxDepth) {
        const remaining = Math.max(0, maxDirectories - queue.length);
        for (const entry of folders.slice(0, remaining)) {
          queue.push({ path: join(path, entry.name), depth: depth + 1 });
        }
        if (folders.length > remaining) stopped = true;
      }
    } catch (error) {
      if (depth === 0 || error.code !== 'ENOENT') {
        emit(`Dossier inaccessible : ${quote(path)} (${quote(error.code || 'ERREUR')})`);
      }
    }
  }
  emit(`FIN — ${visited} dossiers parcourus, ${candidates} candidats. Profondeur maximale : ${maxDepth}.${stopped ? ' Limite de recherche atteinte ; résultat partiel.' : ''}`);
  emit('La recherche porte uniquement sur le système de fichiers visible depuis ce build.');
  return { visited, candidates, stopped };
}

if (import.meta.main) {
  if (platform() !== 'linux') {
    console.log(`${PREFIX} Recherche VPS ignorée : ce build ne tourne pas sous Linux.`);
  } else {
    await inspectServerFolders().catch(() => {
      console.log(`${PREFIX} Diagnostic interrompu ; la compilation peut continuer.`);
    });
  }
}
