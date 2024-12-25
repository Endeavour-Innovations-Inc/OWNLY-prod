import { Head } from 'components/Head'
import Layout from 'components/Layout'
import ChainToggle from 'components/common/ChainToggle'
import { Box, Flex, Text } from 'components/primitives'
import { ChainContext } from 'context/ChainContextProvider'
import { NextPage } from 'next'
import { useRouter } from 'next/router'
import { useContext, useEffect } from 'react'
import supportedChains from 'utils/chains'

const IndexPage: NextPage = () => {
  const router = useRouter()
  const { chain, switchCurrentChain } = useContext(ChainContext)

  // If a chain is specified in the URL (e.g. /[chain]), switch to it on load
  useEffect(() => {
    if (router.query.chain) {
      let chainIndex: number | undefined
      for (let i = 0; i < supportedChains.length; i++) {
        if (supportedChains[i].routePrefix === router.query.chain) {
          chainIndex = supportedChains[i].id
        }
      }
      if (chainIndex !== -1 && chainIndex) {
        switchCurrentChain(chainIndex)
      }
    }
  }, [router.query, switchCurrentChain])

  return (
    <Layout>
      <Head />
      <Box
        css={{
          p: 24,
          height: '100%',
          '@bp800': {
            p: '$5',
          },
          '@xl': {
            px: '$6',
          },
        }}
      >
        <Flex direction="column">
          <Flex
            justify="between"
            align="start"
            css={{
              flexDirection: 'column',
              gap: 24,
              mb: '$4',
              '@bp800': {
                alignItems: 'center',
                flexDirection: 'row',
              },
            }}
          >
            <Text style="h4" as="h4">
              Create a new collection
            </Text>
            <Flex align="center" css={{ gap: '$4' }}>
              {/* Toggle the chain you want to create on */}
              <ChainToggle />
            </Flex>
          </Flex>

          {/* 
            Add your UI/form for creating a new NFT collection below. 
            For example:
            <form onSubmit={handleCreateCollection}>
              <input type="text" placeholder="Name" ... />
              <input type="text" placeholder="Description" ... />
              ... 
              <button type="submit">Create Collection</button>
            </form>
          */}
        </Flex>
      </Box>
    </Layout>
  )
}

export default IndexPage
