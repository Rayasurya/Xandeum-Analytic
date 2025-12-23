import {Navigate, useParams} from "react-router-dom";

export default function Fallback() {
  const params = useParams();
  return <Navigate to={"/projects/" + params["projectID"] + "/data"} />
}
