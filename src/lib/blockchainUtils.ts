/**
 * Utility functions for blockchain verification links
 */

export interface BlockchainTransaction {
  tx_hash: string;
  network: string;
  timestamp_method?: string;
}

/**
 * Get the appropriate verification URL based on the blockchain network
 * OpenTimestamps uses Bitcoin anchoring and should link to the verification page
 * Polygon transactions link directly to PolygonScan
 */
export function getBlockchainVerificationUrl(
  transaction: BlockchainTransaction | null | undefined,
  hash?: string | null
): string | null {
  if (!transaction) return null;

  const { tx_hash, network, timestamp_method } = transaction;

  // OpenTimestamps - use internal verification page with the file hash
  if (network === "opentimestamps" || timestamp_method === "OPEN_TIMESTAMP") {
    if (hash) {
      return `/verificar?hash=${hash}`;
    }
    return "https://opentimestamps.org";
  }

  // Polygon network
  if (network === "polygon") {
    return `https://polygonscan.com/tx/${tx_hash}`;
  }

  // Internal/unknown - use internal verification
  if (hash) {
    return `/verificar?hash=${hash}`;
  }

  return null;
}

/**
 * Get a display label for the blockchain network
 */
export function getBlockchainNetworkLabel(network: string): string {
  const labels: Record<string, string> = {
    opentimestamps: "OpenTimestamps (Bitcoin)",
    polygon: "Polygon",
    internal: "WebMarcas",
  };
  return labels[network] || network;
}

/**
 * Check if the transaction is externally verifiable (on a public blockchain)
 */
export function isExternallyVerifiable(network: string): boolean {
  return network === "polygon";
}
