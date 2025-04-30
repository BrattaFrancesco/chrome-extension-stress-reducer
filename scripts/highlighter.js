const body = document.querySelector("body");

if(body){
    // Create container div
    const container = document.createElement("div");
    container.style.cssText = `
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
        padding: 16px;
        border-radius: 100px;
        margin-top: 8px;
        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    `;

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
    img.src = chrome.runtime.getURL("images/highlighter.svg");
    img.style.cssText = `
        width: 100%;
        height: 100%;
        objectFit: contain;
    `;

    // Append image to button, button to container, and container to body
    button.appendChild(img);
    container.appendChild(button);

    let toggled = false;
    // Optionally, add click handler
    button.addEventListener("click", () => {
        toggled = !toggled;
        img.src = toggled ? chrome.runtime.getURL("images/x.svg") : chrome.runtime.getURL("images/highlighter.svg");;    
        // Find all text-containing elements (you can refine this selector)
        const elements = document.querySelectorAll('p');

        elements.forEach(el => {
            // Avoid adding multiple buttons
            const oldBtn = el.querySelector('.my-extension-button')
            if (oldBtn) {
                oldBtn.remove();
                return
            };

            if(toggled){
                const btn = document.createElement('button');
                btn.className = 'my-extension-button';
                btn.style.cssText = `
                    width: 38px;
                    height: 38px;
                    display: flex;
                    flex-direction: row;
                    column-gap: 8px;
                    align-items: center;
                    justify-content: center;
                    padding: 8px;
                    border-top-left-radius: 100%;
                    border-top-right-radius: 100%;
                    border-bottom-right-radius: 100%;
                    border-bottom-left-radius: 100%;
                    background-color: rgba(226, 226, 226, 1.00);
                    border: 0px solid rgba(50, 46, 46, 1);
                `;
                const img = document.createElement("img");
                img.src = chrome.runtime.getURL("images/highlighter.svg");
                img.style.cssText = `
                    width: 100%;
                    height: 100%;
                    objectFit: contain;
                `;
                btn.appendChild(img);

                // Your specific behavior here
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const text = el.textContent;

                    const doc = nlp(text);
                    const people = doc.people().out('array');
                    const orgs = doc.organizations().out('array');

                    let highlighted = text;
                    [...people, ...orgs].forEach(word => {
                    highlighted = highlighted.replace(new RegExp(`\\b${word}\\b`, 'gi'), 
                                                    `<mark>${word}</mark>`);
                    });
                    console.log(text)
                    el.innerHTML = highlighted;
                });
                el.appendChild(btn);
            }
        });
    });
    
    body.appendChild(container)
}