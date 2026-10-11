/** Resolve public files on both a root domain and GitHub Pages. */
export const assetUrl=(path:string)=>import.meta.env.BASE_URL+path.replace(/^\/+/, '');
