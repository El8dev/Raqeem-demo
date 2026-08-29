/**
 * RAQEEM Physics Platform - EliteEngine (Powered by SVGWireEngine)
 * High-performance simulation orchestration engine.
 */

class EliteEngine {
    constructor(config = {}) {
        this.workspaceId = config.workspaceId || 'workspace';
        this.workspaceEl = typeof this.workspaceId === 'string' 
            ? document.getElementById(this.workspaceId) 
            : this.workspaceId;
            
        this.onCircuitComplete = config.onCircuitComplete || (() => {});
        this.onComponentPlaced = config.onComponentPlaced || (() => {});
        
        this.components = [];
        this.placedCount = 0;
        this.totalComponents = 0;
        this.userConnections = new Set();
        this.isCircuitComplete = false;
        
        this._expectedPairs = config.expectedPairs || config.requiredPairs || null;
        this.routingMode = config.routingMode || 'orthogonal';

        // Initialize Native SVG Wire Engine
        this.wireEngine = new SVGWireEngine({
            container: this.workspaceEl,
            routingMode: this.routingMode,
            expectedPairs: this._expectedPairs,
            onCircuitComplete: (keys, wires) => {
                this.userConnections = new Set(keys);
                this.onCircuitComplete(this.userConnections, wires);
            },
            onWireAdded: (wire) => {
                // Legality is validated directly inside SVGWireEngine.connect
                if (typeof config.onWireAdded === 'function') {
                    config.onWireAdded(wire);
                }
            }
        });

        // Backward-compatibility shim for legacy scripts referencing engine.jsPlumbInstance
        const engine = this;
        this.jsPlumbInstance = {
            deleteEveryConnection: () => engine.clearWires(),
            deleteConnection: (conn) => conn && engine.wireEngine.removeWire(conn.id),
            revalidate: () => engine.wireEngine.repositionWires(),
            repaintEverything: () => engine.wireEngine.repositionWires(),
            setZoom: () => {},
            reset: () => engine.clearWires(),
            connect: (opts) => {
                const srcEl = typeof opts.source === 'string' ? document.getElementById(opts.source) : opts.source;
                const tgtEl = typeof opts.target === 'string' ? document.getElementById(opts.target) : opts.target;
                return engine.wireEngine.connect(srcEl, tgtEl);
            },
            getAllConnections: () => engine.wireEngine.wires,
            getConnections: (filter = {}) => {
                if (!filter.source && !filter.target) return engine.wireEngine.wires;
                return engine.wireEngine.wires.filter(w => {
                    if (filter.source && filter.target) {
                        return (w.sourceId === filter.source && w.targetId === filter.target) ||
                               (w.sourceId === filter.target && w.targetId === filter.source);
                    }
                    if (filter.source) return w.sourceId === filter.source || w.targetId === filter.source;
                    if (filter.target) return w.sourceId === filter.target || w.targetId === filter.target;
                    return true;
                });
            }
        };

        this.initDragAndDrop();
        this.initResponsiveScaler();
        this.initLandscapeOrientationHint();
    }

