function createLinkPreviewTooltip(document) {
    let tooltip = null;
    let fetchTimeout = null;

    function showTooltip(previewHtml, x, y) {
        const tooltipWidth = 320;  // match your max-width
        const tooltipHeight = 224; // 200px iframe + 24px padding

        if (!tooltip) {
            tooltip = document.createElement('div');
            tooltip.style.cssText = `
                position: fixed;
                z-index: 9999;
                max-width: 320px;
                background: rgba(50, 46, 46, 0.85);
                border: none;
                border-radius: 8px;
                box-shadow: 0 4px 8px rgba(0,0,0,0.2);
                padding: 12px;
                pointer-events: none;
                transition: opacity 0.2s;
                opacity: 0;
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
            <div style="width:300px; height:200px; overflow:hidden; border-radius:6px;">
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
        if (linkHostname !== location.hostname) return; // Only preview same-origin for security

        fetchTimeout = setTimeout(async () => {
            showTooltip('<em color="rgba(226, 226, 226, 1.00)">Loading preview...</em>', e.clientX, e.clientY);
            const previewHtml = await fetchPreview(href);
            showTooltip(previewHtml, e.clientX, e.clientY);
        }, 400); // Delay to avoid accidental hovers
    });

    document.addEventListener('mousemove', (e) => {
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
        if (e.target.closest('[href]')) {
            hideTooltip();
        }
    });
}