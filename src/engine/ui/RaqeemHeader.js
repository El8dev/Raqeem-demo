class RaqeemHeader extends HTMLElement {
    constructor() {
        super();
        this.title = this.getAttribute('title') || 'مختبر الفيزياء الافتراضي';
    }

    connectedCallback() {
        this.innerHTML = `
            <header class="w-full max-w-[950px] mx-auto flex flex-wrap md:flex-nowrap justify-center md:justify-between items-center mb-4 md:mb-6 z-10 gap-2 md:gap-4">
                <div class="elite-logo-container group select-none cursor-pointer flex items-center gap-2 md:gap-3 bg-black/40 border border-white/5 px-3 py-1.5 md:px-4 md:py-2 rounded-xl md:rounded-2xl backdrop-blur-md shadow-lg" onclick="window.location.reload();">
                    <div class="relative elite-logo-card transition-all duration-500 ease-out w-8 h-8 md:w-8 md:h-8" style="transform-style: preserve-3d;">
                        <div class="absolute inset-0 bg-cyan-500/10 rounded-xl blur-lg"></div>
                        <svg viewBox="0 0 100 100" class="w-full h-full drop-shadow-[0_0_6px_rgba(0,210,255,0.4)]">
                            <polygon points="50,5 90,25 90,65 50,95 10,65 10,25" fill="none" stroke="#00d2ff" stroke-width="5" stroke-linejoin="round" />
                            <polygon points="50,15 80,30 80,60 50,82 20,60 20,30" fill="rgba(11, 17, 28, 0.9)" stroke="#ffe082" stroke-width="3" stroke-linejoin="round" />
                            <path d="M40,36 H60 M40,49 H55 M40,62 H60 M40,36 V62" fill="none" stroke="#ffffff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                    </div>
                    <div class="flex flex-col text-right font-bold leading-tight">
                        <span class="text-[10px] md:text-sm tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white to-cyan-400 font-extrabold uppercase" style="font-family: 'Outfit', sans-serif;">ELITE</span>
                        <span class="text-[7px] md:text-[8px] text-cyan-400/80 tracking-widest font-ar">الفريق البرمجي</span>
                    </div>
                </div>

                <h1 class="text-base md:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-cyan-400 text-center flex-1 order-3 md:order-2 w-full md:w-auto mt-2 md:mt-0">${this.title}</h1>

                <a href="../index.html?showMenu=true" class="flex items-center gap-1.5 md:gap-2 px-3 py-1.5 md:px-3.5 md:py-2 rounded-xl text-xs font-bold transition-all duration-300 bg-black/60 border border-white/5 hover:border-cyan-400/40 text-slate-300 hover:text-white backdrop-blur-md shadow-lg shadow-black/40 order-2 md:order-3" id="back-btn">
                    <i class="fa-solid fa-chevron-right text-cyan-400 text-[10px] md:text-sm"></i> <span>القائمة الرئيسية</span>
                </a>
            </header>
        `;
    }
}

customElements.define('raqeem-header', RaqeemHeader);
