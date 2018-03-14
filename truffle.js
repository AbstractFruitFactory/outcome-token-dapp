module.exports = {
  networks: {
    development: {
      host: "localhost",
      port: 9545,
      gas: 500000,
      network_id: "*" // Match any network id
    }
  }
};
