export function withBase(path: string): string {
  const base = import.meta.env.BASE_URL;
  const b = base.endsWith('/') ? base : base + '/';
  return b + path.replace(/^\//, '');
}
