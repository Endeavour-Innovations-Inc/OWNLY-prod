import { paths } from '@reservoir0x/reservoir-sdk'
import { Head } from 'components/Head'
import Layout from 'components/Layout'
import { Footer } from 'components/home/Footer'
import { Box, Button, Flex, Text } from 'components/primitives'
import { ChainContext } from 'context/ChainContextProvider'
import { useMarketplaceChain, useMounted } from 'hooks'
import { GetServerSideProps, InferGetServerSidePropsType, NextPage } from 'next'
import Link from 'next/link'
import {
  ComponentPropsWithoutRef,
  useContext,
  useEffect,
  useState,
} from 'react'
import supportedChains, { DefaultChain } from 'utils/chains'
import * as Tabs from '@radix-ui/react-tabs'
import {
  useTrendingCollections,
  useTrendingMints,
} from '@reservoir0x/reservoir-kit-ui'
import ChainToggle from 'components/common/ChainToggle'
import CollectionsTimeDropdown, {
  CollectionsSortingOption,
} from 'components/common/CollectionsTimeDropdown'
import MintsPeriodDropdown, {
  MintsSortingOption,
} from 'components/common/MintsPeriodDropdown'
import { FeaturedCards } from 'components/home/FeaturedCards'
import { TabsContent, TabsList, TabsTrigger } from 'components/primitives/Tab'
import { CollectionRankingsTable } from 'components/rankings/CollectionRankingsTable'
import { MintRankingsTable } from 'components/rankings/MintRankingsTable'
import { useTheme } from 'next-themes'
import { useRouter } from 'next/router'
import { useMediaQuery } from 'react-responsive'
import fetcher from 'utils/fetcher'

// ──────────────────────────────────────────────────────
//  ERC165 Helpers
// ──────────────────────────────────────────────────────
import { Contract, JsonRpcProvider } from 'ethers'
const ERC165_ABI = [
  'function supportsInterface(bytes4 interfaceId) external view returns (bool)',
]
const ERC721_INTERFACE_ID = '0x80ac58cd'
const ERC1155_INTERFACE_ID = '0xd9b67a26'

async function checkTokenStandard(
  contractAddress: string,
  provider: JsonRpcProvider
): Promise<'erc721' | 'erc1155' | 'unknown'> {
  try {
    const contract = new Contract(contractAddress, ERC165_ABI, provider)

    const is721 = await contract
      .supportsInterface(ERC721_INTERFACE_ID)
      .catch(() => false)
    const is1155 = await contract
      .supportsInterface(ERC1155_INTERFACE_ID)
      .catch(() => false)

    if (is1155) return 'erc1155'
    if (is721) return 'erc721'
    return 'unknown'
  } catch (err) {
    console.error(`Failed to check interface for ${contractAddress}`, err)
    return 'unknown'
  }
}
// ──────────────────────────────────────────────────────

type TabValue = 'collections' | 'mints'

type Props = InferGetServerSidePropsType<typeof getServerSideProps>

