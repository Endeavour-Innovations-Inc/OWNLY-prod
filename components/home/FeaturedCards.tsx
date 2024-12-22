import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Box, Flex, FormatCryptoCurrency, Text } from 'components/primitives';
import Img from 'components/primitives/Img';
import { useMarketplaceChain } from 'hooks';
import Link from 'next/link';
import dotenv from 'dotenv';

dotenv.config();

// Define the function to fetch data
async function fetchTrendingCollections() {
    try {
        const response = await axios.get('https://api.reservoir.tools/collections/trending-mints/v2', {
            headers: {
                'Accept': '*/*',
                'X-API-Key': process.env.RESERVOIR_API_KEY
            }
        });
        console.log("API Fetch Response:", response.data); // Log the raw API response
        return null;
    } catch (err) {
        console.error('Failed to fetch trending collections:', err);
        throw err;
    }
}

type TrendingCollections = any[];  // Assuming you have a more specific type

type FeaturedCardsProps = {
    collections: TrendingCollections;
    loading?: boolean;
}

export const FeaturedCards: React.FC<FeaturedCardsProps> = ({
    collections,
    loading,
}) => {
    const [localCollections, setLocalCollections] = useState<TrendingCollections>([]);
    const [isLoading, setLoading] = useState<boolean>(true);
    const marketplaceChain = useMarketplaceChain();

    useEffect(() => {
        console.log("Component mount/update - Starting fetch operation.");
        setLoading(true);
        fetchTrendingCollections().then(data => {
            const filteredCollections = data.filter(collection => collection.contractKind === 'erc1155');
            console.log("Filtered ERC-1155 Collections:", filteredCollections); // Log the filtered collections
            setLocalCollections(filteredCollections);
            setLoading(false);
        }).catch(err => {
            console.error('Error fetching data:', err);
            setLoading(false);
        });
    }, []);

    console.log("Render - Collections:", localCollections); // Log collections being rendered
    console.log("Render - Loading state:", isLoading); // Log current loading state

    if (!localCollections) return null;

    return (
        <>
            {!isLoading && localCollections.length === 0 ? (
                <Flex
                    direction="column"
                    align="center"
                    css={{ py: '$6', gap: '$4', width: '100%' }}
                >
                    <Text css={{ color: '$gray11' }}>
                        <FontAwesomeIcon icon={faMagnifyingGlass} size="2xl" />
                    </Text>
                    <Text css={{ color: '$gray11' }}>No ERC-1155 collections found</Text>
                </Flex>
            ) : (
                <Flex
                    direction="row"
                    align="center"
                    css={{
                        width: '100%',
                        overflowY: 'scroll',
                        padding: '10px 5px',
                        gap: '12px',
                    }}
                >
                    {localCollections.map((collection) => {
                        const bannerImage = collection?.banner || collection?.image || collection.sampleImages?.[0];
                        const collectionImage = collection?.image || collection?.banner || collection.sampleImages?.[0];

                        return (
                            <Link
                                key={collection.id}
                                href={`/${marketplaceChain.routePrefix}/collection/${collection.id}`}
                            >
                                <Flex
                                    direction="column"
                                    css={{
                                        flex: 1,
                                        width: '330px',
                                        height: '290px',
                                        borderRadius: 12,
                                        cursor: 'pointer',
                                        background: '$neutralBgSubtle',
                                        $$shadowColor: '$colors$panelShadow',
                                        boxShadow: '0px 0px 12px 0px $$shadowColor',
                                        p: '16px',
                                    }}
                                >
                                    <Flex
                                        css={{
                                            mb: '24px',
                                            width: '100%',
                                            height: '100%',
                                            position: 'relative',
                                        }}
                                    >
                                        <Img
                                            src={bannerImage as string}
                                            alt={collection.name as string}
                                            height={150}
                                            width={300}
                                            style={{
                                                objectFit: 'cover',
                                                borderRadius: 8,
                                            }}
                                        />
                                        <Img
                                            src={collectionImage as string}
                                            alt={collection.name as string}
                                            height={50}
                                            width={50}
                                            css={{
                                                height: '50px',
                                                width: '50px',
                                                position: 'absolute',
                                                inset: '95px 0px 5px 5px',
                                                border: '2px solid white',
                                                borderRadius: 8,
                                            }}
                                        />
                                    </Flex>
                                    <Flex
                                        direction="column"
                                        css={{
                                            width: '100%',
                                            height: '100%',
                                        }}
                                    >
                                        <Box
                                            css={{
                                                maxWidth: 720,
                                                lineHeight: 1.5,
                                                fontSize: 16,
                                                flex: 1,
                                                fontWeight: 400,
                                                display: '-webkit-box',
                                                color: '$gray12',
                                                fontFamily: '$body',
                                                WebkitLineClamp: 3,
                                                WebkitBoxOrient: 'vertical',
                                                gap: 16,
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                '& a': {
                                                    fontWeight: 500,
                                                    cursor: 'pointer',
                                                    textDecoration: 'underline',
                                                },
                                            }}
                                        >
                                            <Flex
                                                align="center"
                                                css={{
                                                    width: 'fit-content',
                                                    mb: 16,
                                                    gap: '$2',
                                                }}
                                            >
                                                <Text style="h6" as="h6" ellipsify>
                                                    {collection?.name}
                                                </Text>
                                            </Flex>
                                            <Flex>
                                                <Box css={{ mr: '$5' }}>
                                                    <Text
                                                        style="subtitle2"
                                                        color="subtle"
                                                        as="p"
                                                        css={{ mb: 2 }}
                                                    >
                                                        Floor
                                                    </Text>
                                                    <FormatCryptoCurrency
                                                        amount={
                                                            collection?.floorAsk?.price?.amount?.native ?? 0
                                                        }
                                                        textStyle={'h6'}
                                                        logoHeight={12}
                                                        address={
                                                            collection?.floorAsk?.price?.currency?.contract
                                                        }
                                                    />
                                                </Box>

                                                <Box css={{ mr: '$4' }}>
                                                    <Text style="subtitle2" color="subtle" as="p">
                                                        6h Sales
                                                    </Text>
                                                    <Text style="h6" as="h4" css={{ mt: 2 }}>
                                                        {collection.count?.toLocaleString()}
                                                    </Text>
                                                </Box>
                                            </Flex>
                                        </Box>
                                    </Flex>
                                </Flex>
                            </Link>
                        );
                    })}
                </Flex>
            )}
        </>
    );
};

export default FeaturedCards;
