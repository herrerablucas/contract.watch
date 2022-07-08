const LatestContract = module.exports = {
    hash: "",
    get: () => {
        return LatestContract.hash;
    },
    set: (hash) => {
        LatestContract.hash = hash;
    }
}