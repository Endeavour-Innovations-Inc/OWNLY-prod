const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

async function fetchTrendingCollections() {
    const options = {
        method: 'GET',
        url: 'https://api.reservoir.tools/collections/trending/v1',
        headers: {
            'Accept': '*/*',
            'X-API-Key': process.env.RESERVOIR_API_KEY // Ensure the environment variable is correct
        }
    };

    try {
        const response = await axios(options);
        return response.data;
    } catch (err) {
        console.error('Failed to fetch trending collections:', err);
        throw err;
    }
}

fetchTrendingCollections()
    .then(data => console.log('Fetched data:', data))
    .catch(err => console.error('Error fetching data:', err));
