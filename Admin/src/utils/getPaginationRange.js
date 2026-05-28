
export function getPaginationRange(currentPage, totalPages) {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
        range.push(i);
    }

    if (range[0] > 2) rangeWithDots.push(1, '...');
    else rangeWithDots.push(1);

    rangeWithDots.push(...range);

    if (range[range.length - 1] < totalPages - 1) rangeWithDots.push('...', totalPages);
    else rangeWithDots.push(totalPages);

    return rangeWithDots;
}