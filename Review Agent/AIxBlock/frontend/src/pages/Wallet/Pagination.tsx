import React from "react";
import IconArrowLeftBold from "@/assets/icons/IconArrowLeftBold";
import IconArrowRightBold from "@/assets/icons/IconArrowRightBold";
import "./Pagination.scss";

export type TProps = {
  page: number;
  pageSize: number;
  total: number;
  disabled?: boolean;
  setPage: (page: number) => void;
};

export default function Pagination({
  disabled,
  page,
  pageSize,
  setPage,
  total,
}: TProps) {
  const pages = React.useMemo(() => {
    return Math.ceil(total / pageSize);
  }, [total, pageSize]);

  const pageButtons = React.useMemo(() => {
    const buttons = [];

    const onSelectedPage = (i: number) => {
      setPage && setPage(i);
    };

    for (let i = 1; i <= pages; i++) {
      const activeClass = i === page ? " wallet-pagination__page-active" : "";
      buttons.push(
        <button
          className={"wallet-pagination__page" + activeClass}
          disabled={disabled || page === i}
          key={"pagination-page-" + i}
          onClick={() => onSelectedPage(i)}
        >
          {i}
        </button>
      );
    }

    return buttons;
  }, [disabled, page, pages, setPage]);

  const handlePrevClick = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const handleNextClick = () => {
    if (page < pages) {
      setPage(page + 1);
    }
  };

  if (pages === 1) {
    return null;
  }

  return (
    <div className="wallet-pagination">
      <button
        className="wallet-pagination__page wallet-pagination__page-prev"
        disabled={disabled || page === 1}
        onClick={handlePrevClick}
      >
        <IconArrowLeftBold />
      </button>
      {pageButtons}
      <button
        className="wallet-pagination__page wallet-pagination__page-next"
        disabled={disabled || page >= pages}
        onClick={handleNextClick}
      >
        <IconArrowRightBold />
      </button>
      <div className="wallet-pagination-result">
        <span>Results per page:</span>
        <div className="wallet-pagination-result__number">
          <span>{page}</span>
          <IconArrowLeftBold />
        </div>
      </div>
    </div>
  );
}
