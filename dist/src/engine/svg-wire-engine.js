/**
 * RAQEEM Physics Platform - Native SVG Wire Engine (SVGWireEngine)
 * High-performance, zero-dependency, 60 FPS vector circuit wiring engine.
 * Supports:
 * - Touch & Mouse drag-and-drop terminal connection with SVG matrix transforms
 * - Orthogonal (90° schematic) and Bezier (natural sag) wire routing
 * - Live ghost wire during drag with terminal glow targeting
 * - Inline wire deletion buttons & hover effects
 * - Real-time electron drift / current pulse animations
 * - Programmatic auto-wiring and circuit completion validation
 */

class SVGWireEngine {
    constructor(config = {}) {
        this.container = typeof config.container === 'string' 
            ? document.getElementById(config.container) 
            : (config.container || document.querySelector('.workspace-area') || document.body);
            
        this.onCircuitComplete = config.onCircuitComplete || (() => {});
        this.onWireAdded = config.onWireAdded || (() => {});
        this.onWireRemoved = config.onWireRemoved || (() => {});
        
        this.routingMode = config.routingMode || 'orthogonal'; // 'orthogonal' | 'bezier'
        this.defaultWireColor = config.wireColor || '#38bdf8';
        this.activeWireColor = config.activeWireColor || '#00d2ff';
        this.expectedPairs = config.expectedPairs || [];
        
        this.wires = []; // Array of wire objects
        this.isDragging = false;
        this.startTerminal = null;
        
        this.initSVGCanvas();
        this.bindGlobalEvents();
        this.setupTerminals();
    }

    initSVGCanvas() {
        if (!this.container) return;
        
        // Check if SVG layer already exists or create one
        let svg = this.container.querySelector('.raqeem-svg-wires');
        if (!svg) {
            svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.setAttribute('class', 'wires-layer raqeem-svg-wires');
            svg.style.position = 'absolute';
            svg.style.top = '0';
            svg.style.left = '0';
            svg.style.width = '100%';
            svg.style.height = '100%';
            svg.style.pointerEvents = 'none';
            svg.style.zIndex = '25';
            this.container.appendChild(svg);
        }
        this.svg = svg;

        // Ensure defs and ghost wire path exist
        let defs = this.svg.querySelector('defs');
        if (!defs) {
            defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
            defs.innerHTML = `
                <filter id="wire-glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
            `;
            this.svg.appendChild(defs);
        }

        let ghost = this.svg.querySelector('#ghost-wire');
        if (!ghost) {
            ghost = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            ghost.setAttribute('id', 'ghost-wire');
            ghost.setAttribute('class', 'ghost-wire');
            ghost.setAttribute('fill', 'none');
            ghost.setAttribute('stroke', '#38bdf8');
            ghost.setAttribute('stroke-width', '4');
            ghost.setAttribute('stroke-dasharray', '6 6');
            ghost.setAttribute('visibility', 'hidden');
            ghost.style.pointerEvents = 'none';
            this.svg.appendChild(ghost);
        }
        this.ghostWire = ghost;

        // Container group for placed wires
        let wireGroup = this.svg.querySelector('#permanent-wires');
        if (!wireGroup) {
            wireGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            wireGroup.setAttribute('id', 'permanent-wires');
            this.svg.appendChild(wireGroup);
        }
        this.wireGroup = wireGroup;
    }

    getSVGCoordinates(clientX, clientY) {
        if (!this.svg) return { x: 0, y: 0 };
        const pt = this.svg.createSVGPoint();
        pt.x = clientX;
        pt.y = clientY;
        const ctm = this.svg.getScreenCTM();
        if (ctm) {
            const transformed = pt.matrixTransform(ctm.inverse());
            return { x: transformed.x, y: transformed.y };
        }
        const rect = this.container.getBoundingClientRect();
        return { x: clientX - rect.left, y: clientY - rect.top };
    }

