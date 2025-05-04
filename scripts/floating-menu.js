const body = document.querySelector("body");

if (body) {
    const sRoot = document.createElement("div");
    sRoot.attachShadow({ mode: "open" });

    // Create container div
    const floatingMenu = document.createElement("div");
    floatingMenu.style.cssText = `
        position: fixed;
        padding: 8px;
        z-index: 9999;
        background-color: rgba(50, 46, 46, 0.85);
        display: flex;
        flex-direction: row;
        column-gap: 16px;
        align-items: center;
        justify-content: center;
        border-radius: 100px;
        margin: 8px;
        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    `;
    const savedPosition = JSON.parse(localStorage.getItem("floatingMenuPosition"));
    if (savedPosition) {
        floatingMenu.style.left = savedPosition.left;
        floatingMenu.style.top = savedPosition.top;
        floatingMenu.style.transform = `translate(0, 0)`;

        // Restore layout
        if (savedPosition.layout === "column") {
            floatingMenu.style.flexDirection = "column";
            floatingMenu.style.height = "auto";
            floatingMenu.style.padding = "8px 0";
        } else {
            floatingMenu.style.flexDirection = "row";
            floatingMenu.style.height = "48px";
            floatingMenu.style.padding = "0";
        }
    } else {
        // Default position & layout
        floatingMenu.style.left = "50%";
        floatingMenu.style.top = "0";
        floatingMenu.style.transform = "translateX(-50%)";
        floatingMenu.style.flexDirection = "row";
    }

    // Create drag handle
    const dragHandle = document.createElement("div");
    dragHandle.textContent = "☰";
    dragHandle.style.cssText = `
        cursor: move;
        padding: 0 12px;
        user-select: none;
        font-size: 18px;
        color: white;
    `;
    floatingMenu.appendChild(dragHandle);

    // Create and append button
    const highligherButton = createHighligherButton(document);
    floatingMenu.appendChild(highligherButton);
    const resetButton = document.createElement("button");
    resetButton.textContent = "Reset";
    resetButton.style.cssText = `
        padding: 4px 8px;
        font-size: 14px;
        background-color: #444;
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
    `;
    resetButton.addEventListener("click", () => {
        localStorage.removeItem("floatingMenuPosition");
        floatingMenu.style.left = "50%";
        floatingMenu.style.top = "0";
        floatingMenu.style.transform = "translateX(-50%)";
        floatingMenu.style.flexDirection = "row";
        floatingMenu.style.height = "48px";
        floatingMenu.style.padding = "0";
    });
    floatingMenu.appendChild(resetButton);


    sRoot.shadowRoot?.appendChild(floatingMenu);
    body.appendChild(sRoot);

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

        const edgeThreshold = 32; // pixels from left/right edge

        // Switch to vertical layout near edges
        if (x < edgeThreshold || x > viewportWidth - menuWidth - edgeThreshold) {
            floatingMenu.style.flexDirection = "column";
            floatingMenu.style.height = "auto"; // Allow it to grow
            floatingMenu.style.padding = "8px 0";
        } else {
            floatingMenu.style.flexDirection = "row";
            floatingMenu.style.height = "48px"; // Restore original height
            floatingMenu.style.padding = "0";   // Remove vertical padding
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

        if (x < edgeThreshold || x > viewportWidth - menuWidth - edgeThreshold) {
            floatingMenu.style.flexDirection = "column";
            floatingMenu.style.height = "auto";
            floatingMenu.style.padding = "8px 0";
        } else {
            floatingMenu.style.flexDirection = "row";
            floatingMenu.style.height = "48px";
            floatingMenu.style.padding = "0";
        }
    });
    
}
