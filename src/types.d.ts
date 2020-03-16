interface CSSFile {
  [property: string]: string;
}

declare module "*.css" {
  const data: CSSFile;
  export = data;
}