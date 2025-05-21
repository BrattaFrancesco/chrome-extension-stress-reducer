const style = document.createElement('style');
style.textContent = `
    @keyframes wave-effect {
        0% {
            opacity: 0.5;
            transform: scale(1);
        }
        70% {
            opacity: 0.2;
            transform: scale(2.2);
        }
        100% {
            opacity: 0;
            transform: scale(2.8);
        }
    }
    .wave-on-visible {
        position: relative;
        z-index: 1;
        overflow: visible;
    }
    .wave-on-visible::before {
        content: '';
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        background: rgba(124, 175, 76, 0.3);
        border-radius: 50%;
        transform: scale(1);
        animation: wave-effect 1.2s cubic-bezier(0.4,0,0.2,1) 1;
        z-index: 0;
    }
`;
document.head.appendChild(style);

let linkPreviewEnabled = true;

function createActivateEasyNavigationButton(document){
    // Create the button
    const button = document.createElement("button");
    button.style.cssText = `
        width: 38px;
        height: 38px;
        background-color: rgba(226, 226, 226, 1.00);
        padding: 8;
        border-radius: 100px;
        border: none;
        cursor: pointer;
    `;

    // Create the image inside the button
    const img = document.createElement("img");
    img.src = chrome.runtime.getURL("images/tooltip_off.svg");
    img.style.cssText = `
        width: 100%;
        height: 100%;
        objectFit: contain;
    `;
    img.addEventListener('dragstart', e => e.preventDefault());
    img.alt = "icon";

    // Append image to button
    button.appendChild(img);

    button.addEventListener('click', () => {
        linkPreviewEnabled = !linkPreviewEnabled;
        img.src = linkPreviewEnabled ? 
                                    chrome.runtime.getURL('images/tooltip_off.svg') 
                                    : chrome.runtime.getURL('images/tooltip_on.svg');
    });
    return button;
}

function createLinkPreviewTooltip(document) {
    let tooltip = null;
    let fetchTimeout = null;

    function showTooltip(previewHtml, x, y) {
        const tooltipWidth = 320;  // match your max-width
        const tooltipHeight = 212; // 200px iframe + 24px padding

        if (!tooltip) {
            tooltip = document.createElement('div');
            tooltip.style.cssText = `
                position: fixed;
                z-index: 9999;
                width: auto;
                max-width: ${tooltipWidth}px;
                background: rgba(50, 46, 46, 0.85);
                border: none;
                border-radius: 8px;
                box-shadow: 0 4px 8px rgba(0,0,0,0.2);
                padding: 12px;
                pointer-events: none;
                transition: opacity 0.2s;
                opacity: 0;
                color: white;
            `;
            document.body.appendChild(tooltip);
        }
        tooltip.innerHTML = previewHtml;
        
        let left = x + 16;
        let top = y + 16;
        if (left + tooltipWidth > window.innerWidth) {
            left = window.innerWidth - tooltipWidth - 8;
        }
        if (top + tooltipHeight > window.innerHeight) {
            top = window.innerHeight - tooltipHeight - 8;
        }
        if (left < 0) left = 8;
        if (top < 0) top = 8;

        tooltip.style.left = `${left + 16}px`;
        tooltip.style.top = `${top + 16}px`;
        tooltip.style.opacity = '1';
    }

    function hideTooltip() {
        if (tooltip) {
            tooltip.style.opacity = '0';
        }
        if (fetchTimeout) {
            clearTimeout(fetchTimeout);
            fetchTimeout = null;
        }
    }

    async function fetchPreview(url) {
        return `
            <div style="width:auto; height:200px; overflow:hidden; border-radius:8px;">
                <iframe 
                    src="${url}" 
                    style="
                        width:1200px; 
                        height:800px; 
                        border:none; 
                        transform: scale(0.25); 
                        transform-origin: top left; 
                        pointer-events:none;
                    "
                    sandbox="allow-same-origin allow-scripts allow-forms"
                    scrolling="no"
                ></iframe>
            </div>
        `;
    }

    document.addEventListener('mouseover', async (e) => {
        if (!linkPreviewEnabled) return;
        const link = e.target.closest('[href]');
        if (!link) return;
        
        // Use URL constructor to get hostname safely
        let href = link.getAttribute('href');
        if (!href) return;
        // Handle relative URLs
        try {
            href = new URL(href, location.href).href;
        } catch {
            return;
        }
        const linkHostname = new URL(href).hostname;
        if (linkHostname !== location.hostname) {
            showTooltip('<em>Attention! This is an external link. \nFor security reason we cannot show you what is there :(</em>', e.clientX, e.clientY);
        } else {
            showTooltip('<em>Loading...</em>', e.clientX, e.clientY);
            fetchTimeout = setTimeout(async () => {
                const previewHtml = await fetchPreview(href);
                showTooltip(previewHtml, e.clientX, e.clientY);
            }, 400); // Delay to avoid accidental hovers
        }

        
    });

    document.addEventListener('mousemove', (e) => {
        if (!linkPreviewEnabled) return;
        if (tooltip && tooltip.style.opacity === '1') {
            const tooltipWidth = 320;
            const tooltipHeight = 224;
            let left = e.clientX + 16;
            let top = e.clientY + 16;
            if (left + tooltipWidth > window.innerWidth) {
                left = window.innerWidth - tooltipWidth - 8;
            }
            if (top + tooltipHeight > window.innerHeight) {
                top = window.innerHeight - tooltipHeight - 8;
            }
            if (left < 0) left = 8;
            if (top < 0) top = 8;
            tooltip.style.left = `${left}px`;
            tooltip.style.top = `${top}px`;
        }
    });

    document.addEventListener('mouseout', (e) => {
        if (!linkPreviewEnabled) return;
        if (e.target.closest('[href]')) {
            hideTooltip();
        }
    });
}

function enableWaveOnVisibleForButtons() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                if (!linkPreviewEnabled) return;
                entry.target.classList.add('wave-on-visible');
                // Remove the class after animation so it can be triggered again
                entry.target.addEventListener('animationend', () => {
                    entry.target.classList.remove('wave-on-visible');
                }, { once: true });
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('button').forEach(btn => observer.observe(btn));
}