import React from 'react';
import type { HexCell, SpaceEnemyShip } from '../../types/game';

interface HexGridProps {
  grid: HexCell[][];
  playerQ: number;
  playerR: number;
  enemies: SpaceEnemyShip[];
  validMoves: { q: number; r: number }[];
  validAttacks: { q: number; r: number }[];
  selectedCell?: { q: number; r: number };
  onCellClick: (q: number, r: number) => void;
  playerShipColor?: string;
}

const HEX_SIZE = 32;
const HEX_H = HEX_SIZE * Math.sqrt(3);
const HEX_W = HEX_SIZE * 2;

// Pointy-top hexagon vertices
function hexPoints(cx: number, cy: number, size: number): string {
  const pts: string[] = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 6;
    pts.push(`${cx + size * Math.cos(angle)},${cy + size * Math.sin(angle)}`);
  }
  return pts.join(' ');
}

// Offset (odd-r) to pixel conversion for pointy-top hexes
function hexToPixel(q: number, r: number): { x: number; y: number } {
  const x = HEX_SIZE * (Math.sqrt(3) * q + (Math.sqrt(3) / 2) * r);
  const y = HEX_SIZE * (3 / 2) * r;
  return { x, y };
}

const ZONE_COLORS: Record<string, string> = {
  OpenSpace: '#0a0e1a',
  Nebula: '#1a0a2e',
  IonStorm: '#0a1a1a',
  Debris: '#1a0f0a',
};

const ZONE_BORDER_COLORS: Record<string, string> = {
  OpenSpace: '#1e2a4a',
  Nebula: '#7c3aed44',
  IonStorm: '#00d4ff44',
  Debris: '#f59e0b44',
};

const ZONE_LABELS: Record<string, string> = {
  Nebula: 'N',
  IonStorm: 'I',
  Debris: 'D',
  OpenSpace: '',
};

export function HexGrid({
  grid,
  playerQ,
  playerR,
  enemies,
  validMoves,
  validAttacks,
  selectedCell,
  onCellClick,
  playerShipColor = '#00d4ff',
}: HexGridProps) {
  // Calculate grid bounds
  const padding = 50;

  const allPixels = grid.flat().map(cell => hexToPixel(cell.q, cell.r));
  const minX = Math.min(...allPixels.map(p => p.x));
  const maxX = Math.max(...allPixels.map(p => p.x));
  const minY = Math.min(...allPixels.map(p => p.y));
  const maxY = Math.max(...allPixels.map(p => p.y));

  const offsetX = padding - minX + HEX_SIZE;
  const offsetY = padding - minY + HEX_SIZE;
  const svgWidth = maxX - minX + HEX_W + padding * 2;
  const svgHeight = maxY - minY + HEX_H + padding * 2;

  const validMoveSet = new Set(validMoves.map(m => `${m.q},${m.r}`));
  const validAttackSet = new Set(validAttacks.map(a => `${a.q},${a.r}`));

  return (
    <svg
      width={svgWidth}
      height={svgHeight}
      style={{ display: 'block', maxWidth: '100%' }}
    >
      {/* Legend */}
      <g transform="translate(8, 8)">
        {[
          { color: '#7c3aed44', border: '#7c3aed', label: 'Nebula (+15% EVA)' },
          { color: '#00d4ff22', border: '#00d4ff', label: 'Ion Storm (-20% MOV)' },
          { color: '#f59e0b22', border: '#f59e0b', label: 'Debris (-5% HP/turn)' },
        ].map((item, i) => (
          <g key={i} transform={`translate(0, ${i * 16})`}>
            <rect x={0} y={0} width={10} height={10} fill={item.color} stroke={item.border} rx={2} />
            <text x={14} y={9} fill="#64748b" fontSize={9} fontFamily="monospace">{item.label}</text>
          </g>
        ))}
      </g>

      {grid.flat().map(cell => {
        const { x, y } = hexToPixel(cell.q, cell.r);
        const cx = x + offsetX;
        const cy = y + offsetY;
        const pts = hexPoints(cx, cy, HEX_SIZE - 1);

        const isPlayer = cell.q === playerQ && cell.r === playerR;
        const isEnemy = enemies.some(e => e.hexQ === cell.q && e.hexR === cell.r);
        const isMove = validMoveSet.has(`${cell.q},${cell.r}`);
        const isAttack = validAttackSet.has(`${cell.q},${cell.r}`);
        const isSelected = selectedCell?.q === cell.q && selectedCell?.r === cell.r;

        let fillColor = ZONE_COLORS[cell.zone] ?? '#0a0e1a';
        let strokeColor = ZONE_BORDER_COLORS[cell.zone] ?? '#1e2a4a';
        let strokeWidth = 1;

        if (isMove) { fillColor = 'rgba(0,212,255,0.15)'; strokeColor = '#00d4ff'; strokeWidth = 1.5; }
        if (isAttack) { fillColor = 'rgba(239,68,68,0.2)'; strokeColor = '#ef4444'; strokeWidth = 2; }
        if (isSelected) { strokeColor = '#ffffff'; strokeWidth = 2; }

        const enemy = enemies.find(e => e.hexQ === cell.q && e.hexR === cell.r);
        const zoneLabel = ZONE_LABELS[cell.zone] ?? '';

        return (
          <g key={`${cell.q},${cell.r}`} onClick={() => onCellClick(cell.q, cell.r)} style={{ cursor: isMove || isAttack ? 'pointer' : 'default' }}>
            <polygon
              points={pts}
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
            />
            {/* Zone indicator */}
            {zoneLabel && !isPlayer && !isEnemy && (
              <text x={cx} y={cy + 4} textAnchor="middle" fill={strokeColor} fontSize={10} fontFamily="monospace" fontWeight="bold" pointerEvents="none">
                {zoneLabel}
              </text>
            )}
            {/* Player ship */}
            {isPlayer && (
              <>
                <polygon
                  points={`${cx},${cy - 16} ${cx - 10},${cy + 8} ${cx + 10},${cy + 8}`}
                  fill={playerShipColor}
                  opacity={0.9}
                  pointerEvents="none"
                />
                <text x={cx} y={cy + 22} textAnchor="middle" fill={playerShipColor} fontSize={8} fontFamily="monospace" pointerEvents="none">YOU</text>
              </>
            )}
            {/* Enemy ships */}
            {enemy && !isPlayer && (
              <>
                <polygon
                  points={`${cx},${cy + 14} ${cx - 10},${cy - 8} ${cx + 10},${cy - 8}`}
                  fill={enemy.color}
                  opacity={0.9}
                  pointerEvents="none"
                />
                {/* HP bar */}
                <rect x={cx - 14} y={cy + 18} width={28} height={3} fill="#1e2a4a" rx={1} />
                <rect x={cx - 14} y={cy + 18} width={Math.round(28 * (enemy.hp / enemy.maxHp))} height={3} fill="#10b981" rx={1} />
                <text x={cx} y={cy + 30} textAnchor="middle" fill={enemy.color} fontSize={7} fontFamily="monospace" pointerEvents="none">
                  {enemy.name.split(' ')[0]}
                </text>
              </>
            )}
            {/* Coordinate (small) */}
            <text x={cx - HEX_SIZE + 5} y={cy - HEX_SIZE + 14} fill="#1e3a5a" fontSize={7} fontFamily="monospace" pointerEvents="none">
              {cell.q},{cell.r}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
