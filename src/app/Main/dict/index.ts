export type Dict = {
  title: string,
  loadingBMI: string
}

export const makeTitle = (title: string) => title.toUpperCase()

declare const dict: (lang: string) => Promise<Dict>
export default dict