/**
 * Gera um identificador único (UUID v4 quando possível). Usa
 * `crypto.randomUUID` se disponível, com fallback para `crypto.getRandomValues`
 * em ambientes onde `randomUUID` não existe (browsers antigos / contextos
 * não-seguros), evitando depender de `Math.random`.
 */
export function safeRandomId(): string {
  const cryptoObj = globalThis.crypto;

  if (cryptoObj?.randomUUID) {
    return cryptoObj.randomUUID();
  }

  if (cryptoObj?.getRandomValues) {
    const bytes = new Uint8Array(16);
    cryptoObj.getRandomValues(bytes);
    // Ajusta version (4) e variant conforme RFC 4122.
    bytes[6] = (bytes[6]! & 0x0f) | 0x40;
    bytes[8] = (bytes[8]! & 0x3f) | 0x80;
    const hex = [...bytes].map((b) => b.toString(16).padStart(2, "0"));
    return (
      `${hex.slice(0, 4).join("")}-${hex.slice(4, 6).join("")}-` +
      `${hex.slice(6, 8).join("")}-${hex.slice(8, 10).join("")}-` +
      `${hex.slice(10, 16).join("")}`
    );
  }

  // Último recurso (não-criptográfico) — apenas para ambientes sem Web Crypto.
  return `id-${Date.now().toString(36)}-${performance.now().toString(36).replace(".", "")}`;
}
