function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
    return new Promise((resolve, reject) => {
        const id = setTimeout(
            () => reject(new Error(`Timeout after ${ms}ms`)),
            ms
        );
        promise
            .then((res) => {
                clearTimeout(id);
                resolve(res);
            })
            .catch((err) => {
                clearTimeout(id);
                reject(err);
            });
    });
}

export default withTimeout;
