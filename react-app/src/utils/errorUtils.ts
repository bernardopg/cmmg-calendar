const DEFAULT_CONNECTION_ERROR =
  "Erro ao conectar com o servidor. Certifique-se de que a API está rodando.";

/**
 * Extrai uma mensagem legível de um erro desconhecido, com fallback para
 * a mensagem padrão de conexão.
 */
export function getErrorMessage(
  err: unknown,
  fallback: string = DEFAULT_CONNECTION_ERROR,
): string {
  if (err instanceof Error && err.message) {
    return err.message;
  }
  return fallback;
}
