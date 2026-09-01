class RaqeemStepBanner extends HTMLElement {
    constructor() {
        super();
        this.stepText = this.getAttribute('text') || 'الخطوة 1: ...';
        this.bannerId = this.getAttribute('banner-id') || 'stepBanner';
    }

    connectedCallback() {
        this.innerHTML = `
            <div id="${this.bannerId}" class="w-full max-w-[950px] mx-auto bg-gradient-to-r from-slate-900 via-cyber-panel to-slate-900 text-cyber-orange py-3 px-4 md:py-4 md:px-6 rounded-xl md:rounded-2xl mb-4 md:mb-6 font-bold text-xs md:text-base border border-cyber-orange/20 shadow-xl text-center shadow-black/30 transition-all duration-500 ease-in-out">
                ${this.stepText}
            </div>
        `;
    }
}

customElements.define('raqeem-step-banner', RaqeemStepBanner);
