export type Log = {
    level: "info" | "warn" | "error";
    msg: string;
    ts?: string;
    [k: string]: unknown;
};

export function log(o: Log) {
    const base = { ts: new Date().toISOString(), ...o };
    console.log(JSON.stringify(base));
}
