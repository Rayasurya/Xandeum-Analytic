import { IconLoading } from "@/assets/icons/Index";
import "./AppLoading.scss";

export type TProps = {
  message?: string | React.ReactNode,
}

export default function AppLoading({ message }: TProps = {
  message: "Loading...",
}) {
  return (
    <div className="app-loading-container">
      <IconLoading />
      <b>{message}</b>
    </div>
  );
}

