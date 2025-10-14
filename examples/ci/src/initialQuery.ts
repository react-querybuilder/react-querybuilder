import { parseSQL } from 'react-querybuilder/parseSQL';

const sql = `(firstName like 'Stev%' and lastName in ('Vai', 'Vaughan') and age between 28 and 78 and (isMusician = TRUE or instrument = 'guitar'))`;

export const initialQuery = parseSQL(sql);
export const initialQueryIC = parseSQL(sql, { independentCombinators: true });
