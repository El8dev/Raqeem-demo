// Base Logic for Experiments

window.autoConnectCircuit = function() {
    if (!window.engine || !window.engine.wireEngine) return;

    // Auto-snap any unplaced components first
    const unplaced = document.querySelectorAll('.elite-component:not(.placed)');
    if (unplaced.length > 0) {
        unplaced.forEach(comp => {
            const targetId = comp.getAttribute('data-target');
            const dropZone = targetId ? document.getElementById(targetId) : null;
            if (dropZone) {
                window.engine.snapComponent(comp, dropZone);
            }
        });
    }

    setTimeout(() => {
        window.engine.wireEngine.clearWires();
        const pairs = window.experimentConfig?.pairs || [];
        pairs.forEach(([srcId, tgtId]) => {
            const srcEl = document.getElementById(srcId);
            const tgtEl = document.getElementById(tgtId);
            if (srcEl && tgtEl) {
                window.engine.wireEngine.connect(srcEl, tgtEl);
            }
        });
    }, 350);
};

window.resetLab = function() {
    // Reset Circuit State
    window.isCircuitComplete = false;
    
    if (typeof window.experimentConfig?.onReset === 'function') {
        window.experimentConfig.onReset();
    }

    if (window.engine) {
        if (typeof window.engine.reset === 'function') {
            window.engine.reset();
        } else {
            window.engine.clearWires();
            window.engine.placedCount = 0;
        }
    }

    // Reset UI Elements
    document.querySelectorAll('.connected').forEach(el => el.classList.remove('connected'));
    document.querySelectorAll('.active').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.highlight').forEach(el => el.classList.remove('highlight'));
    
    const stepBanner = document.getElementById('stepBanner') || document.querySelector('raqeem-step-banner')?.querySelector('div');
    if (stepBanner) {
        stepBanner.innerText = window.experimentConfig?.initialStepText || 'الخطوة 1: قم بسحب القطع وتثبيتها في الدائرة.';
        stepBanner.style.color = 'var(--cyber-orange)';
    }
    
    const conclusion = document.getElementById('conclusion');
    if(conclusion) {
        conclusion.classList.add('hidden');
        conclusion.classList.remove('opacity-100');
    }
    
    const switchArm = document.getElementById('sw-arm');
    if (switchArm) gsap.to(switchArm, { rotation: -30, duration: 0.25 });

    if (typeof window.experimentConfig?.onResetUI === 'function') {
        window.experimentConfig.onResetUI();
    }
};

window.createSpark = function(x, y) {
    const workspace = document.getElementById('workspace');
    if (!workspace) return;
    for (let i = 0; i < 6; i++) {
        const spark = document.createElement('div');
        spark.style.position = 'absolute'; spark.style.left = x + 'px'; spark.style.top = y + 'px';
        spark.style.width = '3px'; spark.style.height = '3px'; spark.style.borderRadius = '50%';
        spark.style.backgroundColor = '#ffd700'; spark.style.boxShadow = '0 0 4px #ff9f03, 0 0 8px #ffffff';
        spark.style.zIndex = '50'; workspace.appendChild(spark);
        const angle = Math.random() * Math.PI * 2; const dist = Math.random() * 20 + 10;
        gsap.to(spark, { x: Math.cos(angle)*dist, y: Math.sin(angle)*dist, opacity: 0, duration: 0.4, onComplete: ()=>spark.remove() });
    }
};
