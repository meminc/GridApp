"use client";
import { useEffect, useState, useRef } from "react";
import CytoscapeComponent from "react-cytoscapejs";
import { FaBolt, FaExclamationTriangle, FaCircle, FaStar, FaSquare, FaRandom, FaPlug } from "react-icons/fa";

const ICONS = {
  Bus: <FaCircle style={{ color: '#1976d2', marginRight: 4 }} />,
  Load: <FaPlug style={{ color: '#b71c1c', marginRight: 4 }} />,
  Generator: <FaStar style={{ color: '#fbc02d', marginRight: 4 }} />,
  Transformer: <FaSquare style={{ color: '#388e3c', marginRight: 4 }} />,
  Switch: <FaRandom style={{ color: '#888', marginRight: 4 }} />,
};

function getNodeIcon(type) {
  return ICONS[type] || <FaCircle style={{ color: '#888', marginRight: 4 }} />;
}

const MOCK_VOLTAGE = { 1: 0.98, 2: 0.91, 3: 1.04 };
const MOCK_ALARMS = { 2: 'Critical' };
const MOCK_POWER_FLOW = { 1: 120, 2: 80 };

function voltageColor(v) {
  if (v >= 1.02) return '#388e3c'; // green
  if (v >= 0.95) return '#1976d2'; // blue
  return '#b71c1c'; // red
}

