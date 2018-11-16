export type Dict = {
  desc: string
}

declare const dict: (lang: string) => Promise<Dict>
export default dict