    initResponsiveScaler() {
        if (!this.workspaceEl) return;
        
        let wrapper = this.workspaceEl.closest('.workspace-scaler-wrapper');
        if (!wrapper) {
            wrapper = document.createElement('div');
            wrapper.className = 'workspace-scaler-wrapper';
            this.workspaceEl.parentNode.insertBefore(wrapper, this.workspaceEl);
            wrapper.appendChild(this.workspaceEl);
        }

        const baseWidth = parseFloat(this.workspaceEl.dataset.baseWidth) || 900;
        const baseHeight = parseFloat(this.workspaceEl.dataset.baseHeight) || (this.workspaceEl.offsetHeight || 500);

        const updateScale = () => {
            const containerWidth = wrapper.clientWidth || (wrapper.parentElement ? wrapper.parentElement.clientWidth - 32 : window.innerWidth - 32);
            if (!containerWidth) return;
            const scale = Math.min(1.0, containerWidth / baseWidth);
            
            // Pure physical absolute positioning (ignoring RTL logic entirely)
            const emptySpace = containerWidth - (baseWidth * scale);
            const physicalLeft = emptySpace / 2;
            
            this.workspaceEl.style.position = 'absolute';
            this.workspaceEl.style.right = 'auto'; // Disable RTL right-anchoring
            this.workspaceEl.style.left = `${physicalLeft}px`;
            this.workspaceEl.style.top = '0px';
            this.workspaceEl.style.transformOrigin = 'top left';
            this.workspaceEl.style.transform = `scale(${scale})`;
            
            wrapper.style.height = `${baseHeight * scale}px`;
            
            if (this.wireEngine) {
                this.wireEngine.repositionWires();
            }
        };

        // Run immediately and across all lifecycle events
        updateScale();
        requestAnimationFrame(updateScale);
        window.addEventListener('resize', updateScale, { passive: true });
        window.addEventListener('orientationchange', () => {
            setTimeout(updateScale, 50);
            setTimeout(updateScale, 200);
        }, { passive: true });
        window.addEventListener('load', updateScale, { passive: true });
        if (typeof ResizeObserver !== 'undefined') {
            const ro = new ResizeObserver(() => updateScale());
            ro.observe(wrapper);
            if (wrapper.parentElement) ro.observe(wrapper.parentElement);
        }
        setTimeout(updateScale, 50);
        setTimeout(updateScale, 250);
        this.updateScale = updateScale;
    }

    initLandscapeOrientationHint() {
        if (document.getElementById('raqeem-landscape-hint')) return;

        const hint = document.createElement('div');
        hint.id = 'raqeem-landscape-hint';
        hint.className = 'raqeem-landscape-hint';
        hint.innerHTML = `
            <div class="hint-content">
                <i class="fa-solid fa-mobile-screen-button rotate-icon"></i>
                <span>يُفضّل تدوير الجهاز للوضع الأفقي لأفضل تجربة معملية</span>
            </div>
            <button class="hint-btn" id="raqeem-rotate-btn" title="تدوير / ملء الشاشة">
                <i class="fa-solid fa-expand"></i> <span>تدوير / ملء الشاشة</span>
            </button>
        `;

        const header = document.querySelector('header') || document.body.firstElementChild;
        if (header && header.parentNode) {
            header.parentNode.insertBefore(hint, header.nextSibling);
        } else {
            document.body.insertBefore(hint, document.body.firstChild);
        }

        const rotateBtn = document.getElementById('raqeem-rotate-btn');
        if (rotateBtn) {
            rotateBtn.addEventListener('click', async () => {
                try {
                    if (screen.orientation && screen.orientation.lock) {
                        await screen.orientation.lock('landscape');
                    }
                } catch(e) {}
                try {
                    if (!document.fullscreenElement) {
                        if (document.documentElement.requestFullscreen) {
                            await document.documentElement.requestFullscreen();
                        } else if (document.documentElement.webkitRequestFullscreen) {
                            await document.documentElement.webkitRequestFullscreen();
                        }
                    }
                } catch(e) {}
            });
        }
    }

    get expectedPairs() {
        return this._expectedPairs;
    }

    set expectedPairs(val) {
        this._expectedPairs = val;
        if (this.wireEngine) {
            this.wireEngine.expectedPairs = val;
        }
    }

    get requiredPairs() {
        return this.expectedPairs;
    }

    set requiredPairs(val) {
        this.expectedPairs = val;
    }

    setupTerminals() {
        if (this.wireEngine) {
            this.wireEngine.setupTerminals();
        }
    }

    autoWire(pairs = this.expectedPairs) {
        if (this.wireEngine) {
            this.wireEngine.autoWire(pairs);
        }
    }

    clearWires() {
        if (this.wireEngine) {
            this.wireEngine.clearWires();
        }
        this.userConnections.clear();
    }

    setCircuitActive(isActive = true, activeColor = '#00d2ff') {
        if (this.wireEngine) {
            this.wireEngine.setCircuitActive(isActive, activeColor);
        }
    }

    registerComponent(targetZoneId, expectedConnections = []) {
        this.totalComponents++;
    }

