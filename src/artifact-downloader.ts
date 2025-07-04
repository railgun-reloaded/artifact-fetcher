import { unixfs } from '@helia/unixfs'
import debug from 'debug'
import { createHelia } from 'helia'
import { CID } from 'multiformats/cid'

const dbg = debug('artifact-fetcher:downloader')

const RAILGUN_ARTIFACTS_CID_ROOT = 'QmeBrG7pii1qTqsn7rusvDiqXopHPjCT9gR4PsmW7wXqZq'

let heliaNode: Awaited<ReturnType<typeof createHelia>> | undefined
let fs: ReturnType<typeof unixfs> | undefined

enum ArtifactName {
  ZKEY = 'zkey',
  WASM = 'wasm',
  VKEY = 'vkey',
  DAT = 'dat',
}

/**
 * Ensure a value is not null or undefined.
 * @param value The value to check.
 * @returns boolean
 */
function isDefined (value: any): value is NonNullable<any> {
  return value !== null && value !== undefined
}

/**
 * Initializes the Helia node and UnixFS API if not already initialized.
 */
async function initHelia () {
  if (!heliaNode) {
    heliaNode = await createHelia()
    fs = unixfs(heliaNode)
  }
}

// /**
//  * Creates a string representation of the artifact variant based on nullifiers and commitments.
//  * @param nullifiers The number of nullifiers in the artifact.
//  * @param commitments The number of commitments in the artifact.
//  * @returns A string in the format "nullifiersXcommitments".
//  */
// const getArtifactVariantString = (
//   nullifiers: number,
//   commitments: number
// ) => {
//   return `${nullifiers}x${commitments}`
// }

/**
 * sfd
 * @param artifactVariantString asdf
 */
async function downloadArtifactsForVariant (artifactVariantString: string) {
  dbg(`Downloading artifacts: ${artifactVariantString}`)

  const [vkeyPath, zkeyPath, wasmPath] = await Promise.all([
    fetchFromIPFS(RAILGUN_ARTIFACTS_CID_ROOT, ArtifactName.VKEY + artifactVariantString),
    fetchFromIPFS(RAILGUN_ARTIFACTS_CID_ROOT, ArtifactName.ZKEY + artifactVariantString),
    fetchFromIPFS(RAILGUN_ARTIFACTS_CID_ROOT, ArtifactName.WASM + artifactVariantString),
  ])

  if (!isDefined(vkeyPath)) {
    throw new Error('Could not download vkey artifact.')
  }
  if (!isDefined(zkeyPath)) {
    throw new Error('Could not download zkey artifact.')
  }
  if (!isDefined(wasmPath)) {
    throw new Error('Could not download wasm artifact.')
  }
};

/**
 * Fetches a file from IPFS using the root CID and file path.
 * @param rootCid The root CID string (e.g., 'QmeBrG7pii1qTqsn7rusvDiqXopHPjCT9gR4PsmW7wXqZq')
 * @param path The file path inside the CID (e.g., '2x16/zkey.br')
 * @returns The full file as a Uint8Array
 */
async function fetchFromIPFS (
  rootCid: string,
  path: string
): Promise<Uint8Array> {
  // Initialize Helia and UnixFS API if not already done
  await initHelia()

  // Ensure the Helia UnixFS API is initialized
  if (!fs) throw new Error('Helia UnixFS not initialized')

  // Combine root CID and path, e.g. 'QmRoot/relative/path/to/file'
  const ipfsPath = CID.parse(`${rootCid}/${path}`)
  const chunks: Uint8Array[] = []
  for await (const chunk of fs.cat(ipfsPath)) {
    chunks.push(chunk)
  }

  // Flatten the chunks into a single Uint8Array
  const totalLength = chunks.reduce((len, c) => len + c.length, 0)
  const out = new Uint8Array(totalLength)
  let offset = 0
  for (const chunk of chunks) {
    out.set(chunk, offset)
    offset += chunk.length
  }
  return out
}

export { fetchFromIPFS, downloadArtifactsForVariant, initHelia, ArtifactName }
