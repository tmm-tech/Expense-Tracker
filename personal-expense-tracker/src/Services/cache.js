export function saveCache(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

export function loadCache(key) {
  const cached = localStorage.getItem(key);
  return cached ? JSON.parse(cached) : null;
}

export function clearCache(key) {
  localStorage.removeItem(key);
}