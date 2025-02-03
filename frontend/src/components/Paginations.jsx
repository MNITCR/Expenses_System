import React from 'react'; // Import useState
import { Pagination } from 'flowbite-react';
import { useTranslation } from 'react-i18next';

const Paginations = ({ currentPage, totalPages, onPageChange }) => {
    const { t,i18n } = useTranslation()
    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
          onPageChange(page);
        }
    };

    if (totalPages <= 1) {
        return null;
    }
    return (
        <div className={`mt-2 ${i18n.language === 'km' ? "font-kh_siemreap" : ""}`} >
            <Pagination
                layout="pagination"
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                previousLabel={t('back')}
                nextLabel={t('next')}
                showIcons
            />
        </div>
    );
};

export default Paginations;
