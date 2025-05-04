const body = document.querySelector("body");

if(body){
    const sRoot = document.createElement('div');
    sRoot.attachShadow({mode: "open"});

    // Create container div
    const floatingMenu = document.createElement("div");
    floatingMenu.style.cssText = `
        position: fixed;
        top: 0;
        left: 50%;
        transform: translateX(-50%);
        z-index: 9999;
        width: 240px;
        height: 48px;
        background-color: rgba(50, 46, 46, 0.85);
        display: flex;
        flex-direction: row;
        column-gap: 16px;
        align-items: center;
        justify-content: center;
        border-radius: 100px;
        margin-top: 8px;
        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    `;

    // Create and append button
    highligherButton = createHighligherButton(document);
    floatingMenu.appendChild(highligherButton);

    sRoot.shadowRoot?.appendChild(floatingMenu);

    body.appendChild(sRoot);
}