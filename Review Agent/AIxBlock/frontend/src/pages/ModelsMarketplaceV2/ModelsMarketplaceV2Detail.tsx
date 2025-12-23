import ModelDetail from "@/components/ModelMarketplace/ModelDetail/Index";
import { useNavigate } from "react-router-dom";
import { useCallback } from "react";

export default function ModelsMarketplaceV2Detail() {
  const navigate = useNavigate();

  const onBack = useCallback(() => {
    navigate("/models-marketplace");
  }, [navigate]);

  const onCompleted = useCallback(() => {}, []);

  return (
    <ModelDetail
      onBackClick={onBack}
      onCompleted={onCompleted}
    />
  )
}
