export type Dict = {
  desc: string
}

export const keys = (): string[] => ['x']

declare const dict: (lang: string) => Promise<Dict>
export default dict