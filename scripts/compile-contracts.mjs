import fs from 'node:fs';
import path from 'node:path';
import solc from 'solc';

const contractsDir = path.resolve('contracts/src');

function getAllSolFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      results = results.concat(getAllSolFiles(full));
    } else if (file.endsWith('.sol')) {
      results.push(full);
    }
  }
  return results;
}

const sources = {};
const allFiles = getAllSolFiles(contractsDir);
for (const file of allFiles) {
  const relPath = path.relative(contractsDir, file).replace(/\\/g, '/');
  sources[relPath] = { content: fs.readFileSync(file, 'utf8') };
}

const input = {
  language: 'Solidity',
  sources,
  settings: {
    viaIR: true,
    optimizer: { enabled: true, runs: 200 },
    outputSelection: {
      '*': {
        '*': ['abi', 'evm.bytecode.object'],
      },
    },
  },
};

console.log('Compiling contracts with solc', solc.version(), '...');
const output = JSON.parse(solc.compile(JSON.stringify(input)));

if (output.errors) {
  const errors = output.errors.filter(e => e.severity === 'error');
  if (errors.length > 0) {
    console.error('Compilation failed with errors:');
    for (const err of errors) {
      console.error(err.formattedMessage);
    }
    process.exit(1);
  }
}

const outDir = path.resolve('contracts/out');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

fs.writeFileSync(path.join(outDir, 'compiled.json'), JSON.stringify(output, null, 2));
console.log('Compiled contracts successfully saved to contracts/out/compiled.json');

for (const [sourcePath, contracts] of Object.entries(output.contracts)) {
  for (const [contractName, contractData] of Object.entries(contracts)) {
    const bytecode = contractData.evm?.bytecode?.object;
    if (bytecode && bytecode.length > 0) {
      console.log(`- ${contractName}: compiled OK`);
    }
  }
}
