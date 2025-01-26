type Transaction = {
    time: Date,
    amount: number,
    sender: string,
    recipient: string,
    script: string | null,
    memo?: string,
};

type Upgrade = {
    name: string,
    type: string,
    up_class: string,
    tier: number,
    rarity: number,
    loaded: boolean,
    sn: string,
    description: string,
    i: number,
}

type MarketUpgrade = Omit<Upgrade, i>
