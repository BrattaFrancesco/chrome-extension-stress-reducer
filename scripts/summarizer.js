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
            sRoot.className = 's-root-summarize-text';
            sRoot.attachShadow({ mode: "open" });
            
            // Avoid adding multiple buttons
            const oldBtn = el.querySelector('.s-root-summarize-text')
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
                    
                    const result = summarize(el.textContent, 1, 5);
                    
                    const sRootSum = document.createElement("div");
                    sRootSum.className = "s-root-summarized-content"
                    sRootSum.attachShadow({ mode: "open" });

                    // Create details and summary elements
                    const detail = document.createElement("details");
                    const sum = document.createElement("summary");
                    const txt1 = document.createTextNode("Summarized content");
                    sum.appendChild(txt1);

                    const p = document.createElement("p");
                    const txt2 = document.createTextNode(result.text);
                    p.appendChild(txt2);

                    // Add a class for the p element to style it
                    p.classList.add('detail-text');

                    // Append elements to the details
                    detail.appendChild(sum);
                    detail.appendChild(p);

                    // Style the shadow DOM
                    const style = document.createElement('style');
                    style.textContent = `
                    details {
                        background-color: rgba(226, 226, 226, 1.00);
                        border: 0px solid rgba(50, 46, 46, 1);
                        border-radius: 8px;
                        padding: 10px;
                        width: auto;
                        margin: auto;
                        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
                        transition: transform 0.3s ease-in-out;
                    }
                    summary {
                        font-weight: bold;
                        font-size: 1.2rem;
                        color:rgba(50, 46, 46, 0.85);
                        cursor: pointer;
                        padding: 5px 0;
                        transition: color 0.3s;
                        list_style: none;
                    }
                    summary:hover {
                        color:rgba(50, 46, 46, 0.85);
                    }
                    .detail-text {
                        color: rgba(50, 46, 46, 0.85);
                    }
                    p {
                        margin: 0;
                    }
                    `;

                    // Append the style to the shadow DOM
                    sRootSum.shadowRoot?.appendChild(style);

                    // Append the details to the shadow root and then to the element
                    sRootSum.shadowRoot?.appendChild(detail);
                    el.appendChild(sRootSum);

                    removeChildByClassName(el, 's-root-summarize-text')
                    el.setAttribute('text-summarized', 'true');

                    el.style.borderLeft = '2px dashed rgba(0, 128, 0, 0.5)';
                });

                sRoot.shadowRoot?.appendChild(btn);
                el.appendChild(sRoot);
            }
        });
    });
    
    return button
}