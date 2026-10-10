import {spawnSync} from 'node:child_process';
const bundled='/Users/tomasilheu/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3';
import {existsSync} from 'node:fs';
const python=process.env.PYTHON_BIN || (existsSync(bundled)?bundled:'python3');
const result=spawnSync(python,['scripts/import-data.py',...process.argv.slice(2)],{stdio:'inherit'});
process.exit(result.status??1);
