import IconCat from "@/assets/icons/IconCat";
import IconPlus from "@/assets/icons/IconPlus";
import Button from "../Button/Button";
import "./CardItem.scss";

type TCardItemProps = {
  objName?: string;
  objSub?: string;
  objPrice?: number;
  buttonText?: string;
  onClick?: () => void;
};

const CardItem = (props: TCardItemProps) => {
  const { objName, objSub, objPrice, buttonText = "Add", onClick } = props;
  return (
    <div className="c-object">
      <div className="c-object__thumb">
        {[1, 2, 3].map((cat) => (
          <IconCat key={`key-${cat}`} />
        ))}
      </div>
      <div className="c-object__content">
        {objName && <h4 className="c-object__title">{objName}</h4>}
        {objPrice && (
          <p className="c-object__price">{`Price Unit: $ ${objPrice}`}</p>
        )}
        {objSub && <p className="c-object__desc">{objSub}</p>}
        <div className="c-object__action">
          <Button
            type="secondary"
            size="small"
            icon={<IconPlus />}
            className="c-object--add"
            onClick={onClick}
          >
            {buttonText}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CardItem;
