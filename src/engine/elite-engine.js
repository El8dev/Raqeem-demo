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

    initDragAndDrop() {
        const engine = this;
        
        if (typeof Draggable === 'undefined') {
            console.warn("GSAP Draggable is missing.");
            return;
        }

        Draggable.create(".elite-component", {
            type: "top,left",
            bounds: `#${engine.workspaceId}`,
            edgeResistance: 0.65,
            onPress: function() {
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
            onRelease: function() {
                const targetId = this.target.getAttribute("data-target");
                if (!targetId) return;

                const dropZone = document.getElementById(targetId);
                if (dropZone) {
                    dropZone.classList.remove("highlight");
                }
                
                if (this.hitTest(dropZone, "50%")) {
                    const targetLeft = parseFloat(dropZone.style.left) || 0;
                    const targetTop = parseFloat(dropZone.style.top) || 0;

                    gsap.to(this.target, { 
                        left: targetLeft, 
                        top: targetTop, 
                        duration: 0.3, 
                        ease: "back.out(1.5)",
                        onUpdate: () => {
                            if (engine.wireEngine) engine.wireEngine.repositionWires();
                        }
                    });
                    
                    dropZone.classList.add("active");
                    this.disable();
                    gsap.set(this.target, { zIndex: 10 });
                    
                    gsap.fromTo(dropZone, { scale: 1.1 }, { scale: 1, duration: 0.3 });
                    
                    this.target.classList.add("placed");
                    
                    engine.placedCount++;
                    engine.onComponentPlaced(engine.placedCount, engine.totalComponents);
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
            const draggables = Draggable.get(comp);
            if (draggables) draggables.enable();
        });

        document.querySelectorAll('.drop-zone').forEach(zone => {
            zone.classList.remove('active', 'highlight');
        });
    }
}

window.EliteEngine = EliteEngine;
