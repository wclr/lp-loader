export type Dict = {
  title: string,
  loadingBMI: string
}

declare const dict: (lang: string) => Promise<Dict>
export default dict