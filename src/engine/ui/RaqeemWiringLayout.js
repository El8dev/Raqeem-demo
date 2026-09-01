class RaqeemWiringLayout extends HTMLElement {
    connectedCallback() {
        // Extract content from custom pseudo-slots before overwriting innerHTML
        const toolboxEl = this.querySelector('[slot="toolbox"]');
        const actionsEl = this.querySelector('[slot="actions"]');
        const workspaceEl = this.querySelector('[slot="workspace"]');
        const statusEl = this.querySelector('[slot="status"]');

        const toolboxContent = toolboxEl ? toolboxEl.innerHTML : '';
        const actionsContent = actionsEl ? actionsEl.innerHTML : '';
        const workspaceContent = workspaceEl ? workspaceEl.innerHTML : '';
        const statusContent = statusEl ? statusEl.innerHTML : 'يرجى سحب المكونات من صندوق الأدوات إلى أماكنها المخصصة';

        this.innerHTML = `
            <div class="flex w-full h-[650px] overflow-hidden border border-white/10 rounded-[28px] bg-[#07090e] shadow-2xl backdrop-blur-md relative z-10" style="direction: rtl;">
                
                <!-- Sidebar / Toolbox (Right side) -->
                <div class="w-[280px] bg-[#111823] border-l border-cyan-500/20 p-4 flex flex-col shadow-[10px_0_20px_rgba(0,0,0,0.5)] z-50">
                    <div class="text-xs font-bold text-cyan-400 border-b border-cyan-500/20 pb-2 px-1 flex items-center justify-between mb-4">
                        <span class="flex items-center gap-1.5"><i class="fa-solid fa-toolbox text-cyan-400 text-[11px]"></i> صندوق الأدوات</span>
                    </div>
                    
                    <div class="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar" id="inventory">
                        ${toolboxContent}
                    </div>

                    ${actionsContent.trim() ? `
                    <div class="mt-4 border-t border-gray-700 pt-4 flex flex-col gap-2">
                        ${actionsContent}
                    </div>
                    ` : ''}
                </div>

                <!-- Main Content -->
                <div class="flex-1 flex flex-col relative h-full" style="z-index: 60;">
                    <!-- Workspace Canvas -->
                    <div class="flex-1 p-4 md:p-6 flex items-center justify-center relative pointer-events-none h-full w-full">
                        <div class="workspace-area pointer-events-auto w-full h-full relative" id="workspace" style="max-width: 900px;">
                            ${workspaceContent}
                        </div>
                    </div>

                    <!-- Status Panel -->
                    <div class="h-16 bg-[#111823] border-t border-cyan-500/20 flex items-center justify-center px-6">
                        <div id="status-text" class="text-sm md:text-lg font-bold text-orange-400 text-center">
                            ${statusContent}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}

customElements.define('raqeem-wiring-layout', RaqeemWiringLayout);
