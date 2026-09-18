async function getRecentTxs() {
  const res = await fetch('https://sepolia.base.org', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'eth_getBlockByNumber',
      params: ['latest', true]
    })
  });
  const data = await res.json();
  const block = data.result;
  console.log('Block Number:', parseInt(block.number, 16));
  const txs = block.transactions.slice(0, 4);
  for (const tx of txs) {
    console.log(JSON.stringify({
      hash: tx.hash,
      from: tx.from,
      to: tx.to,
      value: tx.value,
      blockNumber: parseInt(tx.blockNumber, 16)
    }));
  }
}

getRecentTxs();
