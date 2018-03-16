# outcome-token-dapp

To run the DApp:

In the project folder:

```npm install```

And in a seperate command line window, run the development blockchain instance with:

```npx truffle develop```

Then, in the project folder, enter:

```npx truffle compile```

```npx truffle migrate```

```npm run start```

In the browser, open metamask and choose "custom rpc" in the list of networks. Enter the address "http://localhost:9545" (or whatever address your truffle develop is running on) and press save. Connect to it by selecting it in the list of networks.

Now, go to the terminal window where truffle develop is running. Copy one of the private keys that was printed out when starting the instance. Now go to metamask, go to the account menu and press "import account". Select "private key" and paste the key into the text box.

You can now use this account to interact with the DApp. If you want to interact with more accounts they have to be imported as well.




