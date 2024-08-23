'use client'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from '@/components/ui/pagination'

/**
 * Pagination component
 */
export default function PaginationComponent({
  totalPages,
  currentPage,
  handleInputChange,
}) {
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1)

  return (
    <div className="flex justify-center items-center my-4">
      <Pagination>
        <PaginationContent>
          Page:
          {currentPage > 1 && (
            <PaginationItem>
              <PaginationLink
                href="#"
                onClick={() =>
                  handleInputChange({
                    target: { name: 'page', value: 1 },
                  })
                }
              >
                First
              </PaginationLink>
            </PaginationItem>
          )}
          {currentPage > 1 && (
            <PaginationItem>
              <PaginationPrevious
                href={'#'}
                onClick={() =>
                  handleInputChange({
                    target: { name: 'page', value: currentPage - 1 },
                  })
                }
              />
            </PaginationItem>
          )}
          {pageNumbers.length > 5 && currentPage > 2 && <PaginationEllipsis />}
          {pageNumbers.map((page) => {
            if (
              page === currentPage - 1 ||
              page === currentPage ||
              page === currentPage + 1
            ) {
              return (
                <PaginationItem key={page}>
                  <PaginationLink
                    href="#"
                    className={`mx-2 px-4 py-2 rounded-lg ${
                      page === currentPage ? 'bg-db text-white' : ''
                    }`}
                    onClick={() =>
                      handleInputChange({
                        target: { name: 'page', value: page },
                      })
                    }
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              )
            }
            return null
          })}
          {pageNumbers.length > 5 && currentPage < totalPages - 1 && (
            <PaginationEllipsis />
          )}
          {currentPage < totalPages && (
            <PaginationItem>
              <PaginationNext
                href={'#'}
                onClick={() =>
                  handleInputChange({
                    target: { name: 'page', value: currentPage + 1 },
                  })
                }
              />
            </PaginationItem>
          )}
          {currentPage < totalPages && (
            <PaginationItem>
              <PaginationLink
                href="#"
                onClick={() =>
                  handleInputChange({
                    target: { name: 'page', value: totalPages },
                  })
                }
              >
                Last
              </PaginationLink>
            </PaginationItem>
          )}
        </PaginationContent>
      </Pagination>
    </div>
  )
}
