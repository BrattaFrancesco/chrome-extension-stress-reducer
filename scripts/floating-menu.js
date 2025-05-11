function restorePosition(element){
    const savedPosition = JSON.parse(localStorage.getItem("floatingMenuPosition"));
    if (savedPosition) {
        element.style.left = savedPosition.left;
        element.style.top = savedPosition.top;
        element.style.transform = `translate(0, 0)`;

        // Restore layout
        if (savedPosition.layout === "column") {
            element.style.flexDirection = "column";
            element.style.height = "auto";
            element.style.width = "auto";
        } else {
            element.style.flexDirection = "row";
            element.style.height = "auto";
            element.style.width = "auto";
        }
    } else {
        // Default position & layout
        element.style.top = "0";
        element.style.left = "50%";
        element.style.transform = "translateX(-50%)";
        element.style.flexDirection = "row";
    }
}

function createControlsContainer(document, floatingMenu){
    const controlsContainer = document.createElement("div");
    controlsContainer.style.height = "auto";
    controlsContainer.style.width = "auto";
    controlsContainer.style.display = "flex";
    controlsContainer.style.flexDirection = "column";
    controlsContainer.style.alignItems = "center";
    controlsContainer.style.justifyContent = "center"; // Vertically center items in container

    // Create drag handle
    const dragHandle = document.createElement("div");
    dragHandle.style.cssText = `
        cursor: move;
    `;
    const dragImg = document.createElement("img");
    dragImg.src = chrome.runtime.getURL("images/drag_indicator_white.svg");
    dragImg.style.cssText = `
        width: 100%;
        height: 100%;
        objectFit: contain;
    `;
    dragImg.addEventListener('dragstart', e => e.preventDefault());
    dragImg.alt = 'icon';
    dragHandle.appendChild(dragImg);
    controlsContainer.appendChild(dragHandle);

    /* // Reset button
    const resetButton = document.createElement("button");
    resetButton.style.cssText = `
        width: 100%;
        height: 100%;
        cursor: pointer;
        background: transparent;
        border: none;
    `;
    const resetImg = document.createElement("img");
    resetImg.src = chrome.runtime.getURL("images/settings_backup_restore_white.svg");
    resetImg.style.cssText = `
        width: 100%;
        height: 100%;
        objectFit: contain;
    `;
    resetImg.alt = 'icon';
    resetButton.appendChild(resetImg);

    resetButton.addEventListener("click", () => {
        localStorage.removeItem("floatingMenuPosition");
        floatingMenu.style.left = "50%";
        floatingMenu.style.transform = "translateX(-50%)";
        floatingMenu.style.flexDirection = "row";
    });
    controlsContainer.appendChild(resetButton); */

    // Drag logic (attached only to the drag handle)
    let isDragging = false;
    let offsetX, offsetY;

    dragHandle.addEventListener("mousedown", (e) => {
        isDragging = true;
        offsetX = e.clientX - floatingMenu.getBoundingClientRect().left;
        offsetY = e.clientY - floatingMenu.getBoundingClientRect().top;
        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
    });

    function onMouseMove(e) {
        if (!isDragging) return;
    
        const menuRect = floatingMenu.getBoundingClientRect();
        const menuWidth = menuRect.width;
        const menuHeight = menuRect.height;
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
    
        let x = e.clientX - offsetX;
        let y = e.clientY - offsetY;
    
        // Clamp x and y to viewport bounds
        x = Math.max(0, Math.min(x, viewportWidth - menuWidth));
        y = Math.max(0, Math.min(y, viewportHeight - menuHeight));
    
        floatingMenu.style.left = `${x}px`;
        floatingMenu.style.top = `${y}px`;
        floatingMenu.style.transform = `translate(0, 0)`; // Reset transform to absolute positioning

        const edgeThreshold = 64; // pixels from left/right edge

        // Switch to vertical layout near edges
        if (x < edgeThreshold || x > viewportWidth - menuWidth - edgeThreshold) {
            floatingMenu.style.flexDirection = "column";
        } else {
            floatingMenu.style.flexDirection = "row";
        }
    }
    

    function onMouseUp() {
        isDragging = false;
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);

        localStorage.setItem("floatingMenuPosition", JSON.stringify({
            left: floatingMenu.style.left,
            top: floatingMenu.style.top
        }));

        const isVertical = floatingMenu.style.flexDirection === "column";

        localStorage.setItem("floatingMenuPosition", JSON.stringify({
            left: floatingMenu.style.left,
            top: floatingMenu.style.top,
            layout: isVertical ? "column" : "row"
        }));
    }
    return controlsContainer
}

const body = document.querySelector("body");

if (body) {
    const sRoot = document.createElement("div");
    sRoot.attachShadow({ mode: "open" });
    sRoot.id = "sRoot-floating-menu";

    // Create container div
    const floatingMenu = document.createElement("div");
    floatingMenu.style.cssText = `
        position: fixed;
        z-index: 9999;
        background-color: rgba(50, 46, 46, 0.85);
        display: flex;
        column-gap: 8px;
        row-gap: 8px;
        align-items: center;
        justify-content: center;
        border-radius: 100px;
        margin: 8px;
        padding: 6px;
        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        transition: 
            top 0.3s ease, 
            left 0.3s ease, 
            height 0.3s ease,
            padding 0.3s ease,
            flex-direction 0.3s ease;
        will-change: top, left, height, flex-direction;
    `;
    restorePosition(floatingMenu);

    const controlsContainer = createControlsContainer(document, floatingMenu);

    floatingMenu.appendChild(controlsContainer);

    // When resize the window bring the menu in the new limits
    window.addEventListener("resize", () => {
        const menuRect = floatingMenu.getBoundingClientRect();
        const menuWidth = menuRect.width;
        const menuHeight = menuRect.height;
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
    
        let x = menuRect.left;
        let y = menuRect.top;
    
        // Clamp to visible area
        x = Math.max(0, Math.min(x, viewportWidth - menuWidth));
        y = Math.max(0, Math.min(y, viewportHeight - menuHeight));
    
        floatingMenu.style.left = `${x}px`;
        floatingMenu.style.top = `${y}px`;
        floatingMenu.style.transform = `translate(0, 0)`;

        const edgeThreshold = 64;

        if (x < edgeThreshold || x > viewportWidth - menuWidth - edgeThreshold) {
            floatingMenu.style.flexDirection = "column";
        } else {
            floatingMenu.style.flexDirection = "row";
        }
    });

    // Create and append buttons
    const singleParagraphHighligherButton = createSingleParagraphHighligherButton(document);
    floatingMenu.appendChild(singleParagraphHighligherButton);
    
    const allParagraphHighlighterButton = createAllParagraphHighlighterButton(document);
    floatingMenu.appendChild(allParagraphHighlighterButton);

    /* More buttons here
    *
    */
    sRoot.shadowRoot?.appendChild(floatingMenu);
    body.appendChild(sRoot);
}
