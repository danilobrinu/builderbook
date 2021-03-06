import express from 'express';

import Book from '../models/Book';
import Chapter from '../models/Chapter';
import User from '../models/User';

const router = express.Router();

router.get('/books', async (req, res) => {
  try {
    const books = await Book.list();
    res.json(books);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

router.get('/books/:slug', async (req, res) => {
  try {
    const book = await Book.getBySlug({ slug: req.params.slug, userId: req.user && req.user.id });
    res.json(book);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

router.get('/get-chapter-detail', async (req, res) => {
  try {
    const { bookSlug, chapterSlug } = req.query;
    const chapter = await Chapter.getBySlug({
      bookSlug,
      chapterSlug,
      userId: req.user && req.user.id,
      isAdmin: req.user && req.user.isAdmin,
    });
    res.json(chapter);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

router.get('/get-tos', async (req, res) => {
  try {
    const user = await User.findOne({ isAdmin: true, tos: { $exists: true } }, 'tos');
    if (!user) {
      throw new Error('Not found');
    }
    res.json({ content: user.tos });
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

router.get('/get-table-of-contents', async (req, res) => {
  try {
    const book = await Book.findOne({ slug: req.query.slug }, 'id');
    if (!book) {
      throw new Error('Not found');
    }

    const chapters = await Chapter.find(
      { bookId: book.id, order: { $gt: 1 } },
      'sections title slug',
    ).sort({ order: 1 });

    res.json(chapters);
  } catch (err) {
    res.json({ error: err.message || err.toString() });
  }
});

export default router;
