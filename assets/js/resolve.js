// Minimal helper to call the Cosmogenesis learning engine.
// No retries or animation; callers can decide how to surface results.
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
