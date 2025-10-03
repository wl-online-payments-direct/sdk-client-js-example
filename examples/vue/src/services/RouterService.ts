import type { Router } from 'vue-router';

const RouterService = (router: Router) => {
    const redirectToPage = (url: string) => {
        router.push(url).catch((err) => console.error(err));
    };

    return { redirectToPage };
};

export default RouterService;
