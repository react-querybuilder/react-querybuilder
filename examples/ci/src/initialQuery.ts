import { parseSQL } from 'react-querybuilder';

const sql = `(firstName like 'Stev%' and lastName in ('Vai', 'Vaughan') and age > '28' and (isMusician = TRUE or instrument = 'Guitar'))`;

export const initialQuery = parseSQL(sql);
export const initialQueryIC = parseSQL(sql, { independentCombinators: true });
