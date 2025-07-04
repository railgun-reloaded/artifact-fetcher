import assert from 'node:assert'
import { afterEach, beforeEach, describe, it, mock } from 'node:test'

import { initHelia } from '../src/artifact-downloader.js'

// Mock dependencies
const mockUnixfs = mock.fn()
const mockCreateHelia = mock.fn()
const mockCat = mock.fn()

describe('artifact-downloader', () => {
  beforeEach(() => {
    mockCreateHelia.mock.resetCalls()
    mockUnixfs.mock.resetCalls()
    mockCat.mock.resetCalls()
  })

  afterEach(() => {
    mockCreateHelia.mock.restore()
    mockUnixfs.mock.restore()
    mockCat.mock.restore()
  })

  describe('initHelia', () => {
    it.only('should initialize Helia node and UnixFS API', async () => {
      await initHelia()

      assert.strictEqual(mockCreateHelia.mock.callCount(), 1)
      assert.strictEqual(mockUnixfs.mock.callCount(), 1)
    })

    it('should not reinitialize if already initialized', async () => {
      await initHelia()
      await initHelia()

      assert.strictEqual(mockCreateHelia.mock.callCount(), 1)
      assert.strictEqual(mockUnixfs.mock.callCount(), 1)
    })
  })

  //   describe('fetchFromIPFS', () => {
  //     const mockArtifactData = new Uint8Array([1, 2, 3, 4, 5])

  //     beforeEach(() => {
  //       mockCat.mock.mockImplementation(() => [mockArtifactData])
  //     })

  //     it('should fetch file from IPFS and return combined chunks', async () => {
  //       const rootCid = 'QmeBrG7pii1qTqsn7rusvDiqXopHPjCT9gR4PsmW7wXqZq'
  //       const path = '2x16/zkey.br'

  //       const result = await fetchFromIPFS(rootCid, path)

  //       assert.deepStrictEqual(result, mockArtifactData)
  //       assert.strictEqual(mockCat.mock.callCount(), 1)
  //     })

  //     it('should initialize Helia if not already initialized', async () => {
  //       await fetchFromIPFS('QmRoot', 'path')

  //       assert.strictEqual(mockCreateHelia.mock.callCount(), 1)
  //       assert.strictEqual(mockUnixfs.mock.callCount(), 1)
  //     })

  //     it('should throw error if UnixFS is not initialized', async () => {
  //       mockUnixfs.mock.mockImplementation(() => undefined)

  //       await assert.rejects(
  //         fetchFromIPFS('QmRoot', 'path'),
  //         { message: 'Helia UnixFS not initialized' }
  //       )
  //     })

  //     it('should handle multiple chunks correctly', async () => {
  //       const chunks = [
  //         new Uint8Array([1, 2, 3]),
  //         new Uint8Array([4, 5, 6]),
  //         new Uint8Array([7, 8, 9])
  //       ]
  //       mockCat.mock.mockImplementation(() => chunks)

  //       const result = await fetchFromIPFS('QmRoot', 'path')

  //       assert.deepStrictEqual(result, new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9]))
  //     })

  //     it('should handle empty chunks', async () => {
  //       mockCat.mock.mockImplementation(() => [])

  //       const result = await fetchFromIPFS('QmRoot', 'path')

  //       assert.deepStrictEqual(result, new Uint8Array(0))
  //     })

  //     it('should construct correct IPFS path', async () => {
  //       const rootCid = 'QmeBrG7pii1qTqsn7rusvDiqXopHPjCT9gR4PsmW7wXqZq'
  //       const path = '2x16/zkey.br'

  //       await fetchFromIPFS(rootCid, path)

  //       // Verify the CID.parse was called with the correct path format
  //       assert.strictEqual(mockCat.mock.callCount(), 1)
  //     })
  //   })

  //   describe('downloadArtifactsForVariant', () => {
  //     const mockArtifactData = new Uint8Array([1, 2, 3, 4, 5])

  //     beforeEach(() => {
  //       mockCat.mock.mockImplementation(() => [mockArtifactData])
  //     })

  //     it('should download all three artifacts for a variant', async () => {
  //       const variant = '2x16'

  //       await downloadArtifactsForVariant(variant)

  //       // Should call fetchFromIPFS 3 times (vkey, zkey, wasm)
  //       assert.strictEqual(mockCat.mock.callCount(), 3)
  //     })

  //     it('should construct correct artifact paths', async () => {
  //       const variant = '2x16'

  //       await downloadArtifactsForVariant(variant)

  //       // Verify the calls were made with the expected artifact names + variant
  //       assert.strictEqual(mockCat.mock.callCount(), 3)
  //     })

  //     it('should throw error if vkey artifact is empty', async () => {
  //       mockCat.mock
  //         .mockImplementationOnce(() => []) // vkey fails (empty)
  //         .mockImplementationOnce(() => [mockArtifactData]) // zkey succeeds
  //         .mockImplementationOnce(() => [mockArtifactData]) // wasm succeeds

  //       await assert.rejects(
  //         downloadArtifactsForVariant('2x16'),
  //         { message: 'Could not download vkey artifact.' }
  //       )
  //     })

  //     it('should throw error if zkey artifact is empty', async () => {
  //       mockCat.mock
  //         .mockImplementationOnce(() => [mockArtifactData]) // vkey succeeds
  //         .mockImplementationOnce(() => []) // zkey fails (empty)
  //         .mockImplementationOnce(() => [mockArtifactData]) // wasm succeeds

  //       await assert.rejects(
  //         downloadArtifactsForVariant('2x16'),
  //         { message: 'Could not download zkey artifact.' }
  //       )
  //     })

  //     it('should throw error if wasm artifact is empty', async () => {
  //       mockCat.mock
  //         .mockImplementationOnce(() => [mockArtifactData]) // vkey succeeds
  //         .mockImplementationOnce(() => [mockArtifactData]) // zkey succeeds
  //         .mockImplementationOnce(() => []) // wasm fails (empty)

  //       await assert.rejects(
  //         downloadArtifactsForVariant('2x16'),
  //         { message: 'Could not download wasm artifact.' }
  //       )
  //     })

  //     it('should handle different variant strings', async () => {
  //       const variants = ['1x1', '2x2', '3x3', '4x4']

  //       for (const variant of variants) {
  //         await downloadArtifactsForVariant(variant)
  //       }

  //       // Should be called 3 times for each variant
  //       assert.strictEqual(mockCat.mock.callCount(), variants.length * 3)
  //     })

  //     it('should handle timeout scenarios', async () => {
  //       // Mock a slow response
  //       mockCat.mock.mockImplementation(() => {
  //         return new Promise((resolve) => {
  //           setTimeout(() => resolve([mockArtifactData]), 100)
  //         })
  //       })

  //       await downloadArtifactsForVariant('2x16')

  //       assert.strictEqual(mockCat.mock.callCount(), 3)
  //     })
  //   })

  //   describe('Integration with RAILGUN_ARTIFACTS_CID_ROOT', () => {
  //     it('should use correct root CID for artifact downloads', async () => {
  //       const expectedRootCid = 'QmeBrG7pii1qTqsn7rusvDiqXopHPjCT9gR4PsmW7wXqZq'

  //       await downloadArtifactsForVariant('2x16')

  //       // The function should be called with the correct root CID
  //       assert.strictEqual(mockCat.mock.callCount(), 3)
  //     })
  //   })

  //   describe('Error handling', () => {
  //     it('should handle Helia initialization errors', async () => {
  //       mockCreateHelia.mock.mockImplementation(() =>
  //         Promise.reject(new Error('Helia init failed'))
  //       )

  //       await assert.rejects(
  //         fetchFromIPFS('QmRoot', 'path'),
  //         { message: 'Helia init failed' }
  //       )
  //     })

  //     it('should handle IPFS cat errors', async () => {
  //       mockCat.mock.mockImplementation(() => {
  //         throw new Error('IPFS cat failed')
  //       })

//       await assert.rejects(
//         fetchFromIPFS('QmRoot', 'path'),
//         { message: 'IPFS cat failed' }
//       )
//     })
//   })
})
