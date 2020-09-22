import { createConnection, ConnectionOptions, getConnection } from 'typeorm';

export const sqliteOptions = {
  type: 'sqlite',
  database: ':memory:',
  dropSchema: true,
  synchronize: true,
};

interface Options {
  debug?: boolean;
}

type PropertyEntity<T> = {[P in keyof T]: T[P] }
type PropertyData<T> = { [P in keyof T]: Partial<PropertyEntity<T[P]>>[] }

export class DbUnit {
  private log = false;
  constructor(options?: Options) {
    this.log = !!options?.debug;
  }
  async initDb(config: Partial<ConnectionOptions>) {
    const opts = {
      ...config,
      ...(this.log ? { logging: true } : {}),
      ...sqliteOptions,
    } as ConnectionOptions;
    const conn = await createConnection(opts);
    return conn;
  }
  async closeDb() {
    const conn = await getConnection();
    return conn?.close();
  }

  async load<T>(data: PropertyData<T>) {
    const conn = await getConnection();
    for (let table of Object.keys(data)) {
      const rep = conn.getRepository(table);
      await rep.insert(data[table]);
      this.log && console.log('DB loaded: ', table, data[table].length);
    }
  }
}
