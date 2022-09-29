import fs from 'fs';
import path from 'path';
import { parse, stringify } from 'yaml';


const ymlConfig = fs.readFileSync(path.join(__dirname, '../assets/tracking-plans/songs.yml'), 'utf8');
const eventSchemas = parse(ymlConfig);

console.log(`eventSchemas`, eventSchemas); // eslint-disable-line no-console
