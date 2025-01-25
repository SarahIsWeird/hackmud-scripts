type Transaction = {
    time: Date,
    amount: number,
    sender: string,
    recipient: string,
    script: string | null,
    memo?: string,
};
