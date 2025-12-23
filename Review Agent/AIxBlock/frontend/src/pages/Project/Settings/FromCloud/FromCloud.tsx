import IconPlus from "@/assets/icons/IconPlus";
import "./FromCloud.scss";

const FromCloud = () => {
  return (
    <div className="c-fromcloud">
      <div className="c-fromcloud__header">
        <h3 className="c-fromcloud__header__title">
          Use cloud or database storage as the source for your labeling tasks or
          the target of your completed annotations.
        </h3>
        <div className="c-fromcloud__header__buttons">
          <button className="c-fromcloud__header__button">
            <IconPlus />
            Source Cloud Storage
          </button>
          <button className="c-fromcloud__header__button">
            <IconPlus />
            Target Cloud Storage
          </button>
        </div>
      </div>
      <div className="c-fromcloud__body">
        <div className="c-fromcloud__body__section">
          <div className="c-fromcloud__body__section__title-target">Target</div>
          <div className="c-fromcloud__body__section__content">
            <div className="c-fromcloud__body__section__content__row">
              <div className="c-fromcloud__body__section__content__row__label">
                URL
              </div>
              <div className="c-fromcloud__body__section__content__row__value">
                sin1.contaboo.com...
              </div>
            </div>
            <div className="c-fromcloud__body__section__content__row">
              <div className="c-fromcloud__body__section__content__row__label">
                Type
              </div>
              <div className="c-fromcloud__body__section__content__row__value">
                AWS S3
              </div>
            </div>
            <div className="c-fromcloud__body__section__content__row">
              <div className="c-fromcloud__body__section__content__row__label">
                Bucket
              </div>
              <div className="c-fromcloud__body__section__content__row__value">
                https://app.aixblock.io:8027
              </div>
            </div>
            <div className="c-fromcloud__body__section__content__row">
              <div className="c-fromcloud__body__section__content__row__label">
                Last Sync
              </div>
              <div className="c-fromcloud__body__section__content__row__value">
                https://app.aixblock.io:8027
              </div>
            </div>
            <div className="c-fromcloud__footer">
              <button className="c-fromcloud__footer__button">
                Sync Storage
              </button>
            </div>
          </div>
        </div>
        <div className="c-fromcloud__body__section">
          <div className="c-fromcloud__body__section__title-source">Source</div>
          <div className="c-fromcloud__body__section__content">
            <div className="c-fromcloud__body__section__content__row">
              <div className="c-fromcloud__body__section__content__row__label">
                URL
              </div>
              <div className="c-fromcloud__body__section__content__row__value">
                sin1.contaboo.com...
              </div>
            </div>
            <div className="c-fromcloud__body__section__content__row">
              <div className="c-fromcloud__body__section__content__row__label">
                Type
              </div>
              <div className="c-fromcloud__body__section__content__row__value">
                AWS S3
              </div>
            </div>
            <div className="c-fromcloud__body__section__content__row">
              <div className="c-fromcloud__body__section__content__row__label">
                Bucket
              </div>
              <div className="c-fromcloud__body__section__content__row__value">
                https://app.aixblock.io:8027
              </div>
            </div>
            <div className="c-fromcloud__body__section__content__row">
              <div className="c-fromcloud__body__section__content__row__label">
                Last Sync
              </div>
              <div className="c-fromcloud__body__section__content__row__value">
                https://app.aixblock.io:8027
              </div>
            </div>
            <div className="c-fromcloud__footer">
              <button className="c-fromcloud__footer__button">
                Sync Storage
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FromCloud;
