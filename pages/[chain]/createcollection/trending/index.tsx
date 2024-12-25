import { useState } from 'react'
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
  const { switchCurrentChain } = useContext(ChainContext)

  // Example local states for your form inputs
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [collectionName, setCollectionName] = useState('')
  const [amountMinted, setAmountMinted] = useState('')
  const [tiktokLink, setTiktokLink] = useState('')
  const [instagramLink, setInstagramLink] = useState('')
  const [youtubeLink, setYoutubeLink] = useState('')

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

  // Handle form submission
  const handleCreateCollection = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // This is where you'd typically call an API or smart contract interaction.
    // For now, just log the values to verify they’re being captured.
    console.log('Selected Image:', selectedImage)
    console.log('Collection Name:', collectionName)
    console.log('Amount to Mint:', amountMinted)
    console.log('TikTok Link:', tiktokLink)
    console.log('Instagram Link:', instagramLink)
    console.log('YouTube Link:', youtubeLink)

    // Reset form (optional)
    // setSelectedImage(null)
    // setCollectionName('')
    // setAmountMinted('')
    // setTiktokLink('')
    // setInstagramLink('')
    // setYoutubeLink('')
  }

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

          {/* Form for creating a new NFT collection */}
          <Box
            as="form"
            onSubmit={handleCreateCollection}
            css={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              maxWidth: 400,
            }}
          >
            {/* 1. File input for the collection image (drag-and-drop or select) */}
            <label htmlFor="collectionImage">Collection Image:</label>
            <input
              id="collectionImage"
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0]
                setSelectedImage(file || null)
              }}
              style={{
                padding: '8px',
                border: '1px solid #ccc',
                borderRadius: '4px',
              }}
            />

            {/* 2. Name of the collection */}
            <label htmlFor="collectionName">Collection Name:</label>
            <input
              id="collectionName"
              type="text"
              value={collectionName}
              onChange={(e) => setCollectionName(e.target.value)}
              placeholder="Enter a name for your NFT collection"
              style={{
                padding: '8px',
                border: '1px solid #ccc',
                borderRadius: '4px',
              }}
            />

            {/* 3. Amount minted */}
            <label htmlFor="amountMinted">Amount to Mint:</label>
            <input
              id="amountMinted"
              type="number"
              value={amountMinted}
              onChange={(e) => setAmountMinted(e.target.value)}
              placeholder="Enter total supply"
              style={{
                padding: '8px',
                border: '1px solid #ccc',
                borderRadius: '4px',
              }}
            />

            {/* Social links: TikTok, Instagram, YouTube */}
            <label htmlFor="tiktokLink">TikTok Link:</label>
            <input
              id="tiktokLink"
              type="url"
              value={tiktokLink}
              onChange={(e) => setTiktokLink(e.target.value)}
              placeholder="https://www.tiktok.com/@yourprofile"
              style={{
                padding: '8px',
                border: '1px solid #ccc',
                borderRadius: '4px',
              }}
            />

            <label htmlFor="instagramLink">Instagram Link:</label>
            <input
              id="instagramLink"
              type="url"
              value={instagramLink}
              onChange={(e) => setInstagramLink(e.target.value)}
              placeholder="https://www.instagram.com/yourprofile"
              style={{
                padding: '8px',
                border: '1px solid #ccc',
                borderRadius: '4px',
              }}
            />

            <label htmlFor="youtubeLink">YouTube Link:</label>
            <input
              id="youtubeLink"
              type="url"
              value={youtubeLink}
              onChange={(e) => setYoutubeLink(e.target.value)}
              placeholder="https://www.youtube.com/channel/yourchannel"
              style={{
                padding: '8px',
                border: '1px solid #ccc',
                borderRadius: '4px',
              }}
            />

            {/* 4. Button to create the NFT */}
            <button
              type="submit"
              style={{
                backgroundColor: '#6366F1', // Example color
                color: '#fff',
                padding: '10px 20px',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '1rem',
              }}
            >
              Create NFT
            </button>
          </Box>
        </Flex>
      </Box>

      {/* The Layout component presumably includes your site footer.
          If you have a separate <Footer /> component, you can include it here. */}
    </Layout>
  )
}

export default IndexPage
