import { computed, ref } from 'vue';

const LoaderService = () => {
    const count = ref(0);

    const show = () => {
        count.value++;
    };

    const hide = () => {
        if (count.value > 0) {
            count.value--;
        }
    };

    const isActive = computed(() => count.value > 0);

    return {
        show,
        hide,
        isActive
    };
};

export default LoaderService();
