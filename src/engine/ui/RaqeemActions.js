class RaqeemActions extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.innerHTML = `
            <div class="flex flex-wrap items-center justify-center gap-3 md:gap-4 mt-2">
                <button class="btn-auto-wire py-2.5 px-6 md:py-3 md:px-8 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold rounded-xl md:rounded-full shadow-lg shadow-cyan-500/20 transition-all duration-300 transform active:scale-95 flex items-center gap-2 text-xs md:text-base" id="autoConnectBtn" onclick="autoConnectCircuit()">
                    <i class="fa-solid fa-bolt"></i> <span>توصيل تلقائي</span>
                </button>
                <button class="btn-reset py-2.5 px-6 md:py-3 md:px-8 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-extrabold rounded-xl md:rounded-full shadow-lg shadow-red-500/20 transition-all duration-300 transform active:scale-95 flex items-center gap-2 text-xs md:text-base" id="resetBtn" onclick="resetLab()">
                    <i class="fa-solid fa-rotate-right"></i> <span>إعادة تعيين الدائرة</span>
                </button>
            </div>
        `;
    }
}

customElements.define('raqeem-actions', RaqeemActions);
