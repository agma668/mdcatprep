/**
 * Test-only resolve hook: neutralize the `server-only` guard package so
 * lib/jev.ts can be imported under plain `node --test` (outside a React
 * Server Components bundle the guard package throws at import time — that is
 * its job in product code, and this hook's job to bypass in tests ONLY).
 * Every other specifier resolves normally.
 */
export async function resolve(specifier, context, next) {
  if (specifier === "server-only") {
    return {
      url: "data:text/javascript,export default {};",
      shortCircuit: true,
    };
  }
  return next(specifier, context);
}
