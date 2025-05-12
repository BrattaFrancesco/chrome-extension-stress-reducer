function createTextSummarizerButton(document){
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
    img.src = chrome.runtime.getURL("images/summarize.svg");
    img.style.cssText = `
        width: 100%;
        height: 100%;
        objectFit: contain;
    `;
    img.addEventListener('dragstart', e => e.preventDefault());
    img.alt = "icon";

    // Append image to button
    button.appendChild(img);

    let toggled = false;
    button.addEventListener("click", () => {
        toggled = !toggled;
        img.src = toggled ? chrome.runtime.getURL("images/x.svg") : chrome.runtime.getURL("images/summarize.svg");;    
        // Find all text-containing elements, in this case just paragraph
        const elements = document.querySelectorAll('p');

        elements.forEach(el => {
            const sRoot = document.createElement("div");
            sRoot.className = 'summarize-text';
            sRoot.attachShadow({ mode: "open" });
            
            // Avoid adding multiple buttons
            const oldBtn = el.querySelector('.summarize-text')
            if (oldBtn) {
                oldBtn.remove();
                return
            };

            if(toggled && el.getAttribute('text-summarized') === null){
                const btn = document.createElement('button');
                btn.style.cssText = `
                    width: 38px;
                    height: 38px;
                    display: flex;
                    flex-direction: row;
                    column-gap: 8px;
                    align-items: center;
                    justify-content: center;
                    padding: 8px !important;
                    border-top-left-radius: 100%;
                    border-top-right-radius: 100%;
                    border-bottom-right-radius: 100%;
                    border-bottom-left-radius: 100%;
                    background-color: rgba(226, 226, 226, 1.00);
                    border: 0px solid rgba(50, 46, 46, 1);
                `;
                const img = document.createElement("img");
                img.src = chrome.runtime.getURL("images/summarize.svg");
                img.style.cssText = `
                    width: 100%;
                    height: 100%;
                    objectFit: contain;
                `;
                btn.appendChild(img);

                // Highilgh single piece of text
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    
                    const result = summarize(el.innerHTML, 1, 3);
                    console.log(result);
                    
                    el.innerHTML = result.text;
                    el.removeChild(el.querySelector('.summarize-text'));
                    el.setAttribute('text-summarized', 'true');
                });

                sRoot.shadowRoot?.appendChild(btn);
                el.appendChild(sRoot);
            }
        });
    });
    
    return button
}