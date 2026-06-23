declare module "papaparse" {
  export type ParseError = {
    row?: number;
    message: string;
  };

  export type ParseResult<T> = {
    data: T[];
    errors: ParseError[];
  };

  export function parse<T = string[]>(
    input: string,
    config: {
      delimiter?: string;
      skipEmptyLines?: boolean;
    }
  ): ParseResult<T>;

  const Papa: {
    parse: typeof parse;
  };

  export default Papa;
}