    getTerminalCenter(terminalEl) {
        const termRect = terminalEl.getBoundingClientRect();
        const clientX = termRect.left + termRect.width / 2;
        const clientY = termRect.top + termRect.height / 2;
        return this.getSVGCoordinates(clientX, clientY);
    }

    setupTerminals() {
        if (!this.container) return;
        const terminals = this.container.querySelectorAll('.terminal-node, .elite-terminal');
        terminals.forEach(term => {
            term.style.pointerEvents = 'auto';
            term.style.cursor = 'crosshair';
            
            // Remove previous listeners to prevent duplicates
            term.onpointerdown = (e) => this.handleTerminalPointerDown(e, term);
        });
    }

    isPairExpected(id1, id2) {
        if (!this.expectedPairs || !this.expectedPairs.length) {
            return id1 !== id2;
        }

        return this.expectedPairs.some(p => {
            if (Array.isArray(p)) {
                const [src, tgt] = p;
                return (id1 === src && id2 === tgt) || (id1 === tgt && id2 === src);
            }
            if (typeof p === 'object' && p !== null) {
                const src = p.source || p.from || p[0];
                const tgt = p.target || p.to || p[1];
                return (id1 === src && id2 === tgt) || (id1 === tgt && id2 === src);
            }
            if (typeof p === 'string') {
                const forward = `${id1}-${id2}`;
                const backward = `${id2}-${id1}`;
                const forwardDash = `${id1}--${id2}`;
                const backwardDash = `${id2}--${id1}`;
                const forwardUnderscore = `${id1}_${id2}`;
                const backwardUnderscore = `${id2}_${id1}`;
                return p === forward || p === backward || 
                       p === forwardDash || p === backwardDash ||
                       p === forwardUnderscore || p === backwardUnderscore;
            }
            return false;
        });
    }

    handleTerminalPointerDown(e, terminal) {
        // Prevent wiring from unplaced components in inventory/toolbox
        const startComp = terminal.closest('.component, .elite-component, .capacitor-wrapper, .tool-item');
        if (startComp && (startComp.closest('.inventory, #inventory, #toolbox, .tray, #inventory-grid') || (startComp.classList.contains('in-tray')))) {
            return;
        }

        // Check if start terminal has reached max connections
        const startMaxConns = parseInt(terminal.getAttribute('data-max-connections')) || 1;
        const startCurrentConns = this.wires.filter(w => w.sourceId === terminal.id || w.targetId === terminal.id).length;
        if (startCurrentConns >= startMaxConns) {
            return;
        }

        e.stopPropagation();
        e.preventDefault();
        
        this.isDragging = true;
        this.startTerminal = terminal;
        
        const pos = this.getTerminalCenter(terminal);
        this.startPos = pos;
        
        this.ghostWire.setAttribute('d', `M ${pos.x} ${pos.y} L ${pos.x} ${pos.y}`);
        this.ghostWire.setAttribute('visibility', 'visible');
        
        // Highlight ONLY compatible, valid target terminals on placed components
        const allTerminals = this.container.querySelectorAll('.terminal-node, .elite-terminal');
        allTerminals.forEach(t => {
            if (t === terminal) return;
            
            // Check terminal is visible in DOM
            if (t.offsetParent === null && window.getComputedStyle(t).display === 'none') return;
            
            // Check target component is not in inventory
            const targetComp = t.closest('.component, .elite-component, .capacitor-wrapper, .tool-item');
            if (targetComp && targetComp.closest('.inventory, #inventory, #toolbox, .tray, #inventory-grid')) return;

            const isExpected = this.isPairExpected(terminal.id, t.id);
            const pairKey = [terminal.id, t.id].sort().join('--');
            const alreadyConnected = this.wires.some(w => w.pairKey === pairKey);
            
            const maxConns = parseInt(t.getAttribute('data-max-connections')) || 1;
            const currentConns = this.wires.filter(w => w.sourceId === t.id || w.targetId === t.id).length;
            
            if (isExpected && !alreadyConnected && currentConns < maxConns) {
                t.classList.add('target-glow');
            }
        });
    }

