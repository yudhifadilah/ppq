const { client } = require('../db/database');
const ORDER_SET = 'orders';

function orderKey(id) { return `order:${id}`; }

async function createOrder({ id, userId, items, total, status = 'pending', phone = '', address = '' }) {
  const key = orderKey(id);
  await client.hSet(key, {
    id, userId: String(userId), items: JSON.stringify(items), total: String(total), status, phone, address, createdAt: String(Date.now())
  });
  await client.sAdd(ORDER_SET, id);
  return id;
}

async function getOrder(id) {
  const o = await client.hGetAll(orderKey(id));
  if (!o || !o.id) return null;
  try { o.items = JSON.parse(o.items); } catch (e) { o.items = []; }
  o.total = Number(o.total);
  return o;
}

async function updateOrder(id, patch) {
  const key = orderKey(id);
  const flat = {};
  for (const k in patch) {
    flat[k] = (typeof patch[k] === 'object') ? JSON.stringify(patch[k]) : String(patch[k]);
  }
  await client.hSet(key, flat);
}

async function listOrders() {
  const ids = await client.sMembers(ORDER_SET);
  const proms = ids.map(id => getOrder(id));
  return Promise.all(proms);
}

module.exports = { createOrder, getOrder, updateOrder, listOrders };
