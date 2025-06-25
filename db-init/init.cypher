// Initial schema for Neo4j
CREATE CONSTRAINT IF NOT EXISTS FOR (b:Bus) REQUIRE b.id IS UNIQUE;
CREATE (b:Bus {id: 'bus-1', name: 'Main Bus'}); 