    bindGlobalEvents() {
        const onPointerMove = (e) => {
            if (!this.isDragging || !this.startTerminal) return;
            const currentPos = this.getSVGCoordinates(e.clientX, e.clientY);
            const pathD = this.generatePathString(this.startPos.x, this.startPos.y, currentPos.x, currentPos.y, this.routingMode, this.startTerminal, null);
            this.ghostWire.setAttribute('d', pathD);
        };

        const onPointerUp = (e) => {
            if (!this.isDragging) return;
            this.isDragging = false;
            
            this.ghostWire.setAttribute('visibility', 'hidden');
            this.ghostWire.setAttribute('d', '');
            
            // Clear target glow
            const allTerminals = this.container.querySelectorAll('.terminal-node, .elite-terminal');
            allTerminals.forEach(t => t.classList.remove('target-glow'));
            
            const clientX = e.clientX || (e.changedTouches && e.changedTouches[0] && e.changedTouches[0].clientX) || 0;
            const clientY = e.clientY || (e.changedTouches && e.changedTouches[0] && e.changedTouches[0].clientY) || 0;

            // 1. Check exact element under pointer
            let targetTerminal = null;
            const targetEl = document.elementFromPoint(clientX, clientY);
            if (targetEl) {
                targetTerminal = targetEl.closest('.terminal-node, .elite-terminal');
            }
            
            // 2. Proximity snap within 40px radius
            if (!targetTerminal || targetTerminal === this.startTerminal) {
                let minDist = 40;
                allTerminals.forEach(t => {
                    if (t === this.startTerminal || t.offsetParent === null) return;
                    const rect = t.getBoundingClientRect();
                    const cx = rect.left + rect.width / 2;
                    const cy = rect.top + rect.height / 2;
                    const dist = Math.hypot(clientX - cx, clientY - cy);
                    if (dist < minDist) {
                        minDist = dist;
                        targetTerminal = t;
                    }
                });
            }
            
            if (targetTerminal && targetTerminal !== this.startTerminal && this.container.contains(targetTerminal)) {
                this.connect(this.startTerminal, targetTerminal);
            }
            
            this.startTerminal = null;
        };

        window.addEventListener('pointermove', onPointerMove);
        window.addEventListener('pointerup', onPointerUp);
        window.addEventListener('resize', () => this.repositionWires());
    }

    getTerminalDirection(term) {
        if (!term) return null;
        if (term.getAttribute && term.getAttribute('data-direction')) {
            return term.getAttribute('data-direction');
        }
        const id = ((typeof term === 'string' ? term : term.id) || '').toLowerCase();
        if (id.includes('p1') || id.includes('p2') || id.includes('ring-p')) return 'left';
        if (id.includes('s1') || id.includes('s2') || id.includes('ring-s')) return 'right';
        if (id.startsWith('bat-') || id.includes('top') || id.includes('pos') || id.includes('neg')) return 'top';
        if (id.includes('bottom') || id.includes('bot')) return 'bottom';
        if (id.includes('left') || id.endsWith('-1')) return 'left';
        if (id.includes('right') || id.endsWith('-k') || id.endsWith('-2')) return 'right';
        return null;
    }

