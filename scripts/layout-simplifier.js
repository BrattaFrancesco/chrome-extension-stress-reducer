function createRemoveElementsButton(document){
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
    img.src = chrome.runtime.getURL("images/visibility_off.svg");
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
        img.src = toggled ? chrome.runtime.getURL("images/x.svg") : chrome.runtime.getURL("images/visibility_off.svg");;    
        
        let lastElement = null;
        let lastRemoved = null;

        const blurStyle = '2px';
        const originalOutline = new WeakMap();

        function isExcluded(el) {
            return el.closest("#s-root-floating-menu") !== null || el === document.body || el === document.documentElement;
        }

        function onMouseOver(e) {
            if (!toggled) return;
            e.stopPropagation();

            const el = e.target;
            if (isExcluded(el)) return;

            if (!originalOutline.has(el)) {
            originalOutline.set(el, el.style.outline);
            }
            el.style.filter = `blur(${blurStyle})`;
            el.style.outline = '2px dashed red';
            lastElement = el;
        }

        function onMouseOut(e) {
            if (!toggled) return
            const el = e.target;
            if(isExcluded(el)) return;

            el.style.filter = '';
            el.style.outline = originalOutline.get(el) || '';
        }

        function onClick(e) {
            e.preventDefault();
            e.stopPropagation();

            const el = e.target;
            if (el.closest("#s-root-floating-menu")) {
                toggled = !toggled;
                document.removeEventListener('mouseover', onMouseOver, true);
                document.removeEventListener('mouseout', onMouseOut, true);
                document.removeEventListener('click', onClick, true);
                document.addEventListener('keydown', onKeyDown, true);
                if (lastElement) {
                    lastElement.style.filter = '';
                    lastElement.style.outline = '';
                }
                img.src = chrome.runtime.getURL("images/visibility_off.svg");
                return
            }
            if(isExcluded(el)) return;

            el.style.filter = '';
            el.style.outline = originalOutline.get(el) || '';
            lastRemoved = {
                element: el,
                parent: el.parentNode,
                nextSibling: el.nextSibling
            };

            el.remove(); // This removes the element from the DOM
        }

        function onKeyDown(e) {
            if (e.ctrlKey && e.key === 'z') {
              if (lastRemoved && lastRemoved.parent) {
                const { element, parent, nextSibling } = lastRemoved;
                parent.insertBefore(element, nextSibling);
                lastRemoved = null;
              }
            } else if(e.key === 'Escape') {
                toggled = !toggled;
                document.removeEventListener('mouseover', onMouseOver, true);
                document.removeEventListener('mouseout', onMouseOut, true);
                document.removeEventListener('click', onClick, true);
                document.addEventListener('keydown', onKeyDown, true);
                if (lastElement) {
                    lastElement.style.filter = '';
                    lastElement.style.outline = '';
                }
                img.src = chrome.runtime.getURL("images/visibility_off.svg");
                return
            }
          }

        if (toggled) {
            document.addEventListener('mouseover', onMouseOver, true);
            document.addEventListener('mouseout', onMouseOut, true);
            document.addEventListener('click', onClick, true);
            document.addEventListener('keydown', onKeyDown, true);
        }
    });
    
    return button
}

function createHideElementsButton(document){
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
    img.src = chrome.runtime.getURL("images/collapse_elements.svg");
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
        img.src = toggled ? chrome.runtime.getURL("images/x.svg") : chrome.runtime.getURL("images/collapse_elements.svg");;    
        
        let lastElement = null;

        const blurStyle = '2px';
        const originalOutline = new WeakMap();

        function isExcluded(el) {
            return el.closest("#s-root-floating-menu") !== null 
                   || el.closest("#restore-button") 
                   || el === document.body 
                   || el === document.documentElement;
        }

        function onMouseOver(e) {
            if (!toggled) return;
            e.stopPropagation();

            const el = e.target;
            if (isExcluded(el)) return;

            if (!originalOutline.has(el)) {
            originalOutline.set(el, el.style.outline);
            }
            el.style.filter = `blur(${blurStyle})`;
            el.style.outline = '2px dashed red';
            lastElement = el;
        }

        function onMouseOut(e) {
            if (!toggled) return
            const el = e.target;
            if(isExcluded(el)) return;

            el.style.filter = '';
            el.style.outline = originalOutline.get(el) || '';
        }

        function createRestoreButton(originalEl) {
            originalEl.style.filter = '';
            originalEl.style.outline = originalOutline.get(originalEl) || '';

            const sRoot = document.createElement("div");
            sRoot.className = "s-root-restore-button"
            sRoot.attachShadow({ mode: "open" });

            const placeholder = document.createElement('button');
            placeholder.id = 'restore-button';
            placeholder.style.height = '24px';
            placeholder.style.width = '24px';
            placeholder.style.border = 'none';
            placeholder.style.borderRadius = '100%';
            placeholder.style.backgroundColor = 'rgba(226, 226, 226, 1.00)';
            placeholder.style.cursor = 'pointer';

            // Create the image inside the button
            const placeholderImg = document.createElement("img");
            placeholderImg.src = chrome.runtime.getURL("images/expand_content.svg");
            placeholderImg.style.cssText = `
                width: 100%;
                height: 100%;
                objectFit: contain;
            `;
            placeholderImg.addEventListener('dragstart', e => e.preventDefault());
            placeholderImg.alt = "icon";

            // Append image to button
            placeholder.appendChild(placeholderImg);
        
            placeholder.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                sRoot.replaceWith(originalEl);
            });
        
            sRoot.shadowRoot?.appendChild(placeholder);
            return sRoot;
        }

        function onClick(e) {
            e.preventDefault();
            e.stopPropagation();

            const el = e.target;
            if (el.closest("#s-root-floating-menu")) {
                toggled = !toggled;
                document.removeEventListener('mouseover', onMouseOver, true);
                document.removeEventListener('mouseout', onMouseOut, true);
                document.removeEventListener('click', onClick, true);
                document.addEventListener('keydown', onKeyDown, true);

                if (lastElement) {
                    lastElement.style.filter = '';
                    lastElement.style.outline = '';
                }
                img.src = chrome.runtime.getURL("images/collapse_elements.svg");
                return
            }
            if(isExcluded(el)) return;

            const restoreButton = createRestoreButton(el);
            el.replaceWith(restoreButton);
        }

        function onKeyDown(e) {
            if(e.key === 'Escape') {
                toggled = !toggled;
                document.removeEventListener('mouseover', onMouseOver, true);
                document.removeEventListener('mouseout', onMouseOut, true);
                document.removeEventListener('click', onClick, true);
                document.addEventListener('keydown', onKeyDown, true);
                if (lastElement) {
                    lastElement.style.filter = '';
                    lastElement.style.outline = '';
                }
                img.src = chrome.runtime.getURL("images/collapse_elements.svg");
                return
            }
          }

        if (toggled) {
            document.addEventListener('mouseover', onMouseOver, true);
            document.addEventListener('mouseout', onMouseOut, true);
            document.addEventListener('click', onClick, true);
            document.addEventListener('keydown', onKeyDown, true);
        }
    });
    
    return button
}