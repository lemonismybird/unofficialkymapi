const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');
const apicache = require('apicache');
const rateLimit = require('express-rate-limit');
const app = express();

// Configuration
const API_BASE = '/unofficialkymapi/api/v1';
const CACHE_DURATION = '24 hours';
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(apicache.middleware(CACHE_DURATION));

// Rate Limiting
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false
}));

// Randomized User Agents
const userAgents = [
"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",  
"Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/118.0",  
"Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",  
"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",  
"Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",  
"Mozilla/5.0 (Android 14; Mobile; rv:109.0) Gecko/118.0 Firefox/118.0",  
"Mozilla/5.0 (Windows NT 11.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0",  
"Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",  
"Opera/9.80 (Windows NT 10.0; Win64; x64) Presto/2.12.388 Version/12.18",  
"Mozilla/5.0 (Linux; Android 14; SM-G998B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",  
"Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/118.0",  
"Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",  
"Mozilla/5.0 (Windows NT 10.0; Trident/7.0; rv:11.0) like Gecko",  
"Mozilla/5.0 (Linux; Android 14; Pixel 7 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",  
"Mozilla/5.0 (PlayStation 5) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",  
"Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Vivaldi/6.2",  
"Mozilla/5.0 (X11; Fedora; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",  
"Mozilla/5.0 (Linux; Android 14; SM-S901B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",  
"Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 OPR/82.0.0.0",  
"Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/118.0 PaleMoon/33.0.0"
];

const axiosInstance = axios.create({
  headers: {
    'User-Agent': userAgents[Math.floor(Math.random() * userAgents.length)]
  }
});

// Meme Data Parser
const parseMemeDetails = ($) => ({
  name: $('h1').text().trim(),
  about: $('#entry').text().trim(),
  origin: $('#origin').text().trim(),
  spread: $('#spread').text().trim(),
  image: $('.meme-details img.photo').attr('src'),
  status: $('dd.status').text().trim(),
  views: parseInt($('dd.views').text().replace(/\D/g, '')) || 0,
  tags: $('.tags a').map((i, el) => $(el).text().trim()).get(),
  references: {
    videos: $('.entry-video iframe').map((i, el) => $(el).attr('src')).get(),
    links: $('.reference-list li a').map((i, el) => ({
      text: $(el).text().trim(),
      url: $(el).attr('href')
    })).get()
  }
});

// 1. Direct Meme Endpoint
app.get(`${API_BASE}/memes/:meme`, async (req, res) => {
  try {
    const { data } = await axiosInstance.get(
      `https://knowyourmeme.com/memes/${encodeURIComponent(req.params.meme)}`
    );
    const $ = cheerio.load(data);
    
    res.json({
      status: 'success',
      data: parseMemeDetails($)
    });
  } catch (error) {
    res.status(404).json({
      status: 'error',
      message: 'Meme not found'
    });
  }
});

// 2. Search Endpoint
app.get(`${API_BASE}/memes/search`, async (req, res) => {
  try {
    const query = req.query.query;
    const page = req.query.pagenum || 1;

    if (!query) return res.status(400).json({ 
      status: 'error', 
      message: 'Missing search query' 
    });

    const { data } = await axiosInstance.get(
      `https://knowyourmeme.com/search?q=${encodeURIComponent(query)}&page=${page}`
    );
    const $ = cheerio.load(data);

    const results = $('.entry-grid-body tr').map((i, el) => ({
      name: $(el).find('.subject').text().trim(),
      url: $(el).find('a').attr('href'),
      image: $(el).find('img').attr('src'),
      description: $(el).find('.meta').text().trim(),
      views: parseInt($(el).find('.views').text().replace(/\D/g, '')) || 0
    })).get();

    const pagination = {
      current_page: Number(page),
      total_pages: parseInt($('.pagination li').last().prev().text() || 1),
      total_results: parseInt($('.counter').text().match(/\d+/)?.[0] || 0)
    };

    res.json({
      status: 'success',
      data: { results, pagination }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Search failed'
    });
  }
});

// Cache Management
setInterval(apicache.clear, 24 * 60 * 60 * 1000);
app.use((req, res, next) => {
  res.set('Cache-Control', req.query.nocache ? 
    'no-store' : 'public, max-age=86400'
  );
  next();
});

app.listen(PORT, () => 
  console.log(`API running on port ${PORT} | Endpoints:
  • /memes/{meme}
  • /memes/search?query={term}&pagenum={page}`)
);