    getObstacles(sourceTerm = null, targetTerm = null) {
        if (!this.container) return [];
        const sourceComp = sourceTerm ? sourceTerm.closest('.component, .elite-component, .capacitor-wrapper, .tool-item') : null;
        const targetComp = targetTerm ? targetTerm.closest('.component, .elite-component, .capacitor-wrapper, .tool-item') : null;

        const allComps = this.container.querySelectorAll('.component.placed, .elite-component.placed, .capacitor-wrapper.placed, .placed');
        const obstacles = [];
        const padding = 12; // Safety margin around component body

        allComps.forEach(comp => {
            if (comp === sourceComp || comp === targetComp) return;
            if (comp.offsetParent === null && window.getComputedStyle(comp).display === 'none') return;
            if (comp.closest('.inventory, #inventory, #toolbox, .tray, #inventory-grid') || comp.classList.contains('in-tray')) return;

            const rect = comp.getBoundingClientRect();
            const pTL = this.getSVGCoordinates(rect.left, rect.top);
            const pBR = this.getSVGCoordinates(rect.right, rect.bottom);

            const left = Math.min(pTL.x, pBR.x) - padding;
            const right = Math.max(pTL.x, pBR.x) + padding;
            const top = Math.min(pTL.y, pBR.y) - padding;
            const bottom = Math.max(pTL.y, pBR.y) + padding;

            obstacles.push({ left, right, top, bottom });
        });

        return obstacles;
    }

    isSegmentColliding(p1, p2, obstacle) {
        const minX = Math.min(p1.x, p2.x);
        const maxX = Math.max(p1.x, p2.x);
        const minY = Math.min(p1.y, p2.y);
        const maxY = Math.max(p1.y, p2.y);

        // Horizontal segment
        if (Math.abs(p1.y - p2.y) < 1) {
            const y = p1.y;
            if (y >= obstacle.top && y <= obstacle.bottom) {
                if (maxX >= obstacle.left && minX <= obstacle.right) {
                    return true;
                }
            }
            return false;
        }

        // Vertical segment
        if (Math.abs(p1.x - p2.x) < 1) {
            const x = p1.x;
            if (x >= obstacle.left && x <= obstacle.right) {
                if (maxY >= obstacle.top && minY <= obstacle.bottom) {
                    return true;
                }
            }
            return false;
        }

        // General bounding box intersection
        return (minX <= obstacle.right && maxX >= obstacle.left && minY <= obstacle.bottom && maxY >= obstacle.top);
    }

    isPathColliding(points, obstacles) {
        if (!obstacles || !obstacles.length) return false;
        for (let i = 0; i < points.length - 1; i++) {
            const p1 = points[i];
            const p2 = points[i + 1];
            for (const obs of obstacles) {
                if (this.isSegmentColliding(p1, p2, obs)) {
                    return true;
                }
            }
        }
        return false;
    }

    pointsToPathD(points) {
        if (!points || !points.length) return '';
        const clean = [];
        for (let i = 0; i < points.length; i++) {
            const p = points[i];
            if (clean.length > 0) {
                const prev = clean[clean.length - 1];
                if (Math.abs(prev.x - p.x) < 1 && Math.abs(prev.y - p.y) < 1) continue;
            }
            clean.push(p);
        }
        if (clean.length === 0) return '';
        let d = `M ${clean[0].x} ${clean[0].y}`;
        for (let i = 1; i < clean.length; i++) {
            d += ` L ${clean[i].x} ${clean[i].y}`;
        }
        return d;
    }

    getTerminalStub(x, y, dir, dist = 18) {
        if (dir === 'top') return { x, y: y - dist };
        if (dir === 'bottom') return { x, y: y + dist };
        if (dir === 'left') return { x: x - dist, y };
        if (dir === 'right') return { x: x + dist, y };
        return { x, y };
    }

