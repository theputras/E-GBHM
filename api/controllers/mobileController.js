const { mysqldb } = require('./databaseController'); // ✅ ini ambil langsung pool MySQL-nya


// CREATE - Insert a new item
const createItem = async (req, res) => {
  const { item } = req.body;
  const insertQuery = 'INSERT INTO items (item) VALUES (?)';

  try {
    await mysqldb.query(insertQuery, [item]);
    res.status(201).json({ message: 'Item created successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Error inserting item', details: err });
  }
};

// READ - Get all items
const getItems = async (req, res) => {
  const selectQuery = 'SELECT * FROM items';

  try {
    const [rows] = await mysqldb.query(selectQuery);
    res.status(200).json(rows);
  } catch (err) {
    console.error('DB ERROR:', err); // Tambahkan ini untuk debugging
    res.status(500).json({ error: 'Error fetching items', details: err });
  }
};


// READ - Get a single item by ID
const getItemById = async (req, res) => {
  const { id } = req.params;
  const selectQuery = 'SELECT * FROM items WHERE id = ?';

  try {
    const [rows] = await mysqldb.query(selectQuery, [id]);
    if (rows.length > 0) {
      res.status(200).json(rows[0]);
    } else {
      res.status(404).json({ message: 'Item not found' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Error fetching item', details: err });
  }
};

// UPDATE - Update an item by ID
const updateItem = async (req, res) => {
  const { id } = req.params;
  const { item } = req.body;
  const updateQuery = 'UPDATE items SET item = ? WHERE id = ?';

  try {
    const [result] = await mysqldb.query(updateQuery, [item, id]);
    if (result.affectedRows > 0) {
      res.status(200).json({ message: 'Item updated successfully' });
    } else {
      res.status(404).json({ message: 'Item not found' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Error updating item', details: err });
  }
};

// DELETE - Delete an item by ID
const deleteItem = async (req, res) => {
  const { id } = req.params;
  const deleteQuery = 'DELETE FROM items WHERE id = ?';

  try {
    const [result] = await mysqldb.query(deleteQuery, [id]);
    if (result.affectedRows > 0) {
      res.status(200).json({ message: 'Item deleted successfully' });
    } else {
      res.status(404).json({ message: 'Item not found' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Error deleting item', details: err });
  }
};

module.exports = {
  createItem,
  getItems,
  getItemById,
  updateItem,
  deleteItem,
};
