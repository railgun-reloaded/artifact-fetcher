// import assert from 'node:assert'
import { describe, it } from 'node:test'

import { fetchFromIPFS } from '../src/artifact-downloader.js'
import { RAILGUN_ARTIFACTS_CID_ROOT } from '../src/definitions.js'

describe('artifact-downloader', () => {
  it('should fetch artifacts from IPFS', async () => {
    const response = await fetchFromIPFS(RAILGUN_ARTIFACTS_CID_ROOT, '10x1/vkey.json')

    console.log('response', response)
  })
})
