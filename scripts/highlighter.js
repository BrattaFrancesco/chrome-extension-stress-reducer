function extractKeyWords(text){
    const doc = nlp(text);
    const topics = doc.topics().out("array");

    return topics
}

function highlightHtml(text, wordsToHighlight){
    let highlighted = text;
    wordsToHighlight.forEach(word => {
        //remove special char from start and end
        word = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
                    .replace(/^[.,*+?^${}()|[\]\\]+/, '')
                    .replace(/[.,*+?^${}()|[\]\\]+$/, '');
        highlighted = highlighted.replace(new RegExp(`${word}`, 'gi'), 
                                        `<mark>${word}</mark>`);
        });

    return highlighted
}

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
    button.addEventListener("click", () => {
        toggled = !toggled;
        img.src = toggled ? chrome.runtime.getURL("images/x.svg") : chrome.runtime.getURL("images/highlighter.svg");;    
        // Find all text-containing elements, in this case just paragraph
        const elements = document.querySelectorAll('p');

        elements.forEach(el => {
            // Avoid adding multiple buttons
            const oldBtn = el.querySelector('.highlight-text')
            if (oldBtn) {
                oldBtn.remove();
                return
            };

            if(toggled && el.getAttribute('text-highlighted') === null){
                const btn = document.createElement('button');
                btn.className = 'highlight-text';
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

                // Highilgh single piece of text
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    const text = el.textContent;
                    
                    const topics = extractKeyWords(text);

                    const highlighted = highlightHtml(el.innerHTML, topics);

                    el.innerHTML = highlighted;
                    el.removeChild(el.querySelector('.highlight-text'));
                    el.setAttribute('text-highlighted', 'true');
                });
                el.appendChild(btn);
            }
        });
    });
    
    body.appendChild(container)
}