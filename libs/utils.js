function removeChildByClassName(el, className){
    const elements = el.querySelectorAll('.'+className);
    elements.forEach(el => {
        el.remove();
    });
}