import translations from '../../translations/translations.ts';

const NotFoundPage = () => {
    return (
        <div className='flex center flex-expand'>
            <h1>{translations.page_not_found_404}</h1>
        </div>
    );
};

export default NotFoundPage;
