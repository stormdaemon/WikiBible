/**
 * Script pour exécuter l'import SQL par lots via MCP Supabase
 * Ce script génère un fichier de commandes MCP qui sera exécuté
 */

const fs = require('fs');
const path = require('path');

function main() {
  console.log('📖 Préparation de l''import par lots...\n');

  const batchFiles = fs.readdirSync('.')
    .filter(f => f.startsWith('bible-import-batch-'))
    .sort();

  console.log(`📊 ${batchFiles.length} fichiers batch trouvés\n`);

  // Créer un script shell qui exécute chaque fichier via psql
  const shellScript = batchFiles.map((file, i) => {
    return `echo "Batch ${i + 1}/${batchFiles.length}: ${file}"\ncat ${file}`;
  }).join('\n');

  fs.writeFileSync('execute-all-batches.sh', shellScript);

  console.log('✅ Script généré: execute-all-batches.sh');
  console.log(`\n💡 Chaque batch peut être exécuté via le MCP Supabase`);
}

main();
