import './RaqeemHeader.js';
import './RaqeemStepBanner.js';
import './RaqeemActions.js';
import './RaqeemWiringLayout.js';

// Inject base styles for custom elements to ensure they don't break the flex layout
const style = document.createElement('style');
style.textContent = `
raqeem-header, raqeem-step-banner, raqeem-actions, raqeem-wiring-layout {
    display: block;
    width: 100%;
}
`;
document.head.appendChild(style);
// Note: If adding more Web Components, import them here.
