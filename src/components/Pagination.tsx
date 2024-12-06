import { Group, Pagination as MantinePagination } from '@mantine/core';
import classes from './Pagination.module.css';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

const Pagination = ({ currentPage, totalPages, onPageChange }: PaginationProps) => {
    return (
        <Group justify="center" className={classes.paginationWrapper}>
            <MantinePagination 
                value={currentPage}
                onChange={onPageChange}
                total={totalPages}
                radius="xl"
                siblings={1}
                boundaries={1}
                withControls
                withEdges={false}
            />
        </Group>
    );
} 

export default Pagination;