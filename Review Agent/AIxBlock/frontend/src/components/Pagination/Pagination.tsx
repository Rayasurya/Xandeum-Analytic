import React from "react";
import "./Pagination.scss";
import { useNavigate } from "react-router-dom";
import IconArrowRightBold from "@/assets/icons/IconArrowRightBold";
import IconArrowLeftBold from "@/assets/icons/IconArrowLeftBold";
import Select from "../Select/Select";

export type TProps = {
  disabled?: boolean;
  page: number;
  pageSize: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  total: number;
  target?: string;
};

export default function Pagination({
  disabled,
  page,
  pageSize,
  setPage,
  total,
  target,
}: TProps) {
  const pages = React.useMemo(() => {
    return Math.ceil(total / pageSize);
  }, [total, pageSize]);
  const navigate = useNavigate();

  const getLink = React.useCallback((page: number) => {
    let t = target;

    if (t?.startsWith("/")) {
      t = t?.substring(1);
    }

    if ((t?.indexOf("?") ?? -1) > -1) {
      return `/${t}&page=${page}`;
    }

    return `/${t}?page=${page}`;
  }, [target]);

  const pageButtons = React.useMemo(() => {
    const buttons = [];

    const onSelectedPage = (i: number) => {
      setPage && setPage(i);
      target && navigate(getLink(i));
    };

    const addPage = (i: number) => {
      const activeClass = i === page ? " c-pagination__page--active" : "";

      buttons.push(
        <button
          className={
            "c-pagination__page c-pagination__page--number" + activeClass
          }
          disabled={disabled || page === i}
          key={"pagination-page-" + i}
          onClick={() => onSelectedPage(i)}
        >
          {i}
        </button>
      );
    }

    if (page < 6) {
      for (let i = 1; i <= page; i++) {
        addPage(i);
      }
    } else {
      addPage(1);
      buttons.push(<span key="pagination-page-more-before">...</span>)

      for (let i = page - 3; i <= page; i++) {
        addPage(i)
      }
    }

    if (pages - page < 6) {
      for (let i = page + 1; i <= pages; i++) {
        addPage(i)
      }
    } else {
      for (let i = page + 1; i < page + 4; i++) {
        addPage(i);
      }

      buttons.push(<span key="pagination-page-more-after">...</span>)
      addPage(pages);
    }

    return buttons;
  }, [setPage, target, navigate, getLink, pages, page, disabled]);

  const handlePrevClick = () => {
    if (page > 1) {
      setPage(page - 1);
      target && navigate(getLink(page - 1));
    }
  };

  const handleNextClick = () => {
    if (page < pages) {
      setPage(page + 1);
      target && navigate(getLink(page + 1));
    }
  };

  if (pages === 1) {
    return null;
  }

  return (
    <div className="c-pagination">
      <button
        className="c-pagination__page c-pagination__page--prev"
        disabled={disabled || page === 1}
        onClick={handlePrevClick}
      >
        <IconArrowLeftBold />
      </button>
      {pageButtons}
      <button
        className="c-pagination__page c-pagination__page--next"
        disabled={disabled || page >= pages}
        onClick={handleNextClick}
      >
        <IconArrowRightBold />
      </button>
      <div className="c-pagination__page c-pagination__page--spliter"></div>
      <div className="c-pagination__page c-pagination__page--page-select">
        <span>Results per page:</span>
        <Select
          data={[
            {
              label: "",
              options: [{ label: pageSize.toString(), value: pageSize.toString() }],
            },
          ]}
          defaultValue={{ label: pageSize.toString(), value: pageSize.toString() }}
        />
      </div>
    </div>
  );
}
