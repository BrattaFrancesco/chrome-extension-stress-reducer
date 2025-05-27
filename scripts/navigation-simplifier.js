function restoreState() {
    const savedState = localStorage.getItem("linkPreviewEnabled") === "true";
    if(savedState){
        return savedState;
    }else{
        return false;
    }
}

function highlightButtons() {
    const originalBackgrounds = new WeakMap();
    document.querySelectorAll('button, a').forEach(btn => {
        if(!originalBackgrounds.has(btn)) {
            originalBackgrounds.set(btn, btn.style.backgroundColor);
        }
        btn.style.backgroundColor = 'rgba(172, 255, 47, 0.5)';
    });
    return originalBackgrounds;
}

function resetButtonBackground(originalBackgrounds) {
    document.querySelectorAll('button, a').forEach(btn => {
        if(originalBackgrounds && originalBackgrounds.has(btn)){
            btn.style.backgroundColor = originalBackgrounds.get(btn) || '';
        }
    });
}

function activateLinkPreviewTooltip() {
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
        return `<div style="width:auto; height:200px; overflow:hidden; border-radius:8px;">
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
                </div>`;
    }

    function onMouseOver(e) {
        const link = e.target.closest('[href]');
        if (!link) return;
        
        let href = link.getAttribute('href');          
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
                let previewHtml;
                try {
                    previewHtml = await fetchPreview(href);
                } catch {
                    previewHtml = '<em>We have some problem loading the page :(</em>'; 
                }
                showTooltip(previewHtml, e.clientX, e.clientY);
            }, 400); // Delay to avoid accidental hovers
        }
    }

    function onMouseMove(e) {
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
    }

    function onMouseOut(e) {
        if (e.target.closest('[href]')) {
            hideTooltip();
        }
    }

    document.addEventListener('mouseover', onMouseOver);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseout', onMouseOut);

    return function (){
        document.removeEventListener('mouseover', onMouseOver);
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseout', onMouseOut);
        if (tooltip) {
            tooltip.remove();
            tooltip = null;
        }
        if (fetchTimeout) {
            clearTimeout(fetchTimeout);
            fetchTimeout = null;
        }
    }
}

function createActivateEasyNavigationButton(document){
    let linkPreviewEnabled = restoreState();
    // Create the button
    const button = document.createElement("button");
    button.title = "Activate/Deactivate preview of links";
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
    img.src = linkPreviewEnabled ? 
                chrome.runtime.getURL('images/tooltip_off.svg') :
                chrome.runtime.getURL('images/tooltip_on.svg');
    img.style.cssText = `
        width: 100%;
        height: 100%;
        objectFit: contain;
    `;
    img.addEventListener('dragstart', e => e.preventDefault());
    img.alt = "icon";

    // Append image to button
    button.appendChild(img);

    let originalBackgrounds = null;
    let cleanupTooltip = null;

    if (linkPreviewEnabled) {
        originalBackgrounds = highlightButtons();
        cleanupTooltip = activateLinkPreviewTooltip();
    }else {
        resetButtonBackground(originalBackgrounds);
        if(cleanupTooltip) cleanupTooltip();
    }

    button.addEventListener('click', () => {
        linkPreviewEnabled = !linkPreviewEnabled;
        if (linkPreviewEnabled) {
            originalBackgrounds = highlightButtons();
            cleanupTooltip = activateLinkPreviewTooltip();
        }else {
            resetButtonBackground(originalBackgrounds);
            if(cleanupTooltip) cleanupTooltip();
        }
        localStorage.setItem("linkPreviewEnabled", linkPreviewEnabled);
        img.src = linkPreviewEnabled ? 
                    chrome.runtime.getURL('images/tooltip_off.svg') :
                    chrome.runtime.getURL('images/tooltip_on.svg');
    });
    return button;
}