    generatePathString(x1, y1, x2, y2, mode = this.routingMode, sourceTerm = null, targetTerm = null) {
        if (mode === 'bezier') {
            const dx = x2 - x1;
            const dy = y2 - y1;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const sag = Math.min(dist * 0.25, 60);
            const midX = (x1 + x2) / 2;
            const midY = (y1 + y2) / 2 + sag;
            return `M ${x1} ${y1} Q ${midX} ${midY} ${x2} ${y2}`;
        }
        
        const obstacles = this.getObstacles(sourceTerm, targetTerm);
        const dir1 = this.getTerminalDirection(sourceTerm);
        const dir2 = this.getTerminalDirection(targetTerm);

        const dx = x2 - x1;
        const dy = y2 - y1;
        const absDx = Math.abs(dx);
        const absDy = Math.abs(dy);

        // 1. Natural straight line between complementary vertical or horizontal terminals
        if (absDx < 6 && ((dir1 === 'bottom' && dir2 === 'top') || (dir1 === 'top' && dir2 === 'bottom') || (!dir1 && !dir2))) {
            const straightPath = [{ x: x1, y: y1 }, { x: x2, y: y2 }];
            if (!this.isPathColliding(straightPath, obstacles)) {
                return `M ${x1} ${y1} L ${x2} ${y2}`;
            }
        }
        if (absDy < 6 && ((dir1 === 'right' && dir2 === 'left') || (dir1 === 'left' && dir2 === 'right') || (!dir1 && !dir2))) {
            const straightPath = [{ x: x1, y: y1 }, { x: x2, y: y2 }];
            if (!this.isPathColliding(straightPath, obstacles)) {
                return `M ${x1} ${y1} L ${x2} ${y2}`;
            }
        }

        // 2. Compute Port Stubs
        const stub1 = this.getTerminalStub(x1, y1, dir1, 18);
        const stub2 = this.getTerminalStub(x2, y2, dir2, 18);

        const p1 = { x: x1, y: y1 };
        const p2 = { x: x2, y: y2 };

        const candidates = [];

        // Candidate A: Horizontal Exit -> Vertical Entry (e.g. Switch 'left' to Battery 'top', or Ring 'right' to Galv 'bottom')
        if ((dir1 === 'left' || dir1 === 'right') && (dir2 === 'top' || dir2 === 'bottom')) {
            if (dir2 === 'bottom') {
                const underY = Math.max(y1, y2) + 20;
                candidates.push([p1, stub1, { x: stub1.x, y: underY }, { x: x2, y: underY }, p2]);
                candidates.push([p1, { x: x1, y: underY }, { x: x2, y: underY }, p2]);
            } else {
                candidates.push([p1, { x: x1, y: y2 }, p2]);
                candidates.push([p1, stub1, { x: stub1.x, y: stub2.y }, stub2, p2]);
                candidates.push([p1, stub1, { x: stub1.x, y: y2 }, p2]);
            }
        }

        // Candidate B: Vertical Exit -> Horizontal Entry (e.g. Battery 'top' to Ring 'p1', or Galv 'bottom' to Ring 's1')
        if ((dir1 === 'top' || dir1 === 'bottom') && (dir2 === 'left' || dir2 === 'right')) {
            if (dir1 === 'bottom') {
                const underY = Math.max(y1, y2) + 20;
                candidates.push([p1, stub1, { x: x1, y: underY }, { x: stub2.x, y: underY }, stub2, p2]);
                candidates.push([p1, { x: x1, y: underY }, { x: x2, y: underY }, p2]);
            } else {
                candidates.push([p1, { x: x1, y: y2 }, p2]);
                candidates.push([p1, stub1, { x: stub1.x, y: y2 }, p2]);
                candidates.push([p1, stub1, { x: stub2.x, y: stub1.y }, stub2, p2]);
            }
        }

        // Candidate C: Both Top Exit (e.g. Battery 'top' to C1 'top')
        if (dir1 === 'top' && dir2 === 'top') {
            const topY = Math.min(stub1.y, stub2.y, y1, y2);
            candidates.push([p1, { x: x1, y: topY }, { x: x2, y: topY }, p2]);
            candidates.push([p1, stub1, { x: stub1.x, y: topY }, { x: stub2.x, y: topY }, stub2, p2]);
        }

        // Candidate D: Both Bottom Exit
        if (dir1 === 'bottom' && dir2 === 'bottom') {
            const botY = Math.max(stub1.y, stub2.y, y1, y2);
            candidates.push([p1, { x: x1, y: botY }, { x: x2, y: botY }, p2]);
            candidates.push([p1, stub1, { x: stub1.x, y: botY }, { x: stub2.x, y: botY }, stub2, p2]);
        }

        // Candidate D2: Both Left Exit
        if (dir1 === 'left' && dir2 === 'left') {
            const minX = Math.min(stub1.x, stub2.x, x1, x2) - 25;
            candidates.push([p1, stub1, { x: minX, y: stub1.y }, { x: minX, y: stub2.y }, stub2, p2]);
            candidates.push([p1, { x: minX, y: y1 }, { x: minX, y: y2 }, p2]);
        }

        // Candidate D3: Both Right Exit
        if (dir1 === 'right' && dir2 === 'right') {
            const maxX = Math.max(stub1.x, stub2.x, x1, x2) + 25;
            candidates.push([p1, stub1, { x: maxX, y: stub1.y }, { x: maxX, y: stub2.y }, stub2, p2]);
            candidates.push([p1, { x: maxX, y: y1 }, { x: maxX, y: y2 }, p2]);
        }

        // Candidate D4: Opposite Facing Horizontal (Left <-> Right)
        if ((dir1 === 'left' && dir2 === 'right') || (dir1 === 'right' && dir2 === 'left')) {
            const hMidX = (stub1.x + stub2.x) / 2;
            candidates.push([p1, stub1, { x: hMidX, y: stub1.y }, { x: hMidX, y: stub2.y }, stub2, p2]);
            candidates.push([p1, stub1, { x: stub1.x, y: (y1 + y2) / 2 }, { x: stub2.x, y: (y1 + y2) / 2 }, stub2, p2]);
        }

        // Candidate E: Directional Exit Straight to Target Axis
        if (dir1 === 'top' && y2 <= y1) {
            candidates.push([p1, { x: x1, y: y2 }, p2]);
        }
        if (dir2 === 'top' && y1 <= y2) {
            candidates.push([p1, { x: x2, y: y1 }, p2]);
        }
        if (dir1 === 'bottom' && y2 >= y1) {
            candidates.push([p1, { x: x1, y: y2 }, p2]);
        }
        if (dir2 === 'bottom' && y1 >= y2) {
            candidates.push([p1, { x: x2, y: y1 }, p2]);
        }

        // Candidate F: Midpoint Stub corridors
        const midX = (stub1.x + stub2.x) / 2;
        const midY = (stub1.y + stub2.y) / 2;
        candidates.push([p1, stub1, { x: midX, y: stub1.y }, { x: midX, y: stub2.y }, stub2, p2]);
        candidates.push([p1, stub1, { x: stub1.x, y: midY }, { x: stub2.x, y: midY }, stub2, p2]);

        // Standard orthogonal fallback candidates
        const rawMidX = x1 + dx / 2;
        const rawMidY = y1 + dy / 2;
        candidates.push([p1, { x: rawMidX, y: y1 }, { x: rawMidX, y: y2 }, p2]);
        candidates.push([p1, { x: x1, y: rawMidY }, { x: x2, y: rawMidY }, p2]);
        candidates.push([p1, { x: x1, y: y2 }, p2]);
        candidates.push([p1, { x: x2, y: y1 }, p2]);

        // Candidate G: Obstacle Clearance Corridors
        if (obstacles.length > 0) {
            obstacles.forEach(obs => {
                const bypassTopY = Math.min(y1, y2, obs.top) - 15;
                candidates.push([p1, stub1, { x: stub1.x, y: bypassTopY }, { x: stub2.x, y: bypassTopY }, stub2, p2]);
                const bypassBottomY = Math.max(y1, y2, obs.bottom) + 15;
                candidates.push([p1, stub1, { x: stub1.x, y: bypassBottomY }, { x: stub2.x, y: bypassBottomY }, stub2, p2]);
                const bypassLeftX = Math.min(x1, x2, obs.left) - 15;
                candidates.push([p1, stub1, { x: bypassLeftX, y: stub1.y }, { x: bypassLeftX, y: stub2.y }, stub2, p2]);
                const bypassRightX = Math.max(x1, x2, obs.right) + 15;
                candidates.push([p1, stub1, { x: bypassRightX, y: stub1.y }, { x: bypassRightX, y: stub2.y }, stub2, p2]);
            });
        }

        // Find first collision-free candidate
        for (const candidate of candidates) {
            if (!this.isPathColliding(candidate, obstacles)) {
                return this.pointsToPathD(candidate);
            }
        }

        return this.pointsToPathD(candidates[0]);
    }

