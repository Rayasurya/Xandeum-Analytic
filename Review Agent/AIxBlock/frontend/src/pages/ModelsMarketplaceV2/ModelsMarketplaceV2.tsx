import { default as BaseMarketplace } from "@/components/ModelMarketplace/Index";
import { useCallback } from "react";
import { TModelMarketplace } from "@/models/modelMarketplace";
import styles from "./ModelsMarketplaceV2.module.scss";
import { useNavigate } from "react-router-dom";

export default function ModelsMarketplaceV2() {
  const navigate = useNavigate();

  const onDetailClick = useCallback((item: TModelMarketplace) => {
    navigate("/models-marketplace/" + item.id);
  }, [navigate]);

  return (
    <div className={styles.container}>
      <BaseMarketplace
        pageUrl="/models-marketplace"
        onDetailClick={onDetailClick}
        tasksFilter={true}
      />
    </div>
  );
}
