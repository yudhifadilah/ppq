const { client } = require('../db/database');
const PRODUCT_SET = 'products';

async function createProduct({ id, name, price, stock = 0, description = '' }) {
  const key = `product:${id}`;
  await client.hSet(key, {
    id, name, price: String(price), stock: String(stock), description
  });
  await client.sAdd(PRODUCT_SET, id);
  return id;
}

async function deleteProduct(id) {
  await client.del(`product:${id}`);
  await client.sRem(PRODUCT_SET, id);
}

async function listProducts() {
  const ids = await client.sMembers(PRODUCT_SET);
  const proms = ids.map(id => client.hGetAll(`product:${id}`));
  const rows = await Promise.all(proms);
  return rows.map(r => ({ ...r, price: Number(r.price), stock: Number(r.stock) }));
}

async function getProduct(id) {
  const p = await client.hGetAll(`product:${id}`);
  if (!p || !p.id) return null;
  return { ...p, price: Number(p.price), stock: Number(p.stock) };
}

module.exports = { createProduct, deleteProduct, listProducts, getProduct };