    connect(sourceTerm, targetTerm, options = {}) {
        if (!sourceTerm || !targetTerm) return null;
        
        const sourceId = sourceTerm.id;
        const targetId = targetTerm.id;
        
        // Prevent connecting non-allowed pairs if expectedPairs is configured
        if (!options.force && this.expectedPairs && this.expectedPairs.length > 0) {
            if (!this.isPairExpected(sourceId, targetId)) {
                return null;
            }
        }

        // Prevent duplicate connection between the exact same pair
        const pairKey = [sourceId, targetId].sort().join('--');
        const existing = this.wires.find(w => w.pairKey === pairKey);
        if (existing) return existing;
        
        const color = options.color || this.defaultWireColor;
        const p1 = this.getTerminalCenter(sourceTerm);
        const p2 = this.getTerminalCenter(targetTerm);
        const pathD = this.generatePathString(p1.x, p1.y, p2.x, p2.y, options.routingMode || this.routingMode, sourceTerm, targetTerm);
        
        // Create SVG Group for the wire
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('class', 'wire-group');
        g.style.pointerEvents = 'auto';
        
        // Invisible wide hit area for easy hover and click
        const hitPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        hitPath.setAttribute('d', pathD);
        hitPath.setAttribute('fill', 'none');
        hitPath.setAttribute('stroke', 'transparent');
        hitPath.setAttribute('stroke-width', '20');
        hitPath.style.cursor = 'pointer';
        
        // Visible wire path
        const visiblePath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        visiblePath.setAttribute('d', pathD);
        visiblePath.setAttribute('fill', 'none');
        visiblePath.setAttribute('stroke', color);
        visiblePath.setAttribute('stroke-width', '4');
        visiblePath.setAttribute('stroke-linecap', 'round');
        visiblePath.setAttribute('stroke-linejoin', 'round');
        visiblePath.setAttribute('class', 'user-wire');
        visiblePath.style.transition = 'stroke 0.2s, filter 0.2s';
        
        // Midpoint delete badge
        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2;
        const delBtn = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        delBtn.setAttribute('class', 'wire-delete-badge');
        delBtn.setAttribute('transform', `translate(${midX}, ${midY})`);
        delBtn.style.cursor = 'pointer';
        delBtn.style.opacity = '0';
        delBtn.style.transition = 'opacity 0.2s, transform 0.2s';
        delBtn.innerHTML = `
            <circle r="10" fill="#ef4444" stroke="#ffffff" stroke-width="1.5" />
            <line x1="-4" y1="-4" x2="4" y2="4" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" />
            <line x1="4" y1="-4" x2="-4" y2="4" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" />
        `;
        
        g.appendChild(hitPath);
        g.appendChild(visiblePath);
        g.appendChild(delBtn);
        this.wireGroup.appendChild(g);
        
        const wireObj = {
            id: `wire-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
            pairKey,
            sourceId,
            targetId,
            sourceTerm,
            targetTerm,
            group: g,
            visiblePath,
            hitPath,
            delBtn,
            color,
            routingMode: options.routingMode || this.routingMode
        };
        
        // Hover interactions
        g.onpointerenter = () => {
            visiblePath.setAttribute('stroke', '#ef4444');
            visiblePath.setAttribute('filter', 'url(#wire-glow)');
            delBtn.style.opacity = '1';
        };
        g.onpointerleave = () => {
            visiblePath.setAttribute('stroke', wireObj.isActive ? this.activeWireColor : color);
            if (!wireObj.isActive) visiblePath.removeAttribute('filter');
            delBtn.style.opacity = '0';
        };
        
        // Click to delete
        hitPath.onclick = (e) => {
            e.stopPropagation();
            this.removeWire(wireObj.id);
        };
        delBtn.onclick = (e) => {
            e.stopPropagation();
            this.removeWire(wireObj.id);
        };
        
        this.wires.push(wireObj);
        
        // Mark terminal nodes as connected
        sourceTerm.classList.add('connected');
        targetTerm.classList.add('connected');
        
        this.onWireAdded(wireObj);
        this.checkCircuitStatus();
        
        return wireObj;
    }

    removeWire(wireId) {
        const index = this.wires.findIndex(w => w.id === wireId);
        if (index === -1) return;
        
        const wire = this.wires[index];
        if (wire.group && wire.group.parentNode) {
            wire.group.parentNode.removeChild(wire.group);
        }
        
        this.wires.splice(index, 1);
        
        // Update connected class on terminals
        const hasSourceConn = this.wires.some(w => w.sourceId === wire.sourceId || w.targetId === wire.sourceId);
        if (!hasSourceConn && wire.sourceTerm) wire.sourceTerm.classList.remove('connected');
        
        const hasTargetConn = this.wires.some(w => w.sourceId === wire.targetId || w.targetId === wire.targetId);
        if (!hasTargetConn && wire.targetTerm) wire.targetTerm.classList.remove('connected');
        
        this.onWireRemoved(wire);
        this.checkCircuitStatus();
    }

    clearWires() {
        this.wires.forEach(w => {
            if (w.group && w.group.parentNode) {
                w.group.parentNode.removeChild(w.group);
            }
            if (w.sourceTerm) w.sourceTerm.classList.remove('connected');
            if (w.targetTerm) w.targetTerm.classList.remove('connected');
        });
        this.wires = [];
        this.checkCircuitStatus();
    }

    repositionWires() {
        this.wires.forEach(wire => {
            const p1 = this.getTerminalCenter(wire.sourceTerm);
            const p2 = this.getTerminalCenter(wire.targetTerm);
            const pathD = this.generatePathString(p1.x, p1.y, p2.x, p2.y, wire.routingMode, wire.sourceTerm, wire.targetTerm);
            
            wire.visiblePath.setAttribute('d', pathD);
            wire.hitPath.setAttribute('d', pathD);
            
            const midX = (p1.x + p2.x) / 2;
            const midY = (p1.y + p2.y) / 2;
            wire.delBtn.setAttribute('transform', `translate(${midX}, ${midY})`);
        });
    }

    autoWire(requiredPairs = this.expectedPairs) {
        if (!requiredPairs || !requiredPairs.length) return;
        
        requiredPairs.forEach(pair => {
            const [srcId, tgtId, color] = Array.isArray(pair) ? pair : [pair.source, pair.target, pair.color];
            const srcEl = document.getElementById(srcId);
            const tgtEl = document.getElementById(tgtId);
            if (srcEl && tgtEl) {
                this.connect(srcEl, tgtEl, { color });
            }
        });
    }

    setCircuitActive(isActive = true, activeColor = this.activeWireColor) {
        this.wires.forEach(w => {
            w.isActive = isActive;
            if (isActive) {
                w.visiblePath.setAttribute('stroke', activeColor);
                w.visiblePath.setAttribute('filter', 'url(#wire-glow)');
                w.visiblePath.classList.add('wire-flowing');
            } else {
                w.visiblePath.setAttribute('stroke', w.color);
                w.visiblePath.removeAttribute('filter');
                w.visiblePath.classList.remove('wire-flowing');
            }
        });
    }

    checkCircuitStatus() {
        const connectedKeys = this.wires.map(w => w.pairKey);
        this.onCircuitComplete(connectedKeys, this.wires);
    }
}

window.SVGWireEngine = SVGWireEngine;
