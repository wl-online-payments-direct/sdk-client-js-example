/**
 * A loader component.
 * Other components can independently show or hide the loader. Calling show or hide takes this into consideration,
 * so the loader is not displayed twice, or not removed before all callers remove it.
 *
 * @returns {{show: function:void, hide: function:void}}
 * @constructor
 */
const Loader = () => {
    let loadingCount = 0;
    const selectorClass = 'loading-overlay';

    /**
     * Displays the loader.
     */
    const show = () => {
        loadingCount++;
        // display only if it was not already displayed.
        if (!document.querySelector(`.${selectorClass}`)) {
            const div = document.createElement('div');
            div.classList.add(selectorClass);
            div.innerHTML = '<div class="loader"></div>';
            document.body.appendChild(div);
        }
    };

    /**
     * Hides the loader.
     */
    const hide = () => {
        loadingCount !== 0 && loadingCount--;
        // hide only if this is the last stacked call.
        if (loadingCount === 0) {
            document.querySelector(`.${selectorClass}`)?.remove();
        }
    };

    return {
        show,
        hide
    };
};

export default Loader();
