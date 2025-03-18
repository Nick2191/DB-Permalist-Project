import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = process.env.PORT;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

/* let items = [
  { id: 1, title: "Buy milk" },
  { id: 2, title: "Finish homework" },
]; */

const db = new pg.Client({
  user: process.env.DATABASE_USER,
  host: process.env.DATABASE_HOST,
  database: process.env.DATABASE_NAME,
  password: process.env.DATABASE_PASSWORD,
  port: process.env.DATABASE_PORT,
});

db.connect();

async function getItems() {
  const data = await db.query(`SELECT * FROM ${process.env.DB_TABLE_NAME} ORDER BY id ASC; `);
  let items = [];
  data.rows.forEach((item) => {
    items.push({ id: item.id, title: item.title });
  });
  return items;
}

async function addItem(newItem) {
  db.query(`INSERT INTO ${process.env.DB_TABLE_NAME} (title) VALUES ($1)`, [newItem]);
}

async function editItem(title, id) {
  db.query(`UPDATE ${process.env.DB_TABLE_NAME} SET title = $1 WHERE id = $2`, [title, id]);
}

async function deleteItem(id) {
  db.query(`DELETE FROM ${process.env.DB_TABLE_NAME} WHERE id = $1`, [id]);
}

app.get("/", async (req, res) => {

  try {
    let items = await getItems();
    res.render("index.ejs", {
    listTitle: "Today",
    listItems: items,
  });
  } catch (error) {
    console.log(error);
  }
});

app.post("/add", async (req, res) => {
  const newItem = req.body.newItem;

  try {
    await addItem(newItem);
    /* items.push({ title: item }); */
    res.redirect("/");
  } catch (error) {
    console.log(error);
  }
});

app.post("/edit", async (req, res) => {
  const editedID = req.body.updatedItemId;
  const editedItem = req.body.updatedItemTitle;

  try {
    await editItem(editedItem, editedID);
    res.redirect("/");
  } catch (error) {
    console.log(error);
  }
});

app.post("/delete", async (req, res) => {
  const deleteId = req.body.deleteItemId;

  try {
    await deleteItem(deleteId);
    res.redirect("/");
  } catch (error) {
    console.log(error);
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

/* app.get("/test", async (req, res) => {
  let items = await getItems();
  res.json(items);
}); */