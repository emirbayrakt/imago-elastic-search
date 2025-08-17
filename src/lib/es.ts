import { Client } from "@elastic/elasticsearch";

// Dev-only: ignore bad SSL
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

export const es = new Client({
    node: process.env.ES_HOST!,
    auth: {
        username: process.env.ES_USERNAME!,
        password: process.env.ES_PASSWORD!,
    },
    tls: { rejectUnauthorized: false },
});
