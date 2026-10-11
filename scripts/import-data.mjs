import {spawnSync} from 'node:child_process';
const python=process.env.PYTHON_BIN||'python3';
const result=spawnSync(python,['scripts/import-data.py',...process.argv.slice(2)],{stdio:'inherit'});
if(result.error)console.error(`Não foi possível executar "${python}". Defina PYTHON_BIN se o Python estiver noutro caminho.`);
process.exit(result.status??1);
