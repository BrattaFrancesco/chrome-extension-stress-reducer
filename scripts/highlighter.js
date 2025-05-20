function extractKeyWords(text){
    const doc = nlp(text);
    const topics = doc.topics().out('array');
    const numbers = doc.numbers().out('array')
    const acronyms = doc.acronyms().out('array'); 
    const hyphenated = doc.hyphenated().out('array');
    const emails = doc.emails().out('array');
    const phoneNumbers = doc.phoneNumbers().out('array');

    const out = [...topics, ...numbers, ...acronyms, ...hyphenated, ...emails, ...phoneNumbers]
    return out
}

function highlightHtml(el, wordsToHighlight){
    let highlighted = el.innerHTML;
    const shadowRoots = el.querySelectorAll('div[class^="s-root-"]');
    
    wordsToHighlight.forEach(word => {
        //remove special char from start and end
        word = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
                    .replace(/^[.,*+?^${}()|[\]\\]+/, '')
                    .replace(/[.,*+?^${}()|[\]\\]+$/, '');
        highlighted = highlighted.replace(new RegExp(`\\b${word}\\b`, 'gi'), 
                                        `<mark>${word}</mark>`);
        });
    
    el.innerHTML = highlighted;

    // Append content of shadow roots if available
    shadowRoots.forEach(sRoot => {
        const clone = sRoot.cloneNode(true);
        clone.attachShadow({ mode: "open" });
        
        if (sRoot.shadowRoot) {
            clone.innerHTML = sRoot.shadowRoot.innerHTML;
        }
        
        el.appendChild(sRoot);
    });
    return el
}

function createSingleParagraphHighligherButton(document){
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
    img.addEventListener('dragstart', e => e.preventDefault());
    img.alt = "icon";

    // Append image to button
    button.appendChild(img);

    let toggled = false;
    button.addEventListener("click", () => {
        toggled = !toggled;
        img.src = toggled ? chrome.runtime.getURL("images/x.svg") : chrome.runtime.getURL("images/highlighter.svg");;    
        // Find all text-containing elements, in this case just paragraph
        const elements = document.querySelectorAll('p');

        elements.forEach(el => {
            const sRoot = document.createElement("div");
            sRoot.className = 's-root-highlight-text';
            sRoot.id = "s-root-highlight-text";
            sRoot.attachShadow({ mode: "open" });
            
            // Avoid adding multiple buttons
            const oldBtn = el.querySelector('.s-root-highlight-text')
            if (oldBtn) {
                oldBtn.remove();
                return
            };

            if(toggled && el.getAttribute('text-highlighted') === null){
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
                    
                    const text = el.textContent;
                    
                    const toHighlight = extractKeyWords(text);
                    
                    const highlighted = highlightHtml(el, toHighlight);

                    el = highlighted;
                    
                    removeChildByClassName(el, 's-root-highlight-text')
                    el.setAttribute('text-highlighted', 'true');

                    el.style.borderLeft = '2px dashed rgba(0, 128, 0, 0.5)';
                });

                sRoot.shadowRoot?.appendChild(btn);
                el.appendChild(sRoot);
            }
        });
    });
    
    return button
}

function createAllParagraphHighlighterButton(document){
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
    img.src = chrome.runtime.getURL("images/all_highlighter.svg");
    img.style.cssText = `
        width: 100%;
        height: 100%;
        objectFit: contain;
    `;
    img.addEventListener('dragstart', e => e.preventDefault());
    img.alt = "icon";

    // Append image to button
    button.appendChild(img);

    button.addEventListener("click", () => {   
        // Find all text-containing elements, in this case just paragraph
        const elements = document.querySelectorAll('p');

        elements.forEach(el => {
            if(el.getAttribute('text-highlighted') === null){
                const text = el.textContent;
                    
                const toHighlight = extractKeyWords(text);

                const highlighted = highlightHtml(el, toHighlight);

                el = highlighted;
                el.setAttribute('text-highlighted', 'true');
                el.style.borderLeft = '2px dashed rgba(0, 128, 0, 0.5)';
            }
        });
    });
    
    return button
}