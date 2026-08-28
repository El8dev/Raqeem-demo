class EliteComponents {
    /**
     * Renders a component's outer wrapper and terminal nodes.
     * @param {string} id - Component ID
     * @param {string} type - Component CSS class (e.g., 'battery')
     * @param {number} x - Left position
     * @param {number} y - Top position
     * @param {number} w - Width
     * @param {number} h - Height
     * @param {string} targetZone - ID of the drop zone it belongs to
     * @param {string} innerHTML - The SVG or internal content
     * @param {Array} terminals - Array of terminal definitions {id, x, y}
     * @returns {string} HTML string
     */
    static createWrapper(id, type, x, y, w, h, targetZone, innerHTML, terminals) {
        let terminalsHTML = '';
        if (terminals && terminals.length > 0) {
            terminals.forEach(t => {
                const leftPerc = (t.x / w) * 100;
                const topPerc = (t.y / h) * 100;
                const maxConnsAttr = t.maxConnections ? `data-max-connections="${t.maxConnections}"` : '';
                terminalsHTML += `<div class="terminal-node" id="${t.id}" ${maxConnsAttr} style="left: ${leftPerc}%; top: ${topPerc}%;"></div>`;
            });
        }

        return `
        <div class="elite-component ${type} overflow-visible" id="${id}" data-target="${targetZone}" style="left: ${x}px; top: ${y}px; width: ${w}px; height: ${h}px;">
            ${innerHTML}
            ${terminalsHTML}
        </div>
        `;
    }

    static getBattery(id, x, y, targetZone) {
        const svg = `
        <svg viewBox="0 0 70 60" class="w-full h-full overflow-visible">
            <defs>
              <linearGradient id="batBody" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#1e293b" />
                <stop offset="30%" stop-color="#0f172a" />
                <stop offset="100%" stop-color="#020617" />
              </linearGradient>
              <linearGradient id="batTop" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#ef4444" />
                <stop offset="50%" stop-color="#b91c1c" />
                <stop offset="100%" stop-color="#7f1d1d" />
              </linearGradient>
              <linearGradient id="batNeg" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#3b82f6" />
                <stop offset="50%" stop-color="#1d4ed8" />
                <stop offset="100%" stop-color="#1e3a8a" />
              </linearGradient>
              <linearGradient id="brass" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#ffe082" />
                <stop offset="40%" stop-color="#d97706" />
                <stop offset="100%" stop-color="#78350f" />
              </linearGradient>
            </defs>
            <rect x="0" y="5" width="70" height="55" rx="6" fill="rgba(0,0,0,0.5)" filter="blur(2px)"/>
            <rect x="0" y="8" width="70" height="52" rx="6" fill="url(#batBody)" stroke="#334155" stroke-width="1.5" />
            <path d="M 2 8 L 33 8 L 33 16 L 2 16 Z" fill="url(#batNeg)" />
            <path d="M 37 8 L 68 8 L 68 16 L 37 16 Z" fill="url(#batTop)" />
            <text x="17" y="15" fill="#bfdbfe" font-size="10" font-weight="black" text-anchor="middle">-</text>
            <text x="53" y="15" fill="#fecaca" font-size="10" font-weight="black" text-anchor="middle">+</text>
            <ellipse cx="15" cy="8" rx="6" ry="3.5" fill="url(#brass)" stroke="#451a03" stroke-width="0.75" />
            <rect x="12" y="1" width="6" height="7" fill="url(#brass)" stroke="#451a03" stroke-width="0.5" />
            <circle cx="15" cy="1" r="3.2" fill="#fbbf24" />
            <ellipse cx="55" cy="8" rx="6" ry="3.5" fill="url(#brass)" stroke="#451a03" stroke-width="0.75" />
            <rect x="52" y="1" width="6" height="7" fill="url(#brass)" stroke="#451a03" stroke-width="0.5" />
            <circle cx="55" cy="1" r="3.2" fill="#fbbf24" />
            <text x="35" y="32" fill="#fde047" font-size="9" font-weight="black" font-family="Outfit" text-anchor="middle" letter-spacing="1">ELITE</text>
            <text x="35" y="44" fill="#e2e8f0" font-size="8" font-weight="bold" font-family="Outfit" text-anchor="middle">12V CELL</text>
        </svg>
        `;
        const terminals = [
            { id: `${id}-neg`, x: 15, y: 8 },
            { id: `${id}-pos`, x: 55, y: 8 }
        ];
        return this.createWrapper(id, 'battery', x, y, 70, 60, targetZone, svg, terminals);
    }

    static getResistor(id, x, y, targetZone, valueLabel = '1 kΩ') {
        const svg = `
        <svg viewBox="0 0 80 40" class="w-full h-full overflow-visible flex items-center justify-center">
            <defs>
              <linearGradient id="resBodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#ebdcb9" />
                <stop offset="40%" stop-color="#dfd0a9" />
                <stop offset="70%" stop-color="#cfbf97" />
                <stop offset="100%" stop-color="#a09270" />
              </linearGradient>
              <linearGradient id="metalLead" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#e2e8f0" />
                <stop offset="50%" stop-color="#94a3b8" />
                <stop offset="100%" stop-color="#475569" />
              </linearGradient>
            </defs>
            <rect x="-10" y="13.5" width="100" height="3" fill="url(#metalLead)" rx="1.5" />
            <rect x="12" y="6" width="56" height="18" rx="4" fill="url(#resBodyGrad)" stroke="#b5a67f" stroke-width="0.75" />
            <path d="M 12 6 C 17 6, 17 24, 12 24 Z" fill="url(#resBodyGrad)" stroke="#b5a67f" stroke-width="0.5" />
            <path d="M 68 6 C 63 6, 63 24, 68 24 Z" fill="url(#resBodyGrad)" stroke="#b5a67f" stroke-width="0.5" />
            <rect x="22" y="6" width="3.5" height="18" fill="#5c4033" />
            <rect x="30" y="6" width="3.5" height="18" fill="#000000" />
            <rect x="38" y="6" width="3.5" height="18" fill="#dc2626" />
            <rect x="54" y="6" width="3.5" height="18" fill="#d97706" />
            <text x="40" y="36" fill="#e2e8f0" font-size="8" font-weight="bold" font-family="Outfit" text-anchor="middle" style="text-shadow: 0 1px 2px rgba(0,0,0,0.8);">R = ${valueLabel}</text>
        </svg>
        `;
        const terminals = [
            { id: `${id}-left`, x: 0, y: 15 },
            { id: `${id}-right`, x: 80, y: 15 }
        ];
        return this.createWrapper(id, 'resistor', x, y, 80, 40, targetZone, svg, terminals);
    }
    static getLamp(id, x, y, targetZone, color = 'Yellow', label = 'L1') {
        const glowColor = color === 'Yellow' ? 'yellow-500' : 'blue-500';
        const svg = `
        <div class="relative w-[50px] h-[75px] flex flex-col items-center">
            <div class="absolute top-0 w-12 h-12 rounded-full bg-${glowColor}/0 blur-xl transition-all duration-300 z-0" id="${id}-glow"></div>
            <svg viewBox="0 0 50 75" class="w-full h-full z-10 overflow-visible">
              <rect x="13" y="55" width="24" height="15" rx="3" fill="#1e293b" stroke="#0f172a" stroke-width="1.5" />
              <rect x="15" y="58" width="20" height="4" fill="#334155" />
              <path d="M 16 38 H 34 V 55 H 16 Z" fill="url(#brassBaseGrad)" stroke="#5f4b1a" stroke-width="0.5" />
              <path d="M 16 43 C 20 45, 30 45, 34 43" stroke="#4a370e" stroke-width="1.5" fill="none" />
              <path d="M 16 49 C 20 51, 30 51, 34 49" stroke="#4a370e" stroke-width="1.5" fill="none" />
              <path d="M 16 38 C 8 32, 6 22, 10 14 C 14 6, 36 6, 40 14 C 44 22, 42 32, 34 38 Z" fill="url(#glassGrad)" stroke="#64748b" stroke-width="1.25" id="${id}-glass" />
              <path d="M 14 15 A 12 12 0 0 1 28 8" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="1.5" stroke-linecap="round" />
              <line x1="21" y1="38" x2="22" y2="24" stroke="#94a3b8" stroke-width="1" />
              <line x1="29" y1="38" x2="28" y2="24" stroke="#94a3b8" stroke-width="1" />
              <path d="M 22 24 Q 25 18 28 24" fill="none" stroke="#94a3b8" stroke-width="1.25" id="${id}-filament" />
            </svg>
            <span class="text-[9px] font-black text-slate-400 mt-1">مصباح ${label}</span>
        </div>
        `;
        const terminals = [
            { id: `${id}-left`, x: 0, y: 48 },
            { id: `${id}-right`, x: 50, y: 48 }
        ];
        return this.createWrapper(id, 'lamp-container', x, y, 50, 75, targetZone, svg, terminals);
    }

    static getGalvanometer(id, x, y, targetZone) {
        const svg = `
        <svg viewBox="0 0 110 90" class="w-full h-full overflow-visible">
            <defs>
              <linearGradient id="galvCase" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#334155" />
                <stop offset="100%" stop-color="#0f172a" />
              </linearGradient>
              <radialGradient id="galvFace" cx="50%" cy="100%" r="100%">
                <stop offset="0%" stop-color="#f8fafc" />
                <stop offset="85%" stop-color="#f1f5f9" />
                <stop offset="100%" stop-color="#cbd5e1" />
              </radialGradient>
              <linearGradient id="glassShine" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="rgba(255,255,255,0.22)" />
                <stop offset="35%" stop-color="rgba(255,255,255,0.05)" />
                <stop offset="40%" stop-color="rgba(255,255,255,0)" />
                <stop offset="100%" stop-color="rgba(255,255,255,0)" />
              </linearGradient>
            </defs>
            <rect x="2" y="2" width="106" height="86" rx="10" fill="rgba(0,0,0,0.5)" filter="blur(2px)" />
            <rect x="2" y="2" width="106" height="86" rx="10" fill="url(#galvCase)" stroke="#475569" stroke-width="1.5" />
            <path d="M 10 52 C 10 25, 100 25, 100 52 Z" fill="url(#galvFace)" stroke="#94a3b8" stroke-width="0.75" />
            <rect x="10" y="52" width="90" height="15" fill="url(#galvFace)" />
            <path d="M 10 67 L 100 67" stroke="#cbd5e1" stroke-width="1" />
            
            <line x1="55" y1="30" x2="55" y2="35" stroke="#ef4444" stroke-width="1.5" />
            <text x="55" y="28" fill="#dc2626" font-size="8" font-weight="black" text-anchor="middle">0</text>
            
            <line x1="37" y1="34" x2="39" y2="38.5" stroke="#334155" stroke-width="1" />
            <line x1="22" y1="44" x2="25.5" y2="47.5" stroke="#334155" stroke-width="1" />
            <text x="24" y="42" fill="#0f172a" font-size="9" font-weight="black" text-anchor="middle">-</text>
            
            <line x1="73" y1="34" x2="71" y2="38.5" stroke="#334155" stroke-width="1" />
            <line x1="88" y1="44" x2="84.5" y2="47.5" stroke="#334155" stroke-width="1" />
            <text x="86" y="42" fill="#0f172a" font-size="9" font-weight="black" text-anchor="middle">+</text>
            
            <text x="55" y="64" fill="#0f172a" font-size="12" font-weight="black" font-family="Outfit" text-anchor="middle">G</text>
            
            <circle cx="55" cy="74" r="7" fill="#1e293b" stroke="#475569" stroke-width="1" />
            <circle cx="55" cy="74" r="3" fill="#ef4444" />
            
            <path d="M 10 52 C 10 25, 100 25, 100 52 Z" fill="url(#glassShine)" pointer-events="none" />
            
            <rect x="25" y="86" width="10" height="5" rx="1" fill="url(#brass)" stroke="#475569" stroke-width="0.5" />
            <rect x="75" y="86" width="10" height="5" rx="1" fill="url(#brass)" stroke="#475569" stroke-width="0.5" />
        </svg>
        <div class="absolute" id="${id}-needle" style="left: 54px; top: 36px; width: 2px; height: 38px; background: #ef4444; transform-origin: bottom center; transform: rotate(0deg); box-shadow: 0 0 5px rgba(239,68,68,0.8); z-index: 15; transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);"></div>
        `;
        const terminals = [
            { id: `${id}-left`, x: 30, y: 89, maxConnections: 2 },
            { id: `${id}-right`, x: 80, y: 89, maxConnections: 2 }
        ];
        return this.createWrapper(id, 'galvanometer', x, y, 110, 90, targetZone, svg, terminals);
    }

    static getSwitch(id, x, y, targetZone, isTwoNode = false) {
        const labelHTML = ``;

        const svg3 = `
        ${labelHTML}
        <svg viewBox="0 0 80 100" class="w-full h-full overflow-visible">
            <defs>
              <linearGradient id="woodGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#5c4033" />
                <stop offset="50%" stop-color="#3d2b1f" />
                <stop offset="100%" stop-color="#261c13" />
              </linearGradient>
              <linearGradient id="copper" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#ea580c" />
                <stop offset="50%" stop-color="#f97316" />
                <stop offset="100%" stop-color="#c2410c" />
              </linearGradient>
            </defs>
            <rect x="0" y="0" width="80" height="100" rx="6" fill="url(#woodGrad)" stroke="#1a110b" stroke-width="1.5" />
            
            <rect x="6" y="6" width="12" height="12" fill="url(#copper)" stroke="#9a3412" stroke-width="0.5" />
            <circle cx="12" cy="12" r="2.5" fill="#fca5a5" />
            
            <rect x="6" y="76" width="12" height="12" fill="url(#copper)" stroke="#9a3412" stroke-width="0.5" />
            <circle cx="12" cy="82" r="2.5" fill="#93c5fd" />
            
            <rect x="62" y="41" width="12" height="12" fill="url(#copper)" stroke="#9a3412" stroke-width="0.5" />
            <circle cx="68" cy="47" r="3" fill="#94a3b8" stroke="#000" stroke-width="0.5" />
            
            <text x="22" y="16" fill="#f87171" font-size="7" font-weight="black" font-family="Outfit">1</text>
            <text x="22" y="86" fill="#60a5fa" font-size="7" font-weight="black" font-family="Outfit">2</text>
            <text x="56" y="50" fill="#fbbf24" font-size="8.5" font-weight="black" font-family="Outfit">K</text>
        </svg>
        <div class="switch-arm absolute" id="${id}-arm" style="left: 12px; top: 44px; width: 56px; height: 6px; transform-origin: 56px 3px; transform: rotate(-15deg); background: linear-gradient(180deg, #ea580c, #c2410c); border: 0.5px solid #7c2d12; border-radius: 1px; box-shadow: 0 1px 3px rgba(0,0,0,0.5); z-index: 10; transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.1);">
            <div class="absolute" style="left: -12px; top: -4px; width: 12px; height: 14px; background: linear-gradient(180deg, #1e293b, #0f172a); border: 1.5px solid #020617; border-radius: 3px; box-shadow: 1px 1px 4px rgba(0,0,0,0.655);"></div>
        </div>
        `;

        const svg2 = `
        ${labelHTML}
        <svg viewBox="0 0 80 100" class="w-full h-full overflow-visible">
            <defs>
              <linearGradient id="woodGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#5c4033" />
                <stop offset="50%" stop-color="#3d2b1f" />
                <stop offset="100%" stop-color="#261c13" />
              </linearGradient>
              <linearGradient id="copper" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#ea580c" />
                <stop offset="50%" stop-color="#f97316" />
                <stop offset="100%" stop-color="#c2410c" />
              </linearGradient>
            </defs>
            <rect x="0" y="0" width="80" height="100" rx="6" fill="url(#woodGrad)" stroke="#1a110b" stroke-width="1.5" />

            <rect x="6" y="41" width="12" height="12" fill="url(#copper)" stroke="#9a3412" stroke-width="0.5" />
            <circle cx="12" cy="47" r="2.5" fill="#fca5a5" />
            
            <rect x="62" y="41" width="12" height="12" fill="url(#copper)" stroke="#9a3412" stroke-width="0.5" />
            <circle cx="68" cy="47" r="3" fill="#94a3b8" stroke="#000" stroke-width="0.5" />
            
            <text x="56" y="50" fill="#fbbf24" font-size="8.5" font-weight="black" font-family="Outfit">K</text>
        </svg>
        <div class="switch-arm absolute" id="${id}-arm" style="left: 12px; top: 44px; width: 56px; height: 6px; transform-origin: 56px 3px; transform: rotate(-30deg); background: linear-gradient(180deg, #ea580c, #c2410c); border: 0.5px solid #7c2d12; border-radius: 1px; box-shadow: 0 1px 3px rgba(0,0,0,0.5); z-index: 10; transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.1);">
            <div class="absolute" style="left: -12px; top: -4px; width: 12px; height: 14px; background: linear-gradient(180deg, #1e293b, #0f172a); border: 1.5px solid #020617; border-radius: 3px; box-shadow: 1px 1px 4px rgba(0,0,0,0.655);"></div>
        </div>
        `;

        const terminals = isTwoNode ? [
            { id: `${id}-1`, x: 12, y: 47 },
            { id: `${id}-k`, x: 68, y: 47 }
        ] : [
            { id: `${id}-1`, x: 12, y: 12 },
            { id: `${id}-k`, x: 68, y: 47 },
            { id: `${id}-2`, x: 12, y: 82 }
        ];

        return this.createWrapper(id, 'switch-container', x, y, 80, 100, targetZone, isTwoNode ? svg2 : svg3, terminals);
    }

    static getCapacitor(id, x, y, targetZone) {
        const svg = `
        <svg viewBox="0 0 120 160" class="w-full h-full overflow-visible">
            <defs>
              <linearGradient id="plateLeftGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#cbd5e1" />
                <stop offset="40%" stop-color="#94a3b8" />
                <stop offset="100%" stop-color="#475569" />
              </linearGradient>
              <linearGradient id="plateRightGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#94a3b8" />
                <stop offset="60%" stop-color="#64748b" />
                <stop offset="100%" stop-color="#334155" />
              </linearGradient>
              <linearGradient id="plate3D" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#475569" />
                <stop offset="100%" stop-color="#1e293b" />
              </linearGradient>
            </defs>
            <rect x="5" y="33" width="30" height="4" fill="url(#plateLeftGrad)" />
            <rect x="0" y="31" width="11" height="8" fill="url(#brass)" stroke="#451a03" stroke-width="0.5" />
            <circle cx="5" cy="35" r="2" fill="#f59e0b" />
            
            <path d="M 29 10 L 35 10 L 35 150 L 29 150 Z" fill="url(#plate3D)" />
            <rect x="35" y="10" width="8" height="140" rx="1.5" fill="url(#plateLeftGrad)" stroke="#475569" stroke-width="0.5" />
            
            <rect x="85" y="113" width="30" height="4" fill="url(#plateRightGrad)" />
            <rect x="109" y="111" width="11" height="8" fill="url(#brass)" stroke="#451a03" stroke-width="0.5" />
            <circle cx="115" cy="115" r="2" fill="#f59e0b" />
            
            <path d="M 77 10 L 83 10 L 83 150 L 77 150 Z" fill="url(#plate3D)" />
            <rect x="83" y="10" width="8" height="140" rx="1.5" fill="url(#plateRightGrad)" stroke="#475569" stroke-width="0.5" />
            
            <text x="60" y="75" fill="#94a3b8" font-size="9" font-weight="black" font-family="Outfit" text-anchor="middle" letter-spacing="1.5" opacity="0.8">AIR GAP</text>
            <text x="60" y="89" fill="#94a3b8" font-size="10" font-weight="bold" font-family="Tajawal" text-anchor="middle" opacity="0.8">عازل هواء</text>
            
            <text x="60" y="145" fill="#e2e8f0" font-size="12" font-weight="black" font-family="Outfit" text-anchor="middle" opacity="0.9">C</text>
        </svg>
        
        <div class="absolute inset-y-0 left-[45px] w-5 flex flex-col justify-around py-6 text-cyber-blue text-lg font-bold select-none pointer-events-none opacity-0 transition-opacity duration-700 text-center" id="${id}-negCharges" style="text-shadow: 0 0 8px #3b82f6; line-height: 1;">
            <span>-</span><span>-</span><span>-</span><span>-</span><span>-</span><span>-</span>
        </div>
        <div class="absolute inset-y-0 right-[45px] w-5 flex flex-col justify-around py-6 text-cyber-red text-base font-bold select-none pointer-events-none opacity-0 transition-opacity duration-700 text-center" id="${id}-posCharges" style="text-shadow: 0 0 8px #ef4444;">
            <span>+</span><span>+</span><span>+</span><span>+</span><span>+</span><span>+</span>
        </div>
        `;
        const terminals = [
            { id: `${id}-left`, x: 5, y: 35 },
            { id: `${id}-right`, x: 115, y: 35 }
        ];
        return this.createWrapper(id, 'capacitor', x, y, 120, 160, targetZone, svg, terminals);
    }
    static getVoltmeter(id, x, y, targetZone) {
        const svg = `
        <div class="w-full h-full bg-gradient-to-br from-slate-800 to-slate-950 border-2 border-slate-600 flex flex-col items-center justify-between p-2 shadow-2xl relative box-border" style="width: 100%; height: 100%; border-radius: 16px;">
            <div class="absolute -top-1.5 bg-red-500 rounded-t shadow-[0_0_8px_rgba(239,68,68,0.8)]" style="left: 20px; width: 14px; height: 6px;"></div>
            <div class="absolute -top-1.5 bg-cyan-500 rounded-t shadow-[0_0_8px_rgba(59,130,246,0.8)]" style="right: 20px; width: 14px; height: 6px;"></div>
            
            <div class="gauge-area border-2 border-slate-700 bg-[#f8fafc] relative overflow-hidden flex justify-center items-end shadow-inner box-border" style="width: 100px; height: 55px; border-top-left-radius: 50px; border-top-right-radius: 50px; margin-top: 4px;">
                <svg viewBox="0 0 100 55" class="absolute top-0 left-0 pointer-events-none" style="width: 100%; height: 100%;">
                    <!-- Curved scale -->
                    <path d="M 15,55 A 35 35 0 0 1 85,55" fill="none" stroke="#94a3b8" stroke-width="6" />
                    <!-- Ticks & Text -->
                    <g transform="translate(50,55)">
                        <!-- 0V -->
                        <line x1="0" y1="-32" x2="0" y2="-38" stroke="#0f172a" stroke-width="1.5" transform="rotate(-60)" />
                        <text x="-32" y="-12" font-size="7" font-family="Outfit" font-weight="bold" fill="#0f172a" text-anchor="middle">0</text>
                        
                        <!-- 5V (-22.5 deg) -->
                        <line x1="0" y1="-32" x2="0" y2="-38" stroke="#0f172a" stroke-width="1" transform="rotate(-22.5)" />
                        
                        <!-- 10V (+15 deg) -->
                        <line x1="0" y1="-32" x2="0" y2="-38" stroke="#0f172a" stroke-width="1.5" transform="rotate(15)" />
                        <text x="12" y="-22" font-size="7" font-family="Outfit" font-weight="bold" fill="#0f172a" text-anchor="middle">10</text>
                        
                        <!-- 15V (+52.5 deg) -->
                        <line x1="0" y1="-32" x2="0" y2="-38" stroke="#dc2626" stroke-width="1.5" transform="rotate(52.5)" />
                        <text x="32" y="-8" font-size="7" font-family="Outfit" font-weight="bold" fill="#dc2626" text-anchor="middle">15</text>
                        
                        <text x="0" y="-15" font-size="9" font-family="Outfit" font-weight="900" fill="#334155" text-anchor="middle">V</text>
                    </g>
                </svg>
                <div class="needle absolute bg-red-600 origin-bottom z-10" id="${id}-needle" style="bottom: 0; left: 50%; width: 2px; height: 45px; transform: translateX(-50%) translateY(-2px) rotate(-60deg); transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1); border-radius: 1px; box-shadow: 1px 0 2px rgba(0,0,0,0.4);">
                    <div class="absolute bg-slate-800 rounded-full border-2 border-slate-300" style="width: 10px; height: 10px; bottom: -5px; left: 50%; transform: translateX(-50%);"></div>
                </div>
            </div>
            <div class="voltmeter-digital font-bold text-cyber-orange tracking-widest bg-black/80 rounded border border-white/10 shadow-inner text-center" id="${id}-digital" style="font-size: 10px; padding: 2px 8px; margin-top: 4px; width: 80%;">0.0 V</div>
        </div>
        `;
        const terminals = [
            { id: `${id}-pos`, x: 20, y: 5 },
            { id: `${id}-neg`, x: 100, y: 5 }
        ];
        return this.createWrapper(id, 'voltmeter', x, y, 120, 105, targetZone, svg, terminals);
    }

    static getAmmeter(id, x, y, targetZone) {
        const svg = `
        <div class="w-full h-full bg-gradient-to-br from-slate-800 to-slate-950 border-2 border-slate-600 flex flex-col items-center justify-between p-2 shadow-2xl relative box-border" style="width: 100%; height: 100%; border-radius: 16px;">
            <div class="absolute -top-1.5 bg-red-500 rounded-t shadow-[0_0_8px_rgba(239,68,68,0.8)]" style="left: 20px; width: 14px; height: 6px;"></div>
            <div class="absolute -top-1.5 bg-cyan-500 rounded-t shadow-[0_0_8px_rgba(59,130,246,0.8)]" style="right: 20px; width: 14px; height: 6px;"></div>
            
            <div class="gauge-area border-2 border-slate-700 bg-[#f8fafc] relative overflow-hidden flex justify-center items-end shadow-inner box-border" style="width: 100px; height: 55px; border-top-left-radius: 50px; border-top-right-radius: 50px; margin-top: 4px;">
                <svg viewBox="0 0 100 55" class="absolute top-0 left-0 pointer-events-none" style="width: 100%; height: 100%;">
                    <!-- Curved scale -->
                    <path d="M 15,55 A 35 35 0 0 1 85,55" fill="none" stroke="#94a3b8" stroke-width="6" />
                    <!-- Ticks & Text -->
                    <g transform="translate(50,55)">
                        <!-- 0A -->
                        <line x1="0" y1="-32" x2="0" y2="-38" stroke="#0f172a" stroke-width="1.5" transform="rotate(-60)" />
                        <text x="-32" y="-12" font-size="7" font-family="Outfit" font-weight="bold" fill="#0f172a" text-anchor="middle">0</text>
                        
                        <!-- 0.5A (-22.5 deg) -->
                        <line x1="0" y1="-32" x2="0" y2="-38" stroke="#0f172a" stroke-width="1" transform="rotate(-22.5)" />
                        
                        <!-- 1A (+15 deg) -->
                        <line x1="0" y1="-32" x2="0" y2="-38" stroke="#0f172a" stroke-width="1.5" transform="rotate(15)" />
                        <text x="12" y="-22" font-size="7" font-family="Outfit" font-weight="bold" fill="#0f172a" text-anchor="middle">1</text>
                        
                        <!-- 2A (+52.5 deg) -->
                        <line x1="0" y1="-32" x2="0" y2="-38" stroke="#dc2626" stroke-width="1.5" transform="rotate(52.5)" />
                        <text x="32" y="-8" font-size="7" font-family="Outfit" font-weight="bold" fill="#dc2626" text-anchor="middle">2</text>
                        
                        <text x="0" y="-15" font-size="9" font-family="Outfit" font-weight="900" fill="#334155" text-anchor="middle">A</text>
                    </g>
                </svg>
                <div class="needle absolute bg-red-600 origin-bottom z-10" id="${id}-needle" style="bottom: 0; left: 50%; width: 2px; height: 45px; transform: translateX(-50%) translateY(-2px) rotate(-60deg); transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1); border-radius: 1px; box-shadow: 1px 0 2px rgba(0,0,0,0.4);">
                    <div class="absolute bg-slate-800 rounded-full border-2 border-slate-300" style="width: 10px; height: 10px; bottom: -5px; left: 50%; transform: translateX(-50%);"></div>
                </div>
            </div>
            <div class="ammeter-digital font-bold text-cyber-green tracking-widest bg-black/80 rounded border border-white/10 shadow-inner text-center" id="${id}-digital" style="color:#2ecc71; font-size: 10px; padding: 2px 8px; margin-top: 4px; width: 80%;">0.00 A</div>
        </div>
        `;
        const terminals = [
            { id: `${id}-pos`, x: 20, y: -5 },
            { id: `${id}-neg`, x: 100, y: -5 }
        ];
        return this.createWrapper(id, 'ammeter', x, y, 120, 105, targetZone, svg, terminals);
    }

    static getDielectricSlab(id, x, y, kValue = 4) {
        const svg = `
        <div class="slab-body" style="width: 100%; height: 100%; background: linear-gradient(135deg, #fef3c7 0%, #f59e0b 28%, #d97706 62%, #b45309 100%); border: 2px solid rgba(251,191,36,0.88); border-radius: 7px; position: relative; overflow: hidden; box-shadow: 0 3px 14px rgba(245,158,11,0.5), inset 0 1px 0 rgba(255,255,255,0.24), inset 0 -1px 0 rgba(0,0,0,0.14);">
            <div style="position:absolute;inset:0;background:repeating-linear-gradient(45deg,rgba(255,255,255,0.09) 0,rgba(255,255,255,0.09) 1px,transparent 1px,transparent 10px);pointer-events:none;border-radius:5px;"></div>
            <div style="position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,255,255,0.2) 0%,transparent 52%);pointer-events:none;border-radius:5px;"></div>
            <div style="position:relative;z-index:1;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;color:white;font-family:'Tajawal',sans-serif;text-align:center;gap:5px;text-shadow:0 1px 4px rgba(0,0,0,0.55);">
                <span style="font-size:12px;font-weight:900;letter-spacing:0.4px;">عازل كهربائي</span>
                <span style="font-size:10px;color:#fef3c7;font-weight:700;">K = ${kValue}</span>
                <span style="font-size:8px;color:rgba(255,240,180,0.75);font-weight:600;">← اسحب للإدخال</span>
            </div>
            <div style="position:absolute;left:-20px;top:50%;transform:translateY(-50%);font-size:16px;color:rgba(251,191,36,0.55);pointer-events:none;">◀</div>
            <div style="position:absolute;right:7px;top:50%;transform:translateY(-50%);display:flex;flex-direction:column;gap:4px;pointer-events:none;">
                <div style="width:3px;height:3px;border-radius:50%;background:rgba(255,255,255,0.45);"></div>
                <div style="width:3px;height:3px;border-radius:50%;background:rgba(255,255,255,0.45);"></div>
                <div style="width:3px;height:3px;border-radius:50%;background:rgba(255,255,255,0.45);"></div>
            </div>
        </div>
        <div id="${id}-hint" style="position:absolute;top:-22px;left:50%;transform:translateX(-50%);font-size:9px;color:#fbbf24;font-weight:bold;white-space:nowrap;font-family:'Tajawal',sans-serif;opacity:0;transition:opacity 0.22s;text-shadow:0 1px 5px rgba(0,0,0,0.65);">
            <i class="fa-solid fa-arrows-left-right"></i> اسحب لإدخال العازل
        </div>
        `;
        return this.createWrapper(id, 'dielectric', x, y, 148, 88, null, svg, []);
    }

    static getFaradayCapacitor(id, x, y, targetZone) {
        const svg = `
        <div class="relative w-full h-full overflow-visible">
            <div class="plate plate-top w-[250px] h-[18px] bg-gradient-to-r from-red-500 via-red-600 to-red-700 rounded-t-md relative shadow-lg">
                <div class="charge-container top-charges absolute inset-x-0 bottom-1 h-5 flex justify-between px-6 box-border" id="${id}-posCharges">
                    <div class="charge pos text-white text-base font-bold flex justify-center items-center drop-shadow-[0_0_4px_rgba(255,255,255,0.8)] leading-none"><span style="position: relative; top: -1px;">+</span></div>
                    <div class="charge pos text-white text-base font-bold flex justify-center items-center drop-shadow-[0_0_4px_rgba(255,255,255,0.8)] leading-none"><span style="position: relative; top: -1px;">+</span></div>
                    <div class="charge pos text-white text-base font-bold flex justify-center items-center drop-shadow-[0_0_4px_rgba(255,255,255,0.8)] leading-none"><span style="position: relative; top: -1px;">+</span></div>
                    <div class="charge pos text-white text-base font-bold flex justify-center items-center drop-shadow-[0_0_4px_rgba(255,255,255,0.8)] leading-none"><span style="position: relative; top: -1px;">+</span></div>
                    <div class="charge pos text-white text-base font-bold flex justify-center items-center drop-shadow-[0_0_4px_rgba(255,255,255,0.8)] leading-none"><span style="position: relative; top: -1px;">+</span></div>
                </div>
            </div>
            <div class="plate plate-bottom w-[250px] h-[18px] bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 rounded-b-md relative shadow-lg" style="margin-top: 120px;">
                <div class="charge-container bottom-charges absolute inset-x-0 top-1 h-5 flex justify-between px-6 box-border" id="${id}-negCharges">
                    <div class="charge neg text-white text-base font-bold flex justify-center items-center drop-shadow-[0_0_4px_rgba(255,255,255,0.8)] leading-none">-</div>
                    <div class="charge neg text-white text-base font-bold flex justify-center items-center drop-shadow-[0_0_4px_rgba(255,255,255,0.8)] leading-none">-</div>
                    <div class="charge neg text-white text-base font-bold flex justify-center items-center drop-shadow-[0_0_4px_rgba(255,255,255,0.8)] leading-none">-</div>
                    <div class="charge neg text-white text-base font-bold flex justify-center items-center drop-shadow-[0_0_4px_rgba(255,255,255,0.8)] leading-none">-</div>
                    <div class="charge neg text-white text-base font-bold flex justify-center items-center drop-shadow-[0_0_4px_rgba(255,255,255,0.8)] leading-none">-</div>
                </div>
            </div>
            <div id="${id}-dielectric-zone" style="position:absolute; top:18px; bottom:18px; right:0; width:0%; border:2px dashed transparent; border-radius:6px; z-index:10; box-sizing:border-box;"></div>
        </div>
        `;
        const terminals = [
            { id: `${id}-top`, x: 125, y: 0 },
            { id: `${id}-bottom`, x: 125, y: 156 }
        ];
        return this.createWrapper(id, 'faraday-capacitor', x, y, 250, 156, targetZone, svg, terminals);
    }

    static getRing(id, x, y, targetZone) {
        const svg = `
        <svg width="220" height="220" viewBox="0 0 200 200" overflow="visible" style="display:block;">
            <defs>
                <radialGradient id="ws-rg-iron" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stop-color="#64748b"/>
                    <stop offset="100%" stop-color="#334155"/>
                </radialGradient>
                <filter id="ws-rf"><feDropShadow dx="0" dy="0" stdDeviation="7" flood-color="#000" flood-opacity=".65"/></filter>
                <filter id="ws-flux-glow"><feDropShadow dx="0" dy="0" stdDeviation="5" flood-color="#00d2ff" flood-opacity=".9"/></filter>
            </defs>
            <circle cx="100" cy="100" r="68" fill="none" stroke="url(#ws-rg-iron)" stroke-width="28" filter="url(#ws-rf)"/>
            <circle cx="100" cy="100" r="82" fill="none" stroke="rgba(255,255,255,.05)" stroke-width="1"/>
            <circle cx="100" cy="100" r="56" fill="none" stroke="rgba(255,255,255,.05)" stroke-width="1"/>
            <g id="${id}-flux-group" opacity="0">
                <circle id="${id}-flux-c1" cx="100" cy="100" r="28" fill="none" stroke="#00d2ff" stroke-width="2.5" stroke-dasharray="13 8" filter="url(#ws-flux-glow)"/>
                <circle id="${id}-flux-c2" cx="100" cy="100" r="44" fill="none" stroke="#00d2ff" stroke-width="2"   stroke-dasharray="17 9" filter="url(#ws-flux-glow)"/>
                <circle id="${id}-flux-c3" cx="100" cy="100" r="60" fill="none" stroke="#00d2ff" stroke-width="1.5" stroke-dasharray="21 10" filter="url(#ws-flux-glow)"/>
            </g>
            <path d="M38 78 C20 84 20 96 38 100 C20 104 20 116 38 122" fill="none" stroke="#ef4444" stroke-width="5.5" stroke-linecap="round"/>
            <line x1="38" y1="78"  x2="6" y2="78"  stroke="#ef4444" stroke-width="4.5" stroke-linecap="round"/>
            <line x1="38" y1="122" x2="6" y2="122" stroke="#ef4444" stroke-width="4.5" stroke-linecap="round"/>
            <circle id="anc-ring-p1" cx="6"   cy="78"  r="5" fill="#ef4444"/>
            <circle id="anc-ring-p2" cx="6"   cy="122" r="5" fill="#ef4444"/>
            <path d="M162 78 C180 84 180 96 162 100 C180 104 180 116 162 122" fill="none" stroke="#3b82f6" stroke-width="5.5" stroke-linecap="round"/>
            <line x1="162" y1="78"  x2="194" y2="78"  stroke="#3b82f6" stroke-width="4.5" stroke-linecap="round"/>
            <line x1="162" y1="122" x2="194" y2="122" stroke="#3b82f6" stroke-width="4.5" stroke-linecap="round"/>
            <circle id="anc-ring-s1" cx="194" cy="78"  r="5" fill="#3b82f6"/>
            <circle id="anc-ring-s2" cx="194" cy="122" r="5" fill="#3b82f6"/>
            <text x="100" y="106" text-anchor="middle" fill="rgba(255,255,255,.18)" font-size="12" font-family="Outfit" font-weight="700">Fe</text>
        </svg>
        `;
        const terminals = [
            { id: `${id}-p1`, x: 6, y: 78 },
            { id: `${id}-p2`, x: 6, y: 122 },
            { id: `${id}-s1`, x: 194, y: 78 },
            { id: `${id}-s2`, x: 194, y: 122 }
        ];
        return this.createWrapper(id, 'ring', x, y, 220, 220, targetZone, svg, terminals);
    }

    static getMagnet(id, x, y, targetZone) {
        const svg = `
        <div style="position:relative; width:160px; height:50px;">
            <svg viewBox="0 0 160 50" width="160" height="50" style="position:absolute; top:0; left:0; overflow:visible; pointer-events:none; z-index:-1;">
                <path d="M 40 0 C 40 -80, 120 -80, 120 0" fill="none" stroke="rgba(0,210,255,0.6)" stroke-width="2.5" stroke-dasharray="6,4" filter="drop-shadow(0 0 4px rgba(0,210,255,0.5))"/>
                <path d="M 40 50 C 40 130, 120 130, 120 50" fill="none" stroke="rgba(0,210,255,0.6)" stroke-width="2.5" stroke-dasharray="6,4" filter="drop-shadow(0 0 4px rgba(0,210,255,0.5))"/>
                <path d="M 20 0 C 20 -120, 140 -120, 140 0" fill="none" stroke="rgba(0,210,255,0.4)" stroke-width="2" stroke-dasharray="4,4"/>
                <path d="M 20 50 C 20 150, 140 150, 140 50" fill="none" stroke="rgba(0,210,255,0.4)" stroke-width="2" stroke-dasharray="4,4"/>
            </svg>
            <svg viewBox="0 0 160 50" width="160" height="50">
                <defs>
                    <linearGradient id="${id}-gradN" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stop-color="#f87171" />
                        <stop offset="50%" stop-color="#ef4444" />
                        <stop offset="100%" stop-color="#b91c1c" />
                    </linearGradient>
                    <linearGradient id="${id}-gradS" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stop-color="#60a5fa" />
                        <stop offset="50%" stop-color="#3b82f6" />
                        <stop offset="100%" stop-color="#1d4ed8" />
                    </linearGradient>
                </defs>
                <rect x="0" y="0" width="80" height="50" rx="4" fill="url(#${id}-gradN)" stroke="#7f1d1d" stroke-width="1.5"/>
                <rect x="80" y="0" width="80" height="50" rx="4" fill="url(#${id}-gradS)" stroke="#1e3a8a" stroke-width="1.5"/>
                <text x="40" y="32" fill="white" font-weight="bold" font-size="22" font-family="Outfit" text-anchor="middle">N</text>
                <text x="120" y="32" fill="white" font-weight="bold" font-size="22" font-family="Outfit" text-anchor="middle">S</text>
            </svg>
        </div>
        `;
        return this.createWrapper(id, 'magnet', x, y, 160, 50, targetZone, svg, []);
    }

    static getSecCoil(id, x, y, targetZone) {
        const svg = `
        <div style="position:relative; width:220px; height:100px;">
            <svg viewBox="0 0 220 100" width="220" height="100" style="position:absolute; top:0; left:0; z-index:10;">
                <ellipse cx="30" cy="50" rx="15" ry="35" fill="#94a3b8" stroke="#64748b" stroke-width="2"/>
                <path d="M 30 15 L 190 15 L 190 85 L 30 85 Z" fill="#cbd5e1" opacity="0.9"/>
                <path d="M 50 85 A 15 35 0 0 0 80 15 M 80 85 A 15 35 0 0 0 110 15 M 110 85 A 15 35 0 0 0 140 15 M 140 85 A 15 35 0 0 0 170 15" fill="none" stroke="#1e40af" stroke-width="4.5"/>
            </svg>
            <svg class="front-svg" viewBox="0 0 220 100" width="220" height="100" style="position:absolute; top:0; left:0; z-index:30; pointer-events:none;">
                <path d="M 30 15 L 190 15 A 15 35 0 0 1 190 85 L 30 85 A 15 35 0 0 1 30 15 Z" fill="rgba(241, 245, 249, 0.55)" stroke="#94a3b8" stroke-width="2"/>
                <ellipse cx="30" cy="50" rx="15" ry="35" fill="none" stroke="#64748b" stroke-width="2"/>
                <path d="M 50 15 A 12 35 0 0 0 50 85 M 80 15 A 12 35 0 0 0 80 85 M 110 15 A 12 35 0 0 0 110 85 M 140 15 A 12 35 0 0 0 140 85 M 170 15 A 12 35 0 0 0 170 85" fill="none" stroke="#3b82f6" stroke-width="6"/>
                <path d="M 50 85 L 50 100 M 170 85 L 170 100" fill="none" stroke="#3b82f6" stroke-width="6"/>
            </svg>
        </div>
        `;
        const terminals = [
            { id: `${id}-1`, x: 50, y: 100 },
            { id: `${id}-2`, x: 170, y: 100 }
        ];
        return this.createWrapper(id, 'sec_coil', x, y, 220, 100, targetZone, svg, terminals);
    }

    static getPriCoil(id, x, y, targetZone, compact = false) {
        const w = compact ? 90 : 160;
        const h = compact ? 90 : 70;
        
        const svg = `
        <div style="position:relative; width:100%; height:100%; display:flex; align-items:center; justify-content:center;">
            <svg viewBox="0 0 160 70" style="position:absolute; width:100%; height:auto; z-index:10; ${compact ? 'transform: scale(1.1);' : ''}">
                <ellipse cx="20" cy="35" rx="10" ry="25" fill="#64748b" stroke="#475569" stroke-width="1"/>
                <path d="M 20 10 L 140 10 L 140 60 L 20 60 Z" fill="#94a3b8" opacity="0.9"/>
                <path d="M 35 60 A 10 25 0 0 0 55 10 M 55 60 A 10 25 0 0 0 75 10 M 75 60 A 10 25 0 0 0 95 10 M 95 60 A 10 25 0 0 0 115 10 M 115 60 A 10 25 0 0 0 135 10" fill="none" stroke="#7f1d1d" stroke-width="3"/>
            </svg>
            <svg viewBox="0 0 160 70" style="position:absolute; width:100%; height:auto; z-index:30; pointer-events:none; ${compact ? 'transform: scale(1.1);' : ''}">
                <path d="M 20 10 L 140 10 A 10 25 0 0 1 140 60 L 20 60 A 10 25 0 0 1 20 10 Z" fill="rgba(241, 245, 249, 0.45)" stroke="#64748b" stroke-width="1"/>
                <ellipse cx="20" cy="35" rx="10" ry="25" fill="none" stroke="#475569" stroke-width="1"/>
                <path d="M 35 10 A 7 25 0 0 0 35 60 M 55 10 A 7 25 0 0 0 55 60 M 75 10 A 7 25 0 0 0 75 60 M 95 10 A 7 25 0 0 0 95 60 M 115 10 A 7 25 0 0 0 115 60 M 135 10 A 7 25 0 0 0 135 60" fill="none" stroke="#ef4444" stroke-width="5"/>
                <path d="M 35 60 L 35 70 M 135 60 L 135 70" fill="none" stroke="#ef4444" stroke-width="5"/>
            </svg>
        </div>
        `;
        let terminals;
        if (compact) {
            terminals = [
                { id: `${id}-left`, x: 0, y: 45 },
                { id: `${id}-right`, x: 90, y: 45 }
            ];
        } else {
            terminals = [
                { id: `${id}-1`, x: 35, y: 70 },
                { id: `${id}-2`, x: 135, y: 70 }
            ];
        }
        return this.createWrapper(id, 'pri_coil', x, y, w, h, targetZone, svg, terminals);
    }
    


    static getACSource(id, x, y, targetZone) {
        const svg = `
        <svg viewBox="0 0 80 80" class="w-full h-full overflow-visible">
            <defs>
              <linearGradient id="acBody" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#1e293b" />
                <stop offset="50%" stop-color="#0f172a" />
                <stop offset="100%" stop-color="#020617" />
              </linearGradient>
              <linearGradient id="acRim" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#38bdf8" />
                <stop offset="50%" stop-color="#0ea5e9" />
                <stop offset="100%" stop-color="#0284c7" />
              </linearGradient>
              <filter id="acGlow">
                <feDropShadow dx="0" dy="0" stdDeviation="4" flood-color="#38bdf8" flood-opacity="0.6"/>
              </filter>
            </defs>
            <!-- Shadow/Glow -->
            <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(56,189,248,0.2)" stroke-width="8" filter="blur(4px)" />
            
            <!-- Outer Rim -->
            <circle cx="40" cy="40" r="30" fill="url(#acBody)" stroke="url(#acRim)" stroke-width="2.5" filter="url(#acGlow)" />
            
            <!-- Inner Bevel -->
            <circle cx="40" cy="40" r="27" fill="none" stroke="#334155" stroke-width="1.5" opacity="0.8" />
            
            <!-- Sine Wave Symbol -->
            <path d="M 22 40 Q 31 25, 40 40 T 58 40" fill="none" stroke="#e0f2fe" stroke-width="3" stroke-linecap="round" />
            
            <!-- Terminals Connectors (visual) -->
            <rect x="0" y="38" width="10" height="4" fill="url(#brass)" stroke="#451a03" stroke-width="0.5" />
            <circle cx="2" cy="40" r="2.5" fill="#f59e0b" />
            
            <rect x="70" y="38" width="10" height="4" fill="url(#brass)" stroke="#451a03" stroke-width="0.5" />
            <circle cx="78" cy="40" r="2.5" fill="#f59e0b" />
            
            <!-- Label -->
            <text x="40" y="20" fill="#bae6fd" font-size="8" font-weight="bold" font-family="Outfit" text-anchor="middle" opacity="0.9">AC</text>
            <text x="40" y="66" fill="#38bdf8" font-size="8" font-weight="black" font-family="Outfit" text-anchor="middle">~</text>
        </svg>
        `;
        const terminals = [
            { id: `${id}-left`, x: 0, y: 40 },
            { id: `${id}-right`, x: 80, y: 40 }
        ];
        return this.createWrapper(id, 'ac-source', x, y, 80, 80, targetZone, svg, terminals);
    }
}

// Attach to window so it can be used across scripts
window.EliteComponents = EliteComponents;
