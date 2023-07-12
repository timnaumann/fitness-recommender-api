import { dirname } from 'path';
import { fileURLToPath } from 'url';

export const appRoot =  dirname(fileURLToPath(import.meta.url));