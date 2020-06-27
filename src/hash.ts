import * as crypto from 'crypto'

const fullHashes: { [S: string]: string } = {}
const usedShortHashes: { [H: string]: string } = {}

export const getShortHash = (str: string, len = 4): string => {
  const hash =
    fullHashes[str] || crypto.createHash('md5').update(str).digest('hex')
  const short = hash.slice(0, len)
  usedShortHashes[short] = usedShortHashes[short] || str
  return usedShortHashes[short] === str ? short : getShortHash(str, len + 1)
}
