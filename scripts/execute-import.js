/**
 * Script pour exécuter les fichiers SQL combinés via l'API Supabase
 * Utilise l'endpoint RPC pour exécuter du SQL brut
 */

import fs from 'fs';
import { config } from 'dotenv';
config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function executeBatch(sqlContent, batchNum) {
  // Utiliser l'API REST directement avec POST /rest/v1/bible_verses
  // Parser le SQL pour extraire les valeurs
  const valuesMatch = sqlContent.match(/VALUES (.+) ON CONFLICT/s);
  if (!valuesMatch) {
    throw new Error('Format SQL invalide');
  }

  const valuesStr = valuesMatch[1];
  const valueTuples = valuesStr.split('),(');

  const records = valueTuples.map(tuple => {
    // Nettoyer et parser chaque tuple
    const cleanTuple = tuple.replace(/^\(|\)$/g, '').replace(/,$/, '');
    const parts = cleanTuple.match(/'(?:[^'\\]|\\.)*'|\d+/g);

    if (!parts || parts.length < 6) return null;

    return {
      book_id: parts[0].replace(/^'|'$/g, '').replace(/''/g, "'"),
      book_slug: parts[1].replace(/^'|'$/g, '').replace(/''/g, "'"),
      chapter: parseInt(parts[2]),
      verse: parseInt(parts[3]),
      text: parts[4].replace(/^'|'$/g, '').replace(/''/g, "'"),
      translation_id: parts[5].replace(/^'|'$/g, '').replace(/''/g, "'")
    };
  }).filter(r => r !== null);

  // Diviser en lots de 500 pour l'API REST
  const batchSize = 500;
  const batches = [];

  for (let i = 0; i < records.length; i += batchSize) {
    batches.push(records.slice(i, i + batchSize));
  }

  console.log(`   📦 Batch ${batchNum}: ${records.length} versets en ${batches.length} sous-lots`);

  let success = 0;
  let errors = 0;

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];

    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/bible_verses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Prefer': 'resolution=ignore-duplicates'
        },
        body: JSON.stringify(batch)
      });

      if (response.ok) {
        success += batch.length;
      } else {
        const error = await response.text();
        console.log(`      ⚠️  Sous-lot ${i+1}/${batches.length}: ${response.status} - ${error.substring(0, 100)}`);
        errors += batch.length;
      }
    } catch (err) {
      console.log(`      ❌ Sous-lot ${i+1}/${batches.length}:`, err.message);
      errors += batch.length;
    }
  }

  return { success, errors };
}

async function main() {
  console.log("📖 Exécution de l'import des versets de la Bible...\n");

  const combinedFiles = fs.readdirSync('.')
    .filter(f => f.startsWith('combined-batch-') && f.endsWith('.sql'))
    .sort();

  console.log(`📊 ${combinedFiles.length} fichiers à traiter\n`);

  let totalSuccess = 0;
  let totalErrors = 0;

  for (let i = 0; i < combinedFiles.length; i++) {
    const file = combinedFiles[i];
    const batchNum = i + 1;

    process.stdout.write(`\r[${batchNum}/${combinedFiles.length}] ${file}...`);

    const sqlContent = fs.readFileSync(file, 'utf-8');
    const result = await executeBatch(sqlContent, batchNum);

    totalSuccess += result.success;
    totalErrors += result.errors;

    if (batchNum % 5 === 0 || batchNum === combinedFiles.length) {
      console.log(`\n   ✅ ${result.success} versets insérés, ${result.errors} erreurs`);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('✨ Import terminé!');
  console.log(`   ✅ Succès: ${totalSuccess} versets`);
  console.log(`   ❌ Erreurs: ${totalErrors} versets`);
  console.log('='.repeat(60));
}

main().catch(console.error);
