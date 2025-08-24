import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../server'
import { TRPCError } from '@trpc/server'

export const blockchainRouter = createTRPCRouter({
  // Get blockchain status
  getBlockchainStatus: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const userId = ctx.user.id

        // Get user's blockchain data
        const [transactions, networks] = await Promise.all([
          ctx.db.blockchainTransaction.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 10
          }),
          ctx.db.blockchainNetwork.findMany({
            where: { userId }
          })
        ])

        // Calculate gas used
        const gasUsed = transactions.reduce((total, tx) => total + (tx.gasUsed || 0), 0)

        // Get connection status
        const status = networks.length > 0 ? 'connected' : 'disconnected'

        // Recent transactions
        const recentTransactions = transactions.map(tx => ({
          id: tx.id,
          type: tx.type,
          hash: tx.hash,
          status: tx.status,
          timestamp: tx.createdAt
        }))

        return {
          status,
          gasUsed,
          networks,
          recentTransactions
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kunne ikke hente blockchain status'
        })
      }
    }),

  // Get NFTs
  getNFTs: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const userId = ctx.user.id

        // Get user's NFTs
        const nfts = await ctx.db.nft.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' }
        })

        const totalNFTs = nfts.length

        return {
          totalNFTs,
          nfts: nfts.map(nft => ({
            id: nft.id,
            name: nft.name,
            tokenId: nft.tokenId,
            value: nft.value,
            blockchain: nft.blockchain,
            status: nft.status,
            metadata: nft.metadata
          }))
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kunne ikke hente NFTs'
        })
      }
    }),

  // Get smart contracts
  getSmartContracts: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const userId = ctx.user.id

        // Get user's smart contracts
        const contracts = await ctx.db.smartContract.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' }
        })

        const deployedContracts = contracts.filter(contract => contract.status === 'active').length

        return {
          deployedContracts,
          contracts: contracts.map(contract => ({
            id: contract.id,
            name: contract.name,
            address: contract.address,
            type: contract.type,
            blockchain: contract.blockchain,
            status: contract.status,
            abi: contract.abi
          }))
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kunne ikke hente smart contracts'
        })
      }
    }),

  // Get decentralized data
  getDecentralizedData: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const userId = ctx.user.id

        // Get decentralized storage data
        const storage = [
          {
            id: 'ipfs',
            name: 'IPFS Storage',
            used: 2.3,
            total: 10
          },
          {
            id: 'arweave',
            name: 'Arweave',
            used: 1.8,
            total: 5
          },
          {
            id: 'filecoin',
            name: 'Filecoin',
            used: 0.5,
            total: 2
          }
        ]

        // Get decentralized identity data
        const identity = [
          {
            id: 'did-1',
            name: 'Personal DID',
            did: 'did:ethr:0x1234567890abcdef',
            verified: true
          },
          {
            id: 'did-2',
            name: 'Business DID',
            did: 'did:ethr:0xabcdef1234567890',
            verified: false
          }
        ]

        return {
          storage,
          identity
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kunne ikke hente desentraliserte data'
        })
      }
    }),

  // Create NFT
  createNFT: protectedProcedure
    .input(z.object({
      itemId: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const userId = ctx.user.id

        // Get the item to create NFT from
        const item = await ctx.db.item.findFirst({
          where: {
            id: input.itemId,
            userId
          }
        })

        if (!item) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Gjenstand ikke funnet'
          })
        }

        // Create NFT record
        const nft = await ctx.db.nft.create({
          data: {
            userId,
            name: item.name,
            tokenId: generateTokenId(),
            value: item.value || 0,
            blockchain: 'ethereum',
            status: 'minted',
            metadata: {
              itemId: item.id,
              description: item.description,
              imageUrl: item.imageUrl
            }
          }
        })

        // Log activity
        await ctx.db.activity.create({
          data: {
            type: 'NFT_CREATED',
            description: `Opprettet NFT: ${item.name}`,
            userId,
            metadata: {
              nftId: nft.id,
              itemId: item.id,
              tokenId: nft.tokenId
            }
          }
        })

        return nft
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kunne ikke opprette NFT'
        })
      }
    }),

  // Deploy smart contract
  deployContract: protectedProcedure
    .input(z.object({
      name: z.string(),
      type: z.string(),
      blockchain: z.string(),
      abi: z.any()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const userId = ctx.user.id

        // Deploy smart contract
        const contract = await ctx.db.smartContract.create({
          data: {
            userId,
            name: input.name,
            address: generateContractAddress(),
            type: input.type,
            blockchain: input.blockchain,
            status: 'active',
            abi: input.abi
          }
        })

        // Log activity
        await ctx.db.activity.create({
          data: {
            type: 'SMART_CONTRACT_DEPLOYED',
            description: `Deployet smart contract: ${input.name}`,
            userId,
            metadata: {
              contractId: contract.id,
              contractName: input.name,
              contractAddress: contract.address
            }
          }
        })

        return contract
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kunne ikke deploye smart contract'
        })
      }
    }),

  // Sync blockchain data
  syncData: protectedProcedure
    .mutation(async ({ ctx }) => {
      try {
        const userId = ctx.user.id

        // Simulate blockchain sync
        const syncResult = {
          success: true,
          syncedTransactions: 15,
          syncedBlocks: 1000,
          lastSyncTime: new Date()
        }

        // Log activity
        await ctx.db.activity.create({
          data: {
            type: 'BLOCKCHAIN_SYNC',
            description: 'Synkroniserte blockchain data',
            userId,
            metadata: {
              syncedTransactions: syncResult.syncedTransactions,
              syncedBlocks: syncResult.syncedBlocks
            }
          }
        })

        return syncResult
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kunne ikke synkronisere blockchain data'
        })
      }
    }),

  // Get blockchain statistics
  getBlockchainStats: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const userId = ctx.user.id

        // Get blockchain statistics
        const [nfts, contracts, transactions, networks] = await Promise.all([
          ctx.db.nft.count({ where: { userId } }),
          ctx.db.smartContract.count({ where: { userId } }),
          ctx.db.blockchainTransaction.count({ where: { userId } }),
          ctx.db.blockchainNetwork.count({ where: { userId } })
        ])

        // Calculate total value
        const nftValue = await ctx.db.nft.aggregate({
          where: { userId },
          _sum: { value: true }
        })

        const totalValue = nftValue._sum.value || 0

        return {
          totalNFTs: nfts,
          totalContracts: contracts,
          totalTransactions: transactions,
          connectedNetworks: networks,
          totalValue
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kunne ikke hente blockchain statistikk'
        })
      }
    })
})

// Helper functions
function generateTokenId(): string {
  return '0x' + Math.random().toString(16).substr(2, 40)
}

function generateContractAddress(): string {
  return '0x' + Math.random().toString(16).substr(2, 40)
}
