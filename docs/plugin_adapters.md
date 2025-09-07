# Plugin Adapters

Adapters let external repositories extend the cathedral view without mutating core code. A repository declares an adapter in `assets/data/registry.json`:

```json
{
  "name": "example-repo",
  "path": "../example-repo",
  "adapter": "scripts/adapter.mjs"
}
```

## Module contract

Each adapter is an ES module that exports an `init` function. It receives the shared view object and may augment it in place. The function may return a promise.

```js
// scripts/adapter.mjs
export function init(view){
  view.adapters = view.adapters || [];
  view.adapters.push("example-repo");
}
```

* `init(view)` — called after the base view is composed.
* The `view` parameter is the global `__CATHEDRAL_VIEW__` object.
* Adapters should be side‑effect free beyond mutating `view`.

Failed imports or missing `init` are logged as warnings; they do not halt page load.
