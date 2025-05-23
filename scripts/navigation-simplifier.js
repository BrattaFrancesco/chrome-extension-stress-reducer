const style = document.createElement('style');
style.textContent = `
    @keyframes shine-effect {
        0% {
            background-position: -120% 0;
        }
        100% {
            background-position: 120% 0;
        }
    }
    .shine-on-visible {
        position: relative;
        z-index: 1;
        overflow: visible;
        background: linear-gradient(
            150deg,
            rgba(255,255,255,0) 0%,
            rgba(255,255,255,0.15) 25%,
            rgb(255, 99, 71) 50%,
            rgba(255,255,255,0.15) 75%,
            rgba(255,255,255,0) 100%
        );
        background-size: 200% 100%;
        background-repeat: no-repeat;
        animation: shine-effect 1.5s linear 1;
    }
`;
document.head.appendChild(style);

function restoreState() {
    const savedState = localStorage.getItem("linkPreviewEnabled") === "true";
    if(savedState){
        return savedState;
    }else{
        return false;
    }
}

function enableShineOnVisibleForButtons() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('shine-on-visible');
                // Remove the class after animation so it can be triggered again
                entry.target.addEventListener('animationend', () => {
                    entry.target.classList.remove('shine-on-visible');
                }, { once: true });
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('button').forEach(btn => observer.observe(btn));
    return observer;
}

function disableShineOnVisibleForButtons(observer) {
    if (observer) {
        observer.disconnect();
        observer = null;
    }
    document.querySelectorAll('button.shine-on-visible').forEach(btn => {
        btn.classList.remove('shine-on-visible');
    });
}

function createActivateEasyNavigationButton(document){
    let linkPreviewEnabled = restoreState();
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

    let shineOnVisible = null;
    let cleanupTooltip = null;

    if (linkPreviewEnabled) {
        shineOnVisible = enableShineOnVisibleForButtons();
        cleanupTooltip = activateLinkPreviewTooltip();
    }else {
        disableShineOnVisibleForButtons(shineOnVisible);
        if(cleanupTooltip) cleanupTooltip();
    }

    button.addEventListener('click', () => {
        linkPreviewEnabled = !linkPreviewEnabled;
        if (linkPreviewEnabled) {
            shineOnVisible = enableShineOnVisibleForButtons();
            cleanupTooltip = activateLinkPreviewTooltip();
        }else {
            disableShineOnVisibleForButtons(shineOnVisible);
            if(cleanupTooltip) cleanupTooltip();
        }
        localStorage.setItem("linkPreviewEnabled", linkPreviewEnabled);
        img.src = linkPreviewEnabled ? 
                    chrome.runtime.getURL('images/tooltip_off.svg') :
                    chrome.runtime.getURL('images/tooltip_on.svg');
    });
    return button;
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
        try {
            return new Promise((resolve) => {
                `<div style="width:auto; height:200px; overflow:hidden; border-radius:8px;">
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
            });
        } catch (error) {
            return Promise.reject(error)
        }
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
                fetchPreview(href)
                .then(previewHtml => showTooltip(previewHtml, e.clientX, e.clientY))
                .catch(showTooltip('<em>Failed to load preview :(</em>', e.clientX, e.clientY));
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