    snapComponent(comp, dropZone) {
        if (!comp || !dropZone || comp.classList.contains("placed")) return;
        const targetLeft = parseFloat(dropZone.style.left) || 0;
        const targetTop = parseFloat(dropZone.style.top) || 0;
        
        gsap.to(comp, {
            left: targetLeft,
            top: targetTop,
            duration: 0.35,
            ease: "back.out(1.4)",
            onUpdate: () => {
                if (this.wireEngine) this.wireEngine.repositionWires();
            }
        });
        
        dropZone.classList.add("active");
        dropZone.classList.remove("highlight");
        const draggableInst = Draggable.get(comp);
        if (draggableInst) draggableInst.disable();
        gsap.set(comp, { zIndex: 10 });
        
        gsap.fromTo(dropZone, { scale: 1.1 }, { scale: 1, duration: 0.3 });
        
        comp.classList.add("placed");
        
        this.placedCount++;
        this.onComponentPlaced(this.placedCount, this.totalComponents);
    }

    initDragAndDrop() {
        const engine = this;
        
        if (typeof Draggable === 'undefined') {
            console.warn("GSAP Draggable is missing.");
            return;
        }

        document.querySelectorAll('.elite-component').forEach(comp => {
            // Tap-to-Place mobile & mouse fallback
            comp.addEventListener('click', () => {
                if (comp.classList.contains("placed") || comp._hasDragged) return;
                const targetId = comp.getAttribute("data-target");
                const dropZone = targetId ? document.getElementById(targetId) : null;
                if (dropZone && !dropZone.classList.contains("active")) {
                    engine.snapComponent(comp, dropZone);
                }
            });

            Draggable.create(comp, {
                type: "top,left",
                bounds: `#${engine.workspaceId}`,
                edgeResistance: 0.65,
                onPress: function() {
                    comp._hasDragged = false;
                    this.startLeft = parseFloat(this.target.style.left) || 0;
                    this.startTop = parseFloat(this.target.style.top) || 0;
                    gsap.set(this.target, { zIndex: 9999 });
                    
                    const targetId = this.target.getAttribute("data-target");
                    if (targetId) {
                        const dropZone = document.getElementById(targetId);
                        if (dropZone && !dropZone.classList.contains("active")) {
                            dropZone.classList.add("highlight");
                        }
                    }
                },
                onDrag: function() {
                    comp._hasDragged = true;
                    if (engine.wireEngine && this.target.classList.contains("placed")) {
                        if (!this.repainting) {
                            this.repainting = true;
                            requestAnimationFrame(() => {
                                engine.wireEngine.repositionWires();
                                this.repainting = false;
                            });
                        }
                    }
                },
                onDragEnd: function() {
                    const targetId = this.target.getAttribute("data-target");
                    const dropZone = targetId ? document.getElementById(targetId) : null;
                    
                    let isOver = false;
                    if (dropZone) {
                        const compRect = this.target.getBoundingClientRect();
                        const zoneRect = dropZone.getBoundingClientRect();
                        
                        isOver = !(compRect.right < zoneRect.left || 
                                   compRect.left > zoneRect.right || 
                                   compRect.bottom < zoneRect.top || 
                                   compRect.top > zoneRect.bottom);

                        dropZone.classList.remove("highlight");
                    }

                    if (isOver && dropZone && !dropZone.classList.contains("active")) {
                        engine.snapComponent(this.target, dropZone);
                    } else {
                        gsap.to(this.target, { 
                            left: this.startLeft, 
                            top: this.startTop, 
                            duration: 0.4, 
                            ease: "power2.out",
                            onUpdate: () => {
                                if (engine.wireEngine) engine.wireEngine.repositionWires();
                            }
                        });
                        gsap.set(this.target, { zIndex: 10 });
                    }
                }
            });
        });
    }

    reset() {
        this.placedCount = 0;
        this.userConnections.clear();
        this.isCircuitComplete = false;
        
        if (this.wireEngine) {
            this.wireEngine.clearWires();
        }

        document.querySelectorAll('.elite-component').forEach(comp => {
            comp.classList.remove('placed');
            comp._hasDragged = false;
            const draggables = Draggable.get(comp);
            if (draggables) draggables.enable();
        });

        document.querySelectorAll('.drop-zone').forEach(zone => {
            zone.classList.remove('active', 'highlight');
        });
    }
}

