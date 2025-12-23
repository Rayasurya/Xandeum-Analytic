import {useLocation} from "react-router-dom";
import React from "react";

export default function useUrlQuery() {
  const {search} = useLocation();
  const [queries, setQueries] = React.useState<URLSearchParams>(new URLSearchParams(search));
  const oldSearch = React.useRef(search);

  React.useEffect(() => {
    if (search === oldSearch.current) {
      return;
    }

    setQueries(new URLSearchParams(search));
    oldSearch.current = search;
  }, [search]);

  return queries;
}
