import { Client } from "@elastic/elasticsearch";

let _es: Client | null = null;

/** Create/get a singleton ES client. Call this INSIDE handlers only. */
export function getEs(): Client {
    if (_es) return _es;

    const node = process.env.ES_NODE || process.env.ES_HOST; // support either
    const username = process.env.ES_USERNAME;
    const password = process.env.ES_PASSWORD;

    if (!node) {
        // Throw only when a handler actually tries to use ES
        throw new Error("Elasticsearch node not configured (ES_NODE/ES_HOST).");
    }

    _es = new Client({
        node,
        auth: username && password ? { username, password } : undefined,
        tls: { rejectUnauthorized: false },
    });

    return _es;
}
