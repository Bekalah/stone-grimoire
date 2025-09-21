// Minimal helper to call the Cosmogenesis learning engine.
/**
 * Send a profile to the Cosmogenesis learning engine resolve endpoint and return its JSON response.
 *
 * Performs a single POST to https://cosmogenesis-learning-engine.fly.io/resolve with the provided `profile`
 * serialized as JSON. If the HTTP response is not OK (status outside 200–299) an Error is thrown.
 *
 * @param {Object} profile - The payload sent to the resolver endpoint; should be serializable to JSON.
 * @returns {Promise<any>} The parsed JSON response from the resolver.
 * @throws {Error} If the HTTP response has a non-OK status (message: "resolver error").
 */
export async function resolveWorker(profile){
  const url = "https://cosmogenesis-learning-engine.fly.io/resolve";
  const res = await fetch(url,{
    method:"POST",
    headers:{ "content-type":"application/json" },
    body: JSON.stringify(profile)
  });
  if(!res.ok) throw new Error("resolver error");
  return res.json();
}
