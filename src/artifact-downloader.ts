import { unixfs } from '@helia/unixfs'
import debug from 'debug'
import { createHelia } from 'helia'
import { CID } from 'multiformats/cid'

import { ArtifactName, RAILGUN_ARTIFACTS_CID_ROOT } from './definitions.js'

const dbg = debug('artifact-fetcher:downloader')

let heliaNode: Awaited<ReturnType<typeof createHelia>> | undefined
let fs: ReturnType<typeof unixfs> | undefined

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
 * Downloads the vkey, zkey, and wasm artifacts for a given artifact variant string.
 * @param artifactVariantString The string representing the artifact variant (e.g., "2x16").
 */
async function downloadArtifactsForVariant (artifactVariantString: string) {
  dbg(`Downloading artifacts: ${artifactVariantString}`)

  const [vkeyPath, zkeyPath, wasmPath] = await Promise.all([
    fetchFromIPFS(
      RAILGUN_ARTIFACTS_CID_ROOT,
      ArtifactName.VKEY + artifactVariantString
    ),
    fetchFromIPFS(
      RAILGUN_ARTIFACTS_CID_ROOT,
      ArtifactName.ZKEY + artifactVariantString
    ),
    fetchFromIPFS(
      RAILGUN_ARTIFACTS_CID_ROOT,
      ArtifactName.WASM + artifactVariantString
    ),
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
}

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

  // Parse the root CID separately
  const rootCID = CID.parse(rootCid)
  const chunks: Uint8Array[] = []

  // Use the UnixFS API to navigate to the specific path within the CID
  for await (const chunk of fs.cat(rootCID, { path })) {
    chunks.push(chunk)
  }
  console.log('chunks', chunks)

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

export { fetchFromIPFS, downloadArtifactsForVariant, initHelia }
