import React from "react";
import { useUserLayout } from "@/layouts/UserLayout";
import IconChecked from "@/assets/icons/IconChecked";
import IconDashArrowLeft from "@/assets/icons/IconDashArrowLeft";
import IconArrowRight from "@/assets/icons/IconArrowRight";
import "./index.scss";

const PricingPage = () => {
  const userLayout = useUserLayout();
  React.useEffect(() => {
    userLayout.setBreadcrumbs([{ label: "Pricing" }]);

    return () => {
      userLayout.clearBreadcrumbs();
    };
  }, [userLayout]);

  return (
    <div className="pricing-container">
      <div className="pricing">
        <div className="pricing-title">Price</div>
        <div className="pricing-description">
          lorem ipsum dolor sit amet consectetuer adipiscing elit lorem ipsum
          dolor sit amet consectetuer adipiscing elit
        </div>
        <div className="pricing-content">
          <div className="pricing-content-box">
            <div className="pricing-content-box__title">Personal</div>
            <div className="pricing-content-box__price">
              <span className="price">€ 12,99</span>
              <span className="unit">/ user</span>
            </div>
            <div className="pricing-content-box__description">
              <div className="item">
                <span className="icon">
                  <IconChecked />
                </span>
                <span className="text">
                  All features in <b>Personal</b>.
                </span>
              </div>
              <div className="item">
                <span className="icon">
                  <IconChecked />
                </span>
                <span className="text">
                  Unclock <b>Teams</b> to create a work group.
                </span>
              </div>
              <div className="item">
                <span className="icon">
                  <IconChecked />
                </span>
                <span className="text">
                  <b>20GB</b> of shared space.
                </span>
              </div>
            </div>
            <button className="pricing-content-box__btn">
              <span>Choose this plan</span>
              <IconArrowRight />
            </button>
          </div>
          <div className="pricing-content-box pricing-content-box__center">
            <div className="pricing-content-box__discount">-30%</div>
            <div className="pricing-content-box__title">Pro Plan</div>
            <div className="pricing-content-box__price">
              <span className="price">€ 24,90</span>
              <span className="unit">/ user</span>
            </div>
            <div className="pricing-content-box__description">
              <div className="item">
                <span className="icon">
                  <IconChecked />
                </span>
                <span className="text">
                  All features in <b>Personal</b>.
                </span>
              </div>
              <div className="item">
                <span className="icon">
                  <IconChecked />
                </span>
                <span className="text">
                  Unclock <b>Teams</b> to create a work group.
                </span>
              </div>
              <div className="item">
                <span className="icon">
                  <IconChecked />
                </span>
                <span className="text">
                  <b>20GB</b> of shared space.
                </span>
              </div>
            </div>
            <button className="pricing-content-box__btn">
              <span>Choose this plan</span>
              <IconArrowRight />
            </button>
          </div>
          <div className="pricing-content-box">
            <div className="pricing-content-box__title">Enterprise</div>
            <div className="pricing-content-box__price">
              <span className="price">€ 12,99</span>
              <span className="unit">/ user</span>
            </div>
            <div className="pricing-content-box__description">
              <div className="item">
                <span className="icon">
                  <IconChecked />
                </span>
                <span className="text">
                  All features in <b>Personal</b>.
                </span>
              </div>
              <div className="item">
                <span className="icon">
                  <IconChecked />
                </span>
                <span className="text">
                  Unclock <b>Teams</b> to create a work group.
                </span>
              </div>
              <div className="item">
                <span className="icon">
                  <IconChecked />
                </span>
                <span className="text">
                  <b>20GB</b> of shared space.
                </span>
              </div>
            </div>
            <button className="pricing-content-box__btn">
              <span>Choose this plan</span>
              <IconArrowRight />
            </button>
          </div>
        </div>
        <button className="pricing-btn-back">
          <IconDashArrowLeft />
          <span>Back</span>
        </button>
      </div>
    </div>
  );
};

export default PricingPage;