const Home: NextPage<Props> = ({ ssr }) => {
  const router = useRouter()
  const marketplaceChain = useMarketplaceChain()
  const isMounted = useMounted()

  const { theme: nextTheme } = useTheme()
  const [theme, setTheme] = useState<string | null>(null)
  useEffect(() => {
    if (nextTheme) {
      setTheme(nextTheme)
    }
  }, [nextTheme])

  const isSSR = typeof window === 'undefined'
  const isSmallDevice = useMediaQuery({ query: '(max-width: 800px)' })

  const [tab, setTab] = useState<TabValue>('collections')
  const [sortByTime, setSortByTime] = useState<CollectionsSortingOption>('24h')
  const [sortByPeriod, setSortByPeriod] = useState<MintsSortingOption>('24h')

  const { chain, switchCurrentChain } = useContext(ChainContext)

  useEffect(() => {
    if (router.query.chain) {
      let chainIndex: number | undefined
      for (let i = 0; i < supportedChains.length; i++) {
        if (supportedChains[i].routePrefix == router.query.chain) {
          chainIndex = supportedChains[i].id
        }
      }
      if (chainIndex !== -1 && chainIndex) {
        switchCurrentChain(chainIndex)
      }
    }
  }, [router.query, switchCurrentChain])

  const {
    data: trendingCollections,
    isValidating: isTrendingCollectionsValidating,
  } = useTrendingCollections(
    {
      limit: 20,
      sortBy: 'volume',
      period: sortByTime,
    },
    chain.id,
    {
      fallbackData: ssr.trendingCollections,
      keepPreviousData: true,
    }
  )

  const {
    data: featuredCollections,
    isValidating: isFeaturedCollectionsValidating,
  } = useTrendingCollections(
    {
      limit: 20,
      sortBy: 'sales',
      period: '24h',
    },
    chain.id,
    {
      fallbackData: ssr.featuredCollections,
      keepPreviousData: true,
    }
  )

  let mintsQuery: Parameters<typeof useTrendingMints>['0'] = {
    limit: 20,
    period: sortByPeriod,
    type: 'any',
  }

  const { data: trendingMints, isValidating: isTrendingMintsValidating } =
    useTrendingMints(mintsQuery, chain.id, {
      fallbackData: ssr.trendingMints,
      keepPreviousData: true,
    })

  let volumeKey: ComponentPropsWithoutRef<
    typeof CollectionRankingsTable
  >['volumeKey'] = '1day'

  switch (sortByTime) {
    case '30d':
      volumeKey = '30day'
      break
    case '7d':
      volumeKey = '7day'
      break
    case '24h':
      volumeKey = '1day'
      break
  }

  return (
    <Layout>
      <Head />
      <Box
        css={{
          p: 24,
          height: '100%',
          '@bp800': {
            px: '$5',
          },
          '@xl': {
            px: '$6',
          },
        }}
      >
        <Tabs.Root
          onValueChange={(value) => setTab(value as TabValue)}
          defaultValue="collections"
        >
          <Flex justify="between" align="start" css={{ mb: '$3' }}>
            <Text style="h4" as="h4">
              Trending
            </Text>
            {!isSmallDevice && (
              <Flex align="center" css={{ gap: '$4' }}>
                {tab === 'collections' ? (
                  <CollectionsTimeDropdown
                    compact={isSmallDevice && isMounted}
                    option={sortByTime}
                    onOptionSelected={setSortByTime}
                  />
                ) : (
                  <MintsPeriodDropdown
                    option={sortByPeriod}
                    onOptionSelected={setSortByPeriod}
                  />
                )}
                <ChainToggle />
              </Flex>
            )}
          </Flex>
          <TabsList css={{ mb: 24, mt: 0, borderBottom: 'none' }}>
            <TabsTrigger value="collections">Overview</TabsTrigger>
            <TabsTrigger value="mints">My Assets</TabsTrigger>
          </TabsList>

          {isSmallDevice && (
            <Flex justify="between" align="center" css={{ gap: 24, mb: '$4' }}>
              <Flex align="center" css={{ gap: '$4' }}>
                {tab === 'collections' ? (
                  <CollectionsTimeDropdown
                    compact={isSmallDevice && isMounted}
                    option={sortByTime}
                    onOptionSelected={setSortByTime}
                  />
                ) : (
                  <MintsPeriodDropdown
                    option={sortByPeriod}
                    onOptionSelected={setSortByPeriod}
                  />
                )}
                <ChainToggle />
              </Flex>
            </Flex>
          )}

          <TabsContent value="collections">
            <Box css={{ height: '100%' }}>
              <Flex direction="column">
                {isSSR || !isMounted ? null : (
                  <CollectionRankingsTable
                    collections={trendingCollections || []}
                    volumeKey={volumeKey}
                    loading={isTrendingCollectionsValidating}
                  />
                )}
                <Box
                  css={{
                    display: isTrendingCollectionsValidating ? 'none' : 'block',
                  }}
                />
              </Flex>
            </Box>
          </TabsContent>

          <TabsContent value="mints">
            <Box css={{ height: '100%' }}>
              <Flex direction="column">
                {isSSR || !isMounted ? null : (
                  <MintRankingsTable
                    mints={trendingMints || []}
                    loading={isTrendingMintsValidating}
                  />
                )}
                <Box
                  css={{
                    display: isTrendingCollectionsValidating ? 'none' : 'block',
                  }}
                />
              </Flex>
            </Box>
          </TabsContent>
        </Tabs.Root>

        <Box css={{ my: '$5' }}>
          <Link href={`/${marketplaceChain.routePrefix}/${tab}/trending`}>
            <Button>See More</Button>
          </Link>
        </Box>
      </Box>

      <Footer />
    </Layout>
  )
}

