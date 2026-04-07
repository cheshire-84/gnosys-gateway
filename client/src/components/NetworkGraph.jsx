import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

export default function NetworkGraph({ services, currentUser }) {
  const svgRef = useRef();
  const prevStatuses = useRef({});

  useEffect(() => {
    if (!services || services.length === 0) return;

    const nodes = [{ id: 'GATEWAY', group: 1, label: currentUser || 'ROOT' }];
    const links = [];

    services.forEach((s) => {
      nodes.push({ id: s.id, group: 2, label: s.name, status: s.status });
      links.push({ id: `link-${s.id}`, source: 'GATEWAY', target: s.id, status: s.status });
    });

    const width = 300;
    const height = 250;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id((d) => d.id).distance(80))
      .force("charge", d3.forceManyBody().strength(-150))
      .force("center", d3.forceCenter(width / 2, height / 2));

    const link = svg.append("g")
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("id", d => d.id)
      .attr("stroke", d => d.status === 'OFFLINE' ? '#7f1d1d' : '#1a1a1a')
      .attr("stroke-width", 1);

    const node = svg.append("g")
      .selectAll("circle")
      .data(nodes)
      .join("circle")
      .attr("r", d => d.group === 1 ? 6 : 4)
      .attr("fill", d => d.group === 1 ? "#fff" : (d.status === 'OFFLINE' ? "#ef4444" : "#22c55e"))
      .attr("filter", "drop-shadow(0 0 5px rgba(255,255,255,0.2))");

    const labels = svg.append("g")
      .selectAll("text")
      .data(nodes)
      .join("text")
      .text(d => d.label)
      .attr("font-size", "8px")
      .attr("font-family", "monospace")
      .attr("fill", "#4b5563")
      .attr("dx", 10)
      .attr("dy", 4);

    // --- PULSE ANIMATION LOGIC ---
    services.forEach(s => {
      // Trigger pulse if status just became OPERATIONAL
      if (s.status === 'OPERATIONAL' && prevStatuses.current[s.id] !== 'OPERATIONAL') {
        const linkData = links.find(l => l.target.id === s.id);
        if (linkData) {
          const pulse = svg.append("circle")
            .attr("r", 2)
            .attr("fill", "#22c55e")
            .attr("filter", "blur(1px)");

          pulse.transition()
            .duration(1000)
            .attrTween("cx", () => t => linkData.source.x + (linkData.target.x - linkData.source.x) * t)
            .attrTween("cy", () => t => linkData.source.y + (linkData.target.y - linkData.source.y) * t)
            .remove();
        }
      }
      prevStatuses.current[s.id] = s.status;
    });

    simulation.on("tick", () => {
      link.attr("x1", d => d.source.x).attr("y1", d => d.source.y)
          .attr("x2", d => d.target.x).attr("y2", d => d.target.y);
      node.attr("cx", d => d.x).attr("cy", d => d.y);
      labels.attr("x", d => d.x).attr("y", d => d.y);
    });

  }, [services, currentUser]);

  return (
    <div className="p-4 bg-black border border-[#222] mt-8 overflow-hidden">
      <h2 className="text-[9px] font-bold text-gray-700 uppercase tracking-widest mb-4 border-b border-[#1a1a1a] pb-2">
        Neural_Network_Topology
      </h2>
      <svg ref={svgRef} width="100%" height="250" viewBox="0 0 300 250"></svg>
    </div>
  );
}