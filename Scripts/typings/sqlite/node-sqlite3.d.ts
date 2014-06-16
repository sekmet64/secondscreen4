declare module "sqlite3" {
    export function verbose();

    export var cached;

    export class Database {
        constructor(filename: string, mode?, callback?: Function);

        run(sql: string, param?: any, callback?: { (err: any, row: any): void; }): Database;
        get(sql: string, param?: any, callback?: { (err: any, row: any): void; }): Database;
        all(sql: string, param?: any, callback?: { (err: any, row: any): void; }): Database;
        each(sql: string, param?: any, callback?: { (err: any, row: any): void; }, complete?: { (err: any, numRows: any): void; }): Database;
        exec(sql: string, callback?: { (err: any): void; }): Database;
        prepare(sql: string, param?: Array<any>, callback?: { (err: any): void; }): Statement;

        serialize(callback: Function): void;
        parallelize(callback: Function): void;

        on(event: string): void;

        loadExtension(path: string, callback: { (err: any): void; }): void;

        close(): void;
    }

    interface Statement {
        bind(param: any, callback?: { (err: any): void; }): Statement;
        reset(callback?: { (err: any): void; }): Statement;
        finalize(callback?: { (err: any): void; }): void;
        run(param?: any, callback?: { (err: any, row: any): void; }): Statement;
        get(param?: any, callback?: { (err: any, row: any): void; }): Statement;
        all(param?: any, callback?: { (err: any, row: any): void; }): Statement;
        each(param?: any, callback?: { (err: any, row: any): void; }, complete?: { (err: any, numRows: any): void; }): Statement;
    }
}