type TrendingCollectionsSchema =
  paths['/collections/trending/v1']['get']['responses']['200']['schema']
type TrendingMintsSchema =
  paths['/collections/trending-mints/v1']['get']['responses']['200']['schema']

export const getServerSideProps: GetServerSideProps<{
  ssr: {
    trendingMints: TrendingMintsSchema
    trendingCollections: TrendingCollectionsSchema
    featuredCollections: TrendingCollectionsSchema
  }
}> = async ({ params, res }) => {
  const chainPrefix = params?.chain || ''
  const { reservoirBaseUrl } =
    supportedChains.find((chain) => chain.routePrefix === chainPrefix) ||
    DefaultChain

  const headers: RequestInit = {
    headers: {
      'x-api-key': process.env.RESERVOIR_API_KEY || '',
    },
  }

  // Example queries
  let trendingCollectionsQuery: paths['/collections/trending/v1']['get']['parameters']['query'] =
    {
      period: '30d',
      limit: 50,
      sortBy: 'sales',
    }

  const trendingCollectionsPromise = fetcher(
    `${reservoirBaseUrl}/collections/trending/v1`,
    trendingCollectionsQuery,
    headers
  )

  let featuredCollectionQuery: paths['/collections/trending/v1']['get']['parameters']['query'] =
    {
      period: '24h',
      limit: 20,
      sortBy: 'sales',
    }

  const featuredCollectionsPromise = fetcher(
    `${reservoirBaseUrl}/collections/trending/v1`,
    featuredCollectionQuery,
    headers
  )

  let trendingMintsQuery: paths['/collections/trending-mints/v1']['get']['parameters']['query'] =
    {
      period: '24h',
      limit: 20,
      type: 'any',
    }

  const trendingMintsPromise = fetcher(
    `${reservoirBaseUrl}/collections/trending-mints/v1`,
    trendingMintsQuery,
    headers
  )

  // Remove .catch() because Promise.allSettled won't throw;
  // it always returns an array of settled results.
  const promises = await Promise.allSettled([
    trendingCollectionsPromise,
    featuredCollectionsPromise,
    trendingMintsPromise,
  ])

  console.log(
    'Trending Collections:',
    promises[0].status === 'fulfilled' ? promises[0].value.data : 'Failed to fetch'
  )
  // console.log('Featured Collections:', promises[1].status === 'fulfilled' ? promises[1].value.data : 'Failed to fetch');
  // console.log('Trending Mints:', promises[2].status === 'fulfilled' ? promises[2].value.data : 'Failed to fetch');

  const trendingCollections: TrendingCollectionsSchema =
    promises[0].status === 'fulfilled' && promises[0].value.data
      ? (promises[0].value.data as TrendingCollectionsSchema)
      : {}

  const featuredCollections: TrendingCollectionsSchema =
    promises[1].status === 'fulfilled' && promises[1].value.data
      ? (promises[1].value.data as TrendingCollectionsSchema)
      : {}

  const trendingMints: TrendingMintsSchema =
    promises[2].status === 'fulfilled' && promises[2].value.data
      ? (promises[2].value.data as TrendingMintsSchema)
      : {}

  // Example: Filter out non-ERC1155 from trendingCollections
  const provider = new JsonRpcProvider(process.env.INFURA_API_URL)
  if (trendingCollections.collections) {
    const checks = await Promise.all(
      trendingCollections.collections.map(async (collection) => {
        const standard = await checkTokenStandard(collection.id, provider)
        return { ...collection, standard }
      })
    )
    trendingCollections.collections = checks.filter(
      (c) => c.standard === 'erc1155'
    )
  }

  res.setHeader(
    'Cache-Control',
    'public, s-maxage=120, stale-while-revalidate=180'
  )

  return {
    props: {
      ssr: { trendingCollections, trendingMints, featuredCollections },
    },
  }
}

export default Home