// Universal Global Auto-Scaler Helper for Standalone Experiments
window.initRaqeemResponsive = function(workspaceSelector = '#workspace', baseWidth = 900, baseHeight = 480) {
    const ws = typeof workspaceSelector === 'string' ? document.querySelector(workspaceSelector) : workspaceSelector;
    if (!ws) return;

    let wrapper = ws.closest('.workspace-scaler-wrapper');
    if (!wrapper) {
        wrapper = document.createElement('div');
        wrapper.className = 'workspace-scaler-wrapper';
        ws.parentNode.insertBefore(wrapper, ws);
        wrapper.appendChild(ws);
    }

    const updateScale = () => {
        const containerWidth = wrapper.clientWidth || (wrapper.parentElement ? wrapper.parentElement.clientWidth - 32 : window.innerWidth - 32);
        if (!containerWidth) return;
        const scale = Math.min(1.0, containerWidth / baseWidth);
        
        // Pure physical absolute positioning (ignoring RTL logic entirely)
        const emptySpace = containerWidth - (baseWidth * scale);
        const physicalLeft = emptySpace / 2;
        
        ws.style.position = 'absolute';
        ws.style.right = 'auto'; // Disable RTL right-anchoring
        ws.style.left = `${physicalLeft}px`;
        ws.style.top = '0px';
        ws.style.transformOrigin = 'top left';
        ws.style.transform = `scale(${scale})`;
        
        wrapper.style.height = `${baseHeight * scale}px`;
    };

    updateScale();
    requestAnimationFrame(updateScale);
    window.addEventListener('resize', updateScale, { passive: true });
    window.addEventListener('orientationchange', () => {
        setTimeout(updateScale, 50);
        setTimeout(updateScale, 200);
    }, { passive: true });
    window.addEventListener('load', updateScale, { passive: true });
    if (typeof ResizeObserver !== 'undefined') {
        const ro = new ResizeObserver(() => updateScale());
        ro.observe(wrapper);
        if (wrapper.parentElement) ro.observe(wrapper.parentElement);
    }
    setTimeout(updateScale, 50);
    setTimeout(updateScale, 250);

    window.addEventListener('resize', updateScale, { passive: true });
    window.addEventListener('orientationchange', () => setTimeout(updateScale, 150), { passive: true });
    setTimeout(updateScale, 50);

    // Also inject landscape orientation hint if not present
    if (!document.getElementById('raqeem-landscape-hint')) {
        const hint = document.createElement('div');
        hint.id = 'raqeem-landscape-hint';
        hint.className = 'raqeem-landscape-hint';
        hint.innerHTML = `
            <div class="hint-content">
                <i class="fa-solid fa-mobile-screen-button rotate-icon"></i>
                <span>يُفضّل تدوير الجهاز للوضع الأفقي لأفضل تجربة معملية</span>
            </div>
            <button class="hint-btn" id="raqeem-rotate-btn" title="تدوير / ملء الشاشة">
                <i class="fa-solid fa-expand"></i> <span>تدوير / ملء الشاشة</span>
            </button>
        `;
        const header = document.querySelector('header') || document.body.firstElementChild;
        if (header && header.parentNode) {
            header.parentNode.insertBefore(hint, header.nextSibling);
        } else {
            document.body.insertBefore(hint, document.body.firstChild);
        }
        const rotateBtn = document.getElementById('raqeem-rotate-btn');
        if (rotateBtn) {
            rotateBtn.addEventListener('click', async () => {
                try {
                    if (screen.orientation && screen.orientation.lock) {
                        await screen.orientation.lock('landscape');
                    }
                } catch(e) {}
                try {
                    if (!document.fullscreenElement) {
                        if (document.documentElement.requestFullscreen) {
                            await document.documentElement.requestFullscreen();
                        } else if (document.documentElement.webkitRequestFullscreen) {
                            await document.documentElement.webkitRequestFullscreen();
                        }
                    }
                } catch(e) {}
            });
        }
    }
};

window.EliteEngine = EliteEngine;
