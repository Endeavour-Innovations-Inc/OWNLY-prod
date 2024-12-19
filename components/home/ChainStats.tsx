import { FC, useMemo } from 'react'
import { Flex, FormatCryptoCurrency, Text } from '../primitives'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  IconDefinition,
  faImage,
  faShoppingCart,
  faSprout,
} from '@fortawesome/free-solid-svg-icons'
import { useChainStats, useMarketplaceChain } from 'hooks'
import { formatNumber } from 'utils/numbers'

// Define the structure of each section in the stats display
type Section = {
  title: string
  stat: string | JSX.Element
  icon: IconDefinition
}

export const ChainStats = () => {
  // Fetch chain statistics data and the current marketplace chain
  const { data: statsData } = useChainStats()
  const stats = statsData?.stats?.['7day'] // Extract 7-day stats from fetched data
  const chain = useMarketplaceChain()

  // Memoize the sections to avoid unnecessary recalculations
  const statsSections = useMemo(() => {
    const sections: Section[] = [
      {
        title: '7d Mints', // Title for mint statistics over the last 7 days
        stat: '-', // Default display when no data is available
        icon: faSprout, // Icon representing mints
      },
      {
        title: '7d Secondary Sales', // Title for secondary sales statistics over the last 7 days
        stat: '-', // Default display when no data is available
        icon: faShoppingCart, // Icon representing secondary sales
      },
      {
        title: '7d Total Volume', // Title for total volume over the last 7 days
        stat: '-', // Default display when no data is available
        icon: faImage, // Icon representing total volume
      },
    ]
    if (stats) {
      // Update statistics if data is available
      sections[0].stat = `${
        stats.mintCount ? formatNumber(stats.mintCount) : 0 // Format mint count or display 0
      }`
      sections[1].stat = `${
        stats.saleCount ? formatNumber(stats.saleCount) : 0 // Format sale count or display 0
      }`
      sections[2].stat = (
        <FormatCryptoCurrency
          amount={stats.totalVolume} // Format total volume as a cryptocurrency value
          textStyle="h6"
          logoHeight={14}
        />
      )
    }
    return sections // Return the updated sections array
  }, [stats, chain])

  return (
    <Flex css={{ gap: 24 }}> // Flex container for the sections with a gap of 24px
      {statsSections.map((section, i) => (
        <Flex
          key={i} // Unique key for each section
          align="center" // Center alignment within the flex item
          css={{
            border: '1px solid', // Border styling
            borderColor: '$gray6', // Border color
            p: '$4', // Padding
            borderRadius: 8, // Rounded corners
            gap: '$4', // Gap between elements in the flex item
            flex: 1, // Flex grow to take available space
          }}
        >
          <FontAwesomeIcon
            icon={section.icon} // Display icon for the section
            width={25}
            height={25}
            color="#9BA1A6"
          />
          <Flex direction="column" css={{ gap: '$2' }}> // Column direction for text elements
            <Text style="subtitle2" color="subtle">
              {section.title} // Display the title of the section
            </Text>
            <Text style="h6">{section.stat} // Display the statistics value or element
            </Text>
          </Flex>
        </Flex>
      ))}
    </Flex>
  )
}
