const router = require('express').Router()
const bookCtrl =  require('../controllers/bookCtrl')
const reviewCtrl = require('../controllers/reviewCtrl')
router.post('/books',bookCtrl.postBook)
router.post('/',bookCtrl.getbooks)
router.post('/:id',bookCtrl.getabook)
router.get('/books/search/:keyword',bookCtrl.findabook)
router.get('/books/:id',bookCtrl.getabook)

router.get('/books/:category', async (req, res) => {
    try {
      const { category } = req.params;
      const query = `subject:${category}`; // Use the 'subject' parameter to filter by category
      const response = await axios.get('https://www.googleapis.com/books/v1/volumes', {
        params: {
          q: query,
          maxResults: 20, // Limit the number of results returned
          key: process.env.GOOGLE_BOOKS_API_KEY // Your Google Books API key
        }
      });
      const books = response.data.items.map(item => ({
        id: item.id,
        title: item.volumeInfo.title,
        authors: item.volumeInfo.authors,
        description: item.volumeInfo.description,
        image: item.volumeInfo.imageLinks?.thumbnail
      }));
      res.json(books);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
module.exports = router