function NodeForm({ onSubmit, onClose, initial, jwt }) {
  const [type, setType] = useState(initial?.type || "");
  const [name, setName] = useState(initial?.name || "");
  const [error, setError] = useState("");
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: '#0008', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <form
        onSubmit={e => {
          e.preventDefault();
          if (!type || !name) return setError("Type and name required");
          onSubmit({ type, name });
        }}
        style={{ background: '#fff', padding: 32, borderRadius: 12, minWidth: 320, boxShadow: '0 2px 12px #0002', display: 'flex', flexDirection: 'column', gap: 16 }}
      >
        <h3 style={{ margin: 0 }}>{initial ? "Edit Node" : "Add Node"}</h3>
        <input value={type} onChange={e => setType(e.target.value)} placeholder="Type (e.g. Bus)" style={{ padding: 8, borderRadius: 6, border: '1px solid #ccc' }} />
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Name" style={{ padding: 8, borderRadius: 6, border: '1px solid #ccc' }} />
        {error && <div style={{ color: '#b71c1c' }}>{error}</div>}
        <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
          <button type="submit" style={{ background: '#1976d2', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 18px', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>{initial ? "Save" : "Add"}</button>
          <button type="button" onClick={onClose} style={{ background: '#eee', color: '#222', border: 'none', borderRadius: 8, padding: '8px 18px', fontWeight: 500, fontSize: 15, cursor: 'pointer' }}>Cancel</button>
        </div>
      </form>
    </div>
  );
}

function EdgeForm({ onSubmit, onClose, initial, nodes }) {
  const [source, setSource] = useState(initial?.source || "");
  const [target, setTarget] = useState(initial?.target || "");
  const [type, setType] = useState(initial?.type || "");
  const [error, setError] = useState("");
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: '#0008', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <form
        onSubmit={e => {
          e.preventDefault();
          if (!source || !target || !type) return setError("All fields required");
          onSubmit({ source: Number(source), target: Number(target), type });
        }}
        style={{ background: '#fff', padding: 32, borderRadius: 12, minWidth: 320, boxShadow: '0 2px 12px #0002', display: 'flex', flexDirection: 'column', gap: 16 }}
      >
        <h3 style={{ margin: 0 }}>{initial ? "Edit Edge" : "Add Edge"}</h3>
        <select value={source} onChange={e => setSource(e.target.value)} style={{ padding: 8, borderRadius: 6, border: '1px solid #ccc' }}>
          <option value="">Source Node</option>
          {nodes.map(n => <option key={n.id} value={n.id}>{n.name} (ID {n.id})</option>)}
        </select>
        <select value={target} onChange={e => setTarget(e.target.value)} style={{ padding: 8, borderRadius: 6, border: '1px solid #ccc' }}>
          <option value="">Target Node</option>
          {nodes.map(n => <option key={n.id} value={n.id}>{n.name} (ID {n.id})</option>)}
        </select>
        <input value={type} onChange={e => setType(e.target.value)} placeholder="Type (e.g. CONNECTED_TO)" style={{ padding: 8, borderRadius: 6, border: '1px solid #ccc' }} />
        {error && <div style={{ color: '#b71c1c' }}>{error}</div>}
        <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
          <button type="submit" style={{ background: '#1976d2', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 18px', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>{initial ? "Save" : "Add"}</button>
          <button type="button" onClick={onClose} style={{ background: '#eee', color: '#222', border: 'none', borderRadius: 8, padding: '8px 18px', fontWeight: 500, fontSize: 15, cursor: 'pointer' }}>Cancel</button>
        </div>
      </form>
    </div>
  );
}

function NetworkViewerModal({ open, onClose, nodes, edges, telemetry }) {
  const [selected, setSelected] = useState(null);
  const [overlay, setOverlay] = useState('none');
  const cyRef = useRef(null);
  if (!open) return null;
  // Convert nodes/edges to Cytoscape format
  const cyNodes = nodes.map(n => {
    let label = n.name;
    let icon = getNodeIcon(n.type);
    let style = {};
    if (overlay === 'voltage' && telemetry.voltages[n.id]) {
      style.backgroundColor = voltageColor(telemetry.voltages[n.id]);
      label += `\nV=${telemetry.voltages[n.id]}`;
    }
    if (overlay === 'alarms' && telemetry.alarms[n.id]) {
      style.backgroundColor = '#b71c1c';
      label += '\nALARM!';
    }
    return {
      data: { id: String(n.id), label, type: n.type, icon },
      style,
    };
  });
  const cyEdges = edges.map(e => {
    let label = e.type;
    let style = {};
    if (overlay === 'power' && telemetry.powerFlow[e.id]) {
      style.lineColor = '#fbc02d';
      style.width = 4;
      label += `\nP=${telemetry.powerFlow[e.id]}MW`;
    }
    return {
      data: { id: String(e.id), source: String(e.source), target: String(e.target), label },
      style,
    };
  });
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: '#0008', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 2px 16px #0002', width: 900, height: 600, display: 'flex', flexDirection: 'row', overflow: 'hidden', position: 'relative' }}>
        <div style={{ flex: 2, background: '#f4f8fb', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start' }}>
          <div style={{ display: 'flex', gap: 12, margin: '18px 0 8px 0' }}>
            <button onClick={() => setOverlay('none')} style={{ background: overlay==='none'?'#1976d2':'#eee', color: overlay==='none'?'#fff':'#222', border: 'none', borderRadius: 8, padding: '6px 14px', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>Elements</button>
            <button onClick={() => setOverlay('voltage')} style={{ background: overlay==='voltage'?'#1976d2':'#eee', color: overlay==='voltage'?'#fff':'#222', border: 'none', borderRadius: 8, padding: '6px 14px', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>Voltage</button>
            <button onClick={() => setOverlay('alarms')} style={{ background: overlay==='alarms'?'#b71c1c':'#eee', color: overlay==='alarms'?'#fff':'#222', border: 'none', borderRadius: 8, padding: '6px 14px', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>Alarms</button>
            <button onClick={() => setOverlay('power')} style={{ background: overlay==='power'?'#fbc02d':'#eee', color: overlay==='power'?'#fff':'#222', border: 'none', borderRadius: 8, padding: '6px 14px', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>Power Flow</button>
          </div>
          <CytoscapeComponent
            elements={[...cyNodes, ...cyEdges]}
            style={{ width: 600, height: 520, background: '#f4f8fb', borderRadius: 10 }}
            cy={cy => {
              cyRef.current = cy;
              cy.on('select', 'node,edge', (evt) => {
                setSelected(evt.target.data());
              });
              cy.on('unselect', 'node,edge', () => setSelected(null));
              cy.userZoomingEnabled(true);
              cy.userPanningEnabled(true);
              cy.autoungrabify(false);
              cy.nodes().ungrabify(false);
              cy.nodes().on('drag', () => {});
              cy.style()
                .selector('node')
                .style({
                  'background-color': 'data(style.backgroundColor)',
                  'label': 'data(label)',
                  'text-valign': 'center',
                  'text-halign': 'center',
                  'font-size': 16,
                  'width': 36,
                  'height': 36,
                  'border-width': 2,
                  'border-color': '#222',
                  'text-wrap': 'wrap',
                  'text-max-width': 60,
                })
                .selector('edge')
                .style({
                  'line-color': 'data(style.lineColor)',
                  'width': 'data(style.width)',
                  'label': 'data(label)',
                  'font-size': 13,
                  'target-arrow-shape': 'triangle',
                  'target-arrow-color': '#888',
                  'curve-style': 'bezier',
                })
                .update();
            }}
            layout={{ name: 'cose', animate: false }}
            boxSelectionEnabled={true}
            minZoom={0.2}
            maxZoom={2}
          />
        </div>
        <div style={{ flex: 1, background: '#f7f7fa', borderLeft: '1px solid #e5e7eb', padding: 24, minWidth: 260 }}>
          <h3 style={{ fontSize: 18, marginBottom: 16 }}>Element Details</h3>
          {selected ? (
            <div style={{ color: '#333', fontSize: 15 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                {getNodeIcon(selected.type)}
                <b>{selected.label}</b>
              </div>
              {selected.type && <div><b>Type:</b> {selected.type}</div>}
              {selected.source && <div><b>Source:</b> {selected.source}</div>}
              {selected.target && <div><b>Target:</b> {selected.target}</div>}
              <div><b>ID:</b> {selected.id}</div>
              {overlay === 'voltage' && selected.id && telemetry.voltages[selected.id] && (
                <div><b>Voltage:</b> {telemetry.voltages[selected.id]}</div>
              )}
              {overlay === 'alarms' && selected.id && telemetry.alarms[selected.id] && (
                <div style={{ color: '#b71c1c' }}><b>ALARM!</b></div>
              )}
              {overlay === 'power' && selected.id && telemetry.powerFlow[selected.id] && (
                <div><b>Power Flow:</b> {telemetry.powerFlow[selected.id]} MW</div>
              )}
            </div>
          ) : <div style={{ color: '#888', fontSize: 15 }}>Select a node or edge to view details here.</div>}
        </div>
        <button onClick={onClose} style={{ position: 'absolute', top: 18, right: 18, background: '#eee', border: 'none', borderRadius: 8, padding: '6px 16px', fontWeight: 600, fontSize: 16, cursor: 'pointer' }}>Close</button>
      </div>
    </div>
  );
}

export default function TopologyPage() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showNodeForm, setShowNodeForm] = useState(false);
  const [editNode, setEditNode] = useState(null);
  const [showEdgeForm, setShowEdgeForm] = useState(false);
  const [editEdge, setEditEdge] = useState(null);
  const [jwt, setJwt] = useState(null);
  const [showNetworkViewer, setShowNetworkViewer] = useState(false);
  const [telemetry, setTelemetry] = useState({ voltages: {}, alarms: {}, powerFlow: {} });

  function refresh() {
    setLoading(true);
    Promise.all([
      fetch("http://localhost:4000/topology/nodes").then(res => res.json()),
      fetch("http://localhost:4000/topology/edges").then(res => res.json()),
      fetch("http://localhost:4000/telemetry").then(res => res.json()),
    ])
      .then(([nodesData, edgesData, telemetryData]) => {
        setNodes(nodesData);
        setEdges(edgesData);
        setTelemetry(telemetryData);
      })
      .catch(() => setError("Failed to load topology"))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    setJwt(localStorage.getItem("jwt"));
    refresh();
  }, []);

  async function handleAddNode(data) {
    await fetch("http://localhost:4000/topology/nodes", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${jwt}` },
      body: JSON.stringify(data),
    });
    setShowNodeForm(false);
    refresh();
  }
  async function handleEditNode(id, data) {
    await fetch(`http://localhost:4000/topology/nodes/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${jwt}` },
      body: JSON.stringify(data),
    });
    setEditNode(null);
    refresh();
  }
  async function handleDeleteNode(id) {
    await fetch(`http://localhost:4000/topology/nodes/${id}`, {
      method: "DELETE", headers: { Authorization: `Bearer ${jwt}` } });
    refresh();
  }
  async function handleAddEdge(data) {
    await fetch("http://localhost:4000/topology/edges", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${jwt}` },
      body: JSON.stringify(data),
    });
    setShowEdgeForm(false);
    refresh();
  }
  async function handleEditEdge(id, data) {
    await fetch(`http://localhost:4000/topology/edges/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${jwt}` },
      body: JSON.stringify(data),
    });
    setEditEdge(null);
    refresh();
  }
  async function handleDeleteEdge(id) {
    await fetch(`http://localhost:4000/topology/edges/${id}`, {
      method: "DELETE", headers: { Authorization: `Bearer ${jwt}` } });
    refresh();
  }

  if (loading) return <div style={{marginTop:40,textAlign:'center'}}>Loading...</div>;
  if (error) return <div style={{marginTop:40,textAlign:'center',color:'#b71c1c'}}>{error}</div>;

  return (
    <div style={{ maxWidth: 900, margin: '40px auto', background: '#f8fafc', padding: 32, borderRadius: 12, boxShadow: '0 2px 12px #0001' }}>
      <h2 style={{ fontSize: 24, marginBottom: 24 }}>Topology Management</h2>
      <div style={{ marginBottom: 24, display: 'flex', gap: 12 }}>
        <button onClick={() => setShowNodeForm(true)} disabled={!jwt} style={{ background: '#1976d2', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 18px', fontWeight: 600, fontSize: 15, cursor: jwt ? 'pointer' : 'not-allowed', boxShadow: '0 1px 4px #0001' }}>
          ＋ Add Node
        </button>
        <button onClick={() => setShowEdgeForm(true)} disabled={!jwt} style={{ background: '#388e3c', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 18px', fontWeight: 600, fontSize: 15, cursor: jwt ? 'pointer' : 'not-allowed', boxShadow: '0 1px 4px #0001' }}>
          ＋ Add Edge
        </button>
        <button onClick={() => setShowNetworkViewer(true)} style={{ background: '#222', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 18px', fontWeight: 600, fontSize: 15, cursor: 'pointer', boxShadow: '0 1px 4px #0001' }}>
          🕸️ Open Network Viewer
        </button>
      </div>
      <NetworkViewerModal open={showNetworkViewer} onClose={() => setShowNetworkViewer(false)} nodes={nodes} edges={edges} telemetry={telemetry} />
      <h3 style={{ fontSize: 18, marginBottom: 10 }}>Nodes</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', marginBottom: 24 }}>
        <thead>
          <tr style={{ background: '#e3eaf6' }}>
            <th style={{ textAlign: 'left', padding: 10 }}>ID</th>
            <th style={{ textAlign: 'left', padding: 10 }}>Type</th>
            <th style={{ textAlign: 'left', padding: 10 }}>Name</th>
            <th style={{ textAlign: 'left', padding: 10 }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {nodes.map(n => (
            <tr key={n.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
              <td style={{ padding: 10 }}>{n.id}</td>
              <td style={{ padding: 10 }}>{n.type}</td>
              <td style={{ padding: 10 }}>{n.name}</td>
              <td style={{ padding: 10 }}>
                <button onClick={() => setEditNode(n)} disabled={!jwt} style={{ marginRight: 8, background: '#eee', border: 'none', borderRadius: 6, padding: '4px 10px', cursor: jwt ? 'pointer' : 'not-allowed' }}>Edit</button>
                <button onClick={() => handleDeleteNode(n.id)} disabled={!jwt} style={{ background: '#b71c1c', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 10px', cursor: jwt ? 'pointer' : 'not-allowed' }}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <h3 style={{ fontSize: 18, marginBottom: 10 }}>Edges</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff' }}>
        <thead>
          <tr style={{ background: '#e3eaf6' }}>
            <th style={{ textAlign: 'left', padding: 10 }}>ID</th>
            <th style={{ textAlign: 'left', padding: 10 }}>Source</th>
            <th style={{ textAlign: 'left', padding: 10 }}>Target</th>
            <th style={{ textAlign: 'left', padding: 10 }}>Type</th>
            <th style={{ textAlign: 'left', padding: 10 }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {edges.map(e => (
            <tr key={e.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
              <td style={{ padding: 10 }}>{e.id}</td>
              <td style={{ padding: 10 }}>{e.source}</td>
              <td style={{ padding: 10 }}>{e.target}</td>
              <td style={{ padding: 10 }}>{e.type}</td>
              <td style={{ padding: 10 }}>
                <button onClick={() => setEditEdge(e)} disabled={!jwt} style={{ marginRight: 8, background: '#eee', border: 'none', borderRadius: 6, padding: '4px 10px', cursor: jwt ? 'pointer' : 'not-allowed' }}>Edit</button>
                <button onClick={() => handleDeleteEdge(e.id)} disabled={!jwt} style={{ background: '#b71c1c', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 10px', cursor: jwt ? 'pointer' : 'not-allowed' }}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {showNodeForm && <NodeForm onSubmit={handleAddNode} onClose={() => setShowNodeForm(false)} jwt={jwt} />}
      {editNode && <NodeForm onSubmit={data => handleEditNode(editNode.id, data)} onClose={() => setEditNode(null)} initial={editNode} jwt={jwt} />}
      {showEdgeForm && <EdgeForm onSubmit={handleAddEdge} onClose={() => setShowEdgeForm(false)} nodes={nodes} />}
      {editEdge && <EdgeForm onSubmit={data => handleEditEdge(editEdge.id, data)} onClose={() => setEditEdge(null)} initial={editEdge} nodes={nodes} />}
    </div>
  );
} 