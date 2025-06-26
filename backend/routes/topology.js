const express = require('express');
const router = express.Router();
const { getSession } = require('../neo4j');
const { authMiddleware } = require('../middleware/auth');

// Helper: map Neo4j node/edge to API object
function mapNode(record) {
  const n = record.get('n').properties;
  return { id: Number(n.id), type: n.type, name: n.name };
}
function mapEdge(record) {
  const e = record.get('e').properties;
  return { id: Number(e.id), source: Number(e.source), target: Number(e.target), type: e.type };
}

// Nodes CRUD
router.get('/nodes', async (req, res) => {
  const session = getSession();
  try {
    const result = await session.run('MATCH (n) RETURN n');
    res.json(result.records.map(mapNode));
  } catch (e) {
    res.status(500).json({ error: 'Neo4j error' });
  } finally {
    await session.close();
  }
});
router.get('/nodes/:id', async (req, res) => {
  const session = getSession();
  try {
    const result = await session.run('MATCH (n {id: $id}) RETURN n', { id: req.params.id });
    if (!result.records.length) return res.status(404).json({ error: 'Not found' });
    res.json(mapNode(result.records[0]));
  } catch (e) {
    res.status(500).json({ error: 'Neo4j error' });
  } finally {
    await session.close();
  }
});
router.post('/nodes', authMiddleware, async (req, res) => {
  const { type, name } = req.body;
  if (!type || !name) return res.status(400).json({ error: 'Missing fields' });
  const session = getSession();
  try {
    // Find max id
    const maxIdResult = await session.run('MATCH (n) RETURN max(toInteger(n.id)) as maxId');
    const nextId = (maxIdResult.records[0].get('maxId') || 0) + 1;
    const result = await session.run('CREATE (n {id: $id, type: $type, name: $name}) RETURN n', { id: String(nextId), type, name });
    res.status(201).json(mapNode(result.records[0]));
  } catch (e) {
    res.status(500).json({ error: 'Neo4j error' });
  } finally {
    await session.close();
  }
});
router.put('/nodes/:id', authMiddleware, async (req, res) => {
  const { type, name } = req.body;
  const session = getSession();
  try {
    const result = await session.run('MATCH (n {id: $id}) SET n.type = $type, n.name = $name RETURN n', { id: req.params.id, type, name });
    if (!result.records.length) return res.status(404).json({ error: 'Not found' });
    res.json(mapNode(result.records[0]));
  } catch (e) {
    res.status(500).json({ error: 'Neo4j error' });
  } finally {
    await session.close();
  }
});
router.delete('/nodes/:id', authMiddleware, async (req, res) => {
  const session = getSession();
  try {
    const result = await session.run('MATCH (n {id: $id}) DETACH DELETE n RETURN n', { id: req.params.id });
    if (!result.summary.counters.updates().nodesDeleted) return res.status(404).json({ error: 'Not found' });
    res.json({ id: Number(req.params.id) });
  } catch (e) {
    res.status(500).json({ error: 'Neo4j error' });
  } finally {
    await session.close();
  }
});

// Edges CRUD
router.get('/edges', async (req, res) => {
  const session = getSession();
  try {
    const result = await session.run('MATCH (a)-[e]->(b) RETURN e');
    res.json(result.records.map(mapEdge));
  } catch (e) {
    res.status(500).json({ error: 'Neo4j error' });
  } finally {
    await session.close();
  }
});
router.get('/edges/:id', async (req, res) => {
  const session = getSession();
  try {
    const result = await session.run('MATCH ()-[e {id: $id}]->() RETURN e', { id: req.params.id });
    if (!result.records.length) return res.status(404).json({ error: 'Not found' });
    res.json(mapEdge(result.records[0]));
  } catch (e) {
    res.status(500).json({ error: 'Neo4j error' });
  } finally {
    await session.close();
  }
});
router.post('/edges', authMiddleware, async (req, res) => {
  const { source, target, type } = req.body;
  if (!source || !target || !type) return res.status(400).json({ error: 'Missing fields' });
  const session = getSession();
  try {
    // Find max id
    const maxIdResult = await session.run('MATCH ()-[e]->() RETURN max(toInteger(e.id)) as maxId');
    const nextId = (maxIdResult.records[0].get('maxId') || 0) + 1;
    const result = await session.run(
      'MATCH (a {id: $source}), (b {id: $target}) CREATE (a)-[e:{type} {id: $id, source: $source, target: $target, type: $type}]->(b) RETURN e',
      { id: String(nextId), source: String(source), target: String(target), type }
    );
    res.status(201).json(mapEdge(result.records[0]));
  } catch (e) {
    res.status(500).json({ error: 'Neo4j error' });
  } finally {
    await session.close();
  }
});
router.put('/edges/:id', authMiddleware, async (req, res) => {
  const { source, target, type } = req.body;
  const session = getSession();
  try {
    // Neo4j does not support updating relationship endpoints, so delete and recreate
    await session.run('MATCH ()-[e {id: $id}]->() DELETE e', { id: req.params.id });
    const result = await session.run(
      'MATCH (a {id: $source}), (b {id: $target}) CREATE (a)-[e:{type} {id: $id, source: $source, target: $target, type: $type}]->(b) RETURN e',
      { id: req.params.id, source: String(source), target: String(target), type }
    );
    res.json(mapEdge(result.records[0]));
  } catch (e) {
    res.status(500).json({ error: 'Neo4j error' });
  } finally {
    await session.close();
  }
});
router.delete('/edges/:id', authMiddleware, async (req, res) => {
  const session = getSession();
  try {
    const result = await session.run('MATCH ()-[e {id: $id}]->() DELETE e RETURN e', { id: req.params.id });
    if (!result.summary.counters.updates().relationshipsDeleted) return res.status(404).json({ error: 'Not found' });
    res.json({ id: Number(req.params.id) });
  } catch (e) {
    res.status(500).json({ error: 'Neo4j error' });
  } finally {
    await session.close();
  }
});

module.